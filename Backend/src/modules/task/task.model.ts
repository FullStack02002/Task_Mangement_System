import { Schema, model } from "mongoose";
import type { ITaskDocument } from "./task.types.js";
import { TaskStatus } from "./task.types.js";

const taskSchema = new Schema<ITaskDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        description: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: null
        },
        status: {
            type: String,
            enum: Object.values(TaskStatus),
            default: TaskStatus.PENDING
        },
        taskDate: {
            type: Date,
            required: true,
            index: true
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

taskSchema.index({ userId: 1, taskDate: 1 });
taskSchema.index({ userId: 1, status: 1 });

export const Task = model<ITaskDocument>("Task", taskSchema);