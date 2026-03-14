import { Schema, model } from "mongoose";
import type { IArchivedTaskDocument } from "./archived-task.types.js";

const archivedTaskSchema = new Schema<IArchivedTaskDocument>(
    {
        originalTaskId: {
            type: Schema.Types.ObjectId,
            required: true,
            unique: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: null,
        },
        finalStatus: {
            type: String,
            enum: ["completed", "pending", "not_completed"],
            required: true,
        },
        taskDate: {
            type: Date,
            required: true,
            index: true,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        originalCreatedAt: {
            type: Date,
            required: true,
        },
        archivedAt: {
            type: Date,
            default: () => new Date(),
        },
    },
    {
        timestamps: false,
    }
);

archivedTaskSchema.index({ userId: 1, taskDate: -1 });

export const ArchivedTask = model<IArchivedTaskDocument>("ArchivedTask", archivedTaskSchema);