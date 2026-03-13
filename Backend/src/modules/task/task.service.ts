import { Task } from "./task.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { toTaskResponseDTO, type CreateTaskDTO, type UpdateTaskDTO } from "./task.dto.js";
import { TaskStatus } from "./task.types.js";
import type { Types } from "mongoose";
import { toZonedTime, fromZonedTime } from "date-fns-tz";




// Helpers

const getStartOfDayInTimezone = (timezone: string): Date => {
    const now = new Date();
    const zoned = toZonedTime(now, timezone);
    zoned.setHours(0, 0, 0, 0);
    return fromZonedTime(zoned, timezone);
};



export const createTask = async (userId: Types.ObjectId, timezone: string, data: CreateTaskDTO) => {
    const today = getStartOfDayInTimezone(timezone);

    const task = await Task.create({
        userId,
        title: data.title,
        description: data.description ?? null,
        status: TaskStatus.PENDING,
        taskDate: today,
    });

    return toTaskResponseDTO(task);
};


export const getTaskById = async (taskId: string, userId: Types.ObjectId) => {
    const task = await Task.findById(taskId).lean();

    if (!task) throw new ApiError(404, "Task not found");

    if (task.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to access this task");
    }

    return toTaskResponseDTO(task);
};

export const getTodayTasks = async (userId: Types.ObjectId, timezone: string) => {
    const today = getStartOfDayInTimezone(timezone);

    const tasks = await Task.find({ userId, taskDate: today })
        .sort({ createdAt: -1 })
        .lean();

    return {
        date: today,
        tasks: tasks.map(toTaskResponseDTO),
        total: tasks.length,
    };
};

export const updateTask = async (
    taskId: string,
    userId: Types.ObjectId,
    data: UpdateTaskDTO
) => {
    const task = await Task.findById(taskId);

    if (!task) throw new ApiError(404, "Task not found");

    if (task.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this task");
    }

    if (data.title) task.title = data.title;
    if (data.description !== undefined) task.description = data.description ?? null;

    if (data.status && data.status !== task.status) {
        if (data.status === TaskStatus.COMPLETED) {
            task.completedAt = new Date();
        } else {
            task.completedAt = null;
        }
        task.status = data.status;
    }

    await task.save();

    return toTaskResponseDTO(task);
};


export const deleteTask = async (taskId: string, userId: Types.ObjectId) => {
    const task = await Task.findById(taskId);

    if (!task) throw new ApiError(404, "Task not found");

    if (task.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this task");
    }

    await task.deleteOne();

    return { message: "Task deleted successfully" };
};

