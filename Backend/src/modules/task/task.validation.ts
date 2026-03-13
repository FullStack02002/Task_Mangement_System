import { z } from "zod";
import { TaskStatus } from "./task.types.js";

export const createTaskSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(1, "Title is required")
            .max(200, "Title must be at most 200 characters")
            .trim(),

        description: z
            .string()
            .max(2000, "Description must be at most 2000 characters")
            .trim()
            .optional(),
    }).strict(),
});

export const updateTaskSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(1, "Title cannot be empty")
            .max(200, "Title must be at most 200 characters")
            .trim()
            .optional(),

        description: z
            .string()
            .max(2000, "Description must be at most 2000 characters")
            .trim()
            .optional(),

        status: z
            .nativeEnum(TaskStatus, {
                error: `Status must be one of: ${Object.values(TaskStatus).join(", ")}`,
            })
            .optional(),
    }).strict(),

    params: z.object({
        id: z.string().min(1, "Task ID is required"),
    }),
});

export const taskIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Task ID is required"),
    }),
});

export const tasksByDateSchema = z.object({
    query: z.object({
        date: z
            .string()
            .min(1, "Date is required")
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskIdParamInput = z.infer<typeof taskIdParamSchema>;
export type TasksByDateInput = z.infer<typeof tasksByDateSchema>;