import { ArchivedTask } from "./archived-task.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { toArchivedTaskResponseDTO } from "./archived-task.dto.js";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import type { Types } from "mongoose";

const getStartOfDayInTimezone = (date: Date, timezone: string): Date => {
    const zoned = toZonedTime(date, timezone);
    zoned.setHours(0, 0, 0, 0);
    return fromZonedTime(zoned, timezone);
};


export const getArchivedTasksByDate = async (
    userId: Types.ObjectId,
    timezone: string,
    date: string
) => {
    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
        throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
    }

    const start = getStartOfDayInTimezone(parsed, timezone);

    const tasks = await ArchivedTask.find({
        userId,
        taskDate: start
    })
        .sort({ originalCreatedAt: -1 })
        .lean();

    const completed = tasks.filter((t) => t.finalStatus === "completed").length;
    const pending = tasks.filter((t) => t.finalStatus === "pending").length;
    const not_completed = tasks.filter((t) => t.finalStatus === "not_completed").length;
    const completionPct = tasks.length > 0
        ? Math.round((completed / tasks.length) * 100)
        : 0;

    return {
        date: start,
        tasks: tasks.map(toArchivedTaskResponseDTO),
        total: tasks.length,
        stats: { completed, pending, not_completed, completionPct },
    };
};

export const getArchivedDates = async (userId: Types.ObjectId) => {

    const dates = await ArchivedTask.distinct("taskDate", { userId });
    return dates.sort((a, b) => b.getTime() - a.getTime());
};