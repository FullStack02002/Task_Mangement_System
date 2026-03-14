import type { Document, Types } from "mongoose";

export type FinalStatus = "completed" | "pending" | "not_completed";

export interface IArchivedTask {
    _id: Types.ObjectId;
    originalTaskId: Types.ObjectId;
    userId: Types.ObjectId;
    title: string;
    description: string | null;
    finalStatus: FinalStatus;
    taskDate: Date;
    completedAt: Date | null;
    originalCreatedAt: Date;
    archivedAt: Date;
}

export interface IArchivedTaskDocument extends IArchivedTask, Document { }
