import { TaskStatus } from "./task.types.js";

export interface CreateTaskDTO {
    title: string;
    description?: string;
}

export interface UpdateTaskDTO {
    title?: string;
    description?: string;
    status?: TaskStatus;
}

export interface TaskResponseDTO {
    _id: string;
    userId: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    taskDate: Date;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export const toTaskResponseDTO = (task: any): TaskResponseDTO => ({
    _id: task._id.toString(),
    userId: task.userId.toString(),
    title: task.title,
    description: task.description ?? null,
    status: task.status,
    taskDate: task.taskDate,
    completedAt: task.completedAt ?? null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
});

export interface TasksByDateDTO {
    date: Date;
    tasks: TaskResponseDTO[];
    total: number;
}