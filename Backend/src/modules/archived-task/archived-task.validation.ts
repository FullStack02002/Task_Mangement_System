import { z } from "zod";

export const archivedTasksByDateSchema = z.object({
    query: z.object({
        date: z
            .string()
            .min(1, "Date is required")
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    }),
});

export type ArchivedTasksByDateInput = z.infer<typeof archivedTasksByDateSchema>;