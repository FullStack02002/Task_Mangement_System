import cron from "node-cron";
import mongoose from "mongoose";
import { User } from "../modules/user/user.model.js";
import { Task } from "../modules/task/task.model.js";
import { ArchivedTask } from "../modules/archived-task/archived-task.model.js";
import { DailySummary } from "../modules/daily-summary/daily-summary.model.js";
import { toZonedTime, format, fromZonedTime } from "date-fns-tz";
import { sendEODSummaryEmail } from "../config/mailer.js";
import { env } from "../config/env.js";


// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const getTimezone = (timezone: string | undefined): string => timezone ?? "UTC";

const getDateStr = (date: Date, timezone: string): string =>
    format(toZonedTime(date, timezone), "yyyy-MM-dd", { timeZone: timezone });

const sendEODNotification = async (
    userId: mongoose.Types.ObjectId,
    stats: {
        totalTasks: number;
        completed: number;
        pending: number;
        notCompleted: number;
        completionPct: number;
        dateStr: string;
        summaryDateStr: string;
    }
) => {
    try {
        const user = await User.findById(userId).select("email name").lean();
        if (!user) return;

        await sendEODSummaryEmail(user.email, user.name, stats);

        // ── mark notification as sent ──
        await DailySummary.updateOne(
            { userId, summaryDate: new Date(stats.summaryDateStr) },
            {
                $set: {
                    "notification.status": "sent",
                    "notification.sentAt": new Date(),
                },
            }
        );

        console.log(`[EOD] ✓ Notification sent to ${user.email}`);

    } catch (error: any) {
        // ── mark notification as failed ──
        await DailySummary.updateOne(
            { userId, summaryDate: new Date(stats.summaryDateStr) },
            {
                $set: {
                    "notification.status": "failed",
                    "notification.failureReason": error?.message ?? "Unknown error",
                },
                $inc: {
                    "notification.retryCount": 1,
                },
            }
        );

        console.error(`[EOD] ✗ Notification failed for userId=${userId}:`, error?.message);
    }
};

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

        // ── task's actual date for email ──
        const firstTask = tasks.find((t) => t.taskDate);
        const taskDateStr = firstTask
            ? getDateStr(firstTask.taskDate, timezone)
            : dateStr;

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
            notification: {
                status: "pending",
                sentAt: null,
                channel: "email",
                retryCount: 0,
            },
        }], { session });

        // ── Step 9: commit ──
        await session.commitTransaction();

        console.log(`[EOD] ✓ userId=${userId} on ${dateStr} | archived=${tasks.length} | completed=${completed} | notCompleted=${notCompleted}`);

        await sendEODNotification(userId, {
            totalTasks: tasks.length,
            completed,
            pending,
            notCompleted,
            completionPct,
            dateStr: taskDateStr,
            summaryDateStr: dateStr
        })

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

                // ── today's midnight in user's timezone (UTC) ──
                const todayZoned = toZonedTime(now, timezone);
                todayZoned.setHours(0, 0, 0, 0);
                const todayStartUTC = fromZonedTime(todayZoned, timezone);

                // ── find stale tasks strictly before today's midnight ──
                const staleTasks = await Task.find({
                    userId: user._id,
                    taskDate: { $lt: todayStartUTC },
                }).lean();

                if (staleTasks.length === 0) return;

                // ── group by taskDate (already stored as midnight UTC per timezone) ──
                const dateGroups = new Map<string, Date>();

                staleTasks.forEach((task) => {
                    // use taskDate directly as the key — it's already midnight in user's tz
                    const key = task.taskDate.toISOString();
                    if (!dateGroups.has(key)) {
                        dateGroups.set(key, task.taskDate);
                    }
                });

                // ── run EOD for each unique missed taskDate ──
                for (const [, taskDate] of dateGroups) {
                    // dateStr for this specific missed day
                    const dateStr = getDateStr(taskDate, timezone);

                    const summaryExists = await DailySummary.findOne({
                        userId: user._id,
                        summaryDate: taskDate,   // match exact stored taskDate
                    }).lean();

                    if (summaryExists) {
                        console.log(`[EOD Recovery] Summary already exists for userId=${user._id} on ${dateStr} — skipping`);
                        continue;
                    }

                    console.log(`[EOD Recovery] Missed EOD for userId=${user._id} on ${dateStr} — running now`);
                    await runEODForUser(user._id, timezone, dateStr);
                }
            })
        );

        console.log("[EOD] Recovery check complete");

    } catch (error) {
        console.error("[EOD] Recovery error:", error);
    }
};


export const startEODJob = () => {

    if (env.NODE_ENV === "production") {
        recoverMissedEOD();
    }

    cron.schedule("* * * * *", async () => {
        await runEODScheduler();
    });

    console.log("[EOD] Cron job registered — checking every minute");
};