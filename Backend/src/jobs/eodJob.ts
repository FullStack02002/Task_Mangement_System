import cron from "node-cron";
import mongoose from "mongoose";
import { User } from "../modules/user/user.model.js";
import { Task } from "../modules/task/task.model.js";
import { ArchivedTask } from "../modules/archived-task/archived-task.model.js";
import { DailySummary } from "../modules/daily-summary/daily-summary.model.js";
import { toZonedTime, format } from "date-fns-tz";

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const getTimezone = (timezone: string | undefined): string => timezone ?? "UTC";

const getDateStr = (date: Date, timezone: string): string =>
    format(toZonedTime(date, timezone), "yyyy-MM-dd", { timeZone: timezone });

// ─────────────────────────────────────────
// Core EOD logic for a single user
// ─────────────────────────────────────────

const runEODForUser = async (
    userId: mongoose.Types.ObjectId,
    timezone: string,
    dateStr: string
) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // ── Step 1: idempotency check ──
        const alreadyRan = await DailySummary.findOne({
            userId,
            summaryDate: new Date(dateStr),
        }).session(session);

        if (alreadyRan) {
            await session.abortTransaction();
            console.log(`[EOD] Already ran for userId=${userId} on ${dateStr} — skipping`);
            return { skipped: true };
        }

        // ── Step 2: fetch all active tasks ──
        const tasks = await Task.find({ userId }).session(session).lean();

        // ── Step 3: no tasks — still mark EOD as ran ──
        if (tasks.length === 0) {
            await DailySummary.create([{
                userId,
                summaryDate: new Date(dateStr),
                stats: {
                    totalTasks: 0,
                    completed: 0,
                    pending: 0,
                    notCompleted: 0,
                    completionPct: 0,
                },
                eodExecutedAt: new Date(),
            }], { session });

            await session.commitTransaction();
            console.log(`[EOD] ✓ userId=${userId} on ${dateStr} | no tasks`);
            return { skipped: false, archived: 0 };
        }

        // ── Step 4: compute stats ──
        const completed = tasks.filter((t) => t.status === "completed").length;
        const pending = tasks.filter((t) => t.status === "pending").length;
        const notCompleted = tasks.filter((t) => t.status === "in_progress").length;
        const completionPct = Math.round((completed / tasks.length) * 100);

        // ── Step 5: build archive documents ──
        const archivedDocs = tasks.map((task) => ({
            originalTaskId: task._id,
            userId: task.userId,
            title: task.title,
            description: task.description ?? null,
            finalStatus: task.status === "in_progress" ? "not_completed" : task.status,
            taskDate: task.taskDate,
            completedAt: task.completedAt ?? null,
            originalCreatedAt: task.createdAt,
            archivedAt: new Date(),
        }));

        // ── Step 6: insert into archived_tasks ──
        await ArchivedTask.insertMany(archivedDocs, {
            session,
            ordered: false,
        });

        // ── Step 7: delete from active tasks ──
        await Task.deleteMany({ userId }).session(session);

        // ── Step 8: create daily summary ──
        await DailySummary.create([{
            userId,
            summaryDate: new Date(dateStr),
            stats: {
                totalTasks: tasks.length,
                completed,
                pending,
                notCompleted,
                completionPct,
            },
            eodExecutedAt: new Date(),
        }], { session });

        // ── Step 9: commit ──
        await session.commitTransaction();

        console.log(`[EOD] ✓ userId=${userId} on ${dateStr} | archived=${tasks.length} | completed=${completed} | notCompleted=${notCompleted}`);

        return {
            skipped: false,
            archived: tasks.length,
            stats: { completed, pending, notCompleted, completionPct },
        };

    } catch (error: any) {
        await session.abortTransaction();

        if (error?.code === 11000) {
            console.log(`[EOD] Duplicate key — already ran for userId=${userId} on ${dateStr}`);
            return { skipped: true };
        }

        console.error(`[EOD] ✗ Failed for userId=${userId}:`, error?.message);
        throw error;

    } finally {
        session.endSession();
    }
};

// ─────────────────────────────────────────
// Regular scheduler — runs every minute
// ─────────────────────────────────────────

const runEODScheduler = async () => {
    try {
        const now = new Date();
        const users = await User.find({}).select("_id timezone").lean();

        const usersAtMidnight = users.filter((user) => {
            const timezone = getTimezone(user.timezone);
            const zoned = toZonedTime(now, timezone);
            const hours = zoned.getHours();
            const minutes = zoned.getMinutes();
            return hours === 0 && minutes >= 0 && minutes <= 4;
        });

        if (usersAtMidnight.length === 0) return;

        console.log(`[EOD] ${usersAtMidnight.length} user(s) at midnight`);

        await Promise.allSettled(
            usersAtMidnight.map((user) => {
                const timezone = getTimezone(user.timezone);
                const dateStr = getDateStr(now, timezone);
                return runEODForUser(user._id, timezone, dateStr);
            })
        );

    } catch (error) {
        console.error("[EOD] Scheduler error:", error);
    }
};

// ─────────────────────────────────────────
// Recovery — runs once on server startup
// only in production — handles missed EOD
// due to server crash or downtime
// ─────────────────────────────────────────

export const recoverMissedEOD = async () => {
    try {
        console.log("[EOD] Checking for missed EOD jobs...");

        const now = new Date();
        const users = await User.find({}).select("_id timezone").lean();

        await Promise.allSettled(
            users.map(async (user) => {
                const timezone = getTimezone(user.timezone);
                const zoned = toZonedTime(now, timezone);

                // ── only recover if EOD window has passed (after 00:05) ──
                const hours = zoned.getHours();
                const minutes = zoned.getMinutes();
                const pastMidnightWindow = hours > 0 || (hours === 0 && minutes > 4);
                if (!pastMidnightWindow) return;

                // ── get today's date string in user's timezone ──
                const todayStr = getDateStr(now, timezone);
                const todayStart = new Date(todayStr);

                // ── EOD already ran today — skip ──
                const summaryExists = await DailySummary.findOne({
                    userId: user._id,
                    summaryDate: todayStart,
                }).lean();

                if (summaryExists) return;

                // ── only archive tasks from BEFORE today ──
                // prevents archiving today's tasks on normal deployments
                const staleTasks = await Task.findOne({
                    userId: user._id,
                    taskDate: { $lt: todayStart },
                }).lean();

                if (!staleTasks) return;

                console.log(`[EOD Recovery] Missed EOD for userId=${user._id} on ${todayStr} — running now`);
                await runEODForUser(user._id, timezone, todayStr);
            })
        );

        console.log("[EOD] Recovery check complete");

    } catch (error) {
        console.error("[EOD] Recovery error:", error);
    }
};

// ─────────────────────────────────────────
// Start — called once from server.ts
// ─────────────────────────────────────────

export const startEODJob = () => {

    recoverMissedEOD();

    cron.schedule("* * * * *", async () => {
        await runEODScheduler();
    });

    console.log("[EOD] Cron job registered — checking every minute");
};
