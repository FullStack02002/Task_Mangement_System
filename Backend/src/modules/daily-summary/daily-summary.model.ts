import { Schema, model } from "mongoose";

const dailySummarySchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        summaryDate: {
            type: Date,
            required: true,
        },
        stats: {
            totalTasks: { type: Number, default: 0 },
            completed: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
            notCompleted: { type: Number, default: 0 },
            completionPct: { type: Number, default: 0 },
        },
        eodExecutedAt: {
            type: Date,
            default: () => new Date(),
        },
    },
    { timestamps: true }
);

dailySummarySchema.index({ userId: 1, summaryDate: 1 }, { unique: true });

export const DailySummary = model("DailySummary", dailySummarySchema);