import type { Document, Types } from "mongoose";

export enum TaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
}

export interface ITask {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    title: string;
    description: string | null;
    status: TaskStatus;
    taskDate: Date;
    completedAt: Date | null;
}

export interface ITaskDocument extends ITask, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface ITaskResponse {
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