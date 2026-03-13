import type { RequestHandler } from "express";
import { ZodError, ZodObject } from "zod";
import type { ZodRawShape } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const validateRequest = <T extends ZodRawShape>(
    schema: ZodObject<T>
): RequestHandler =>
    async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                params: req.params,
                query: req.query,
            }) as { body?: Record<string, unknown> };

            req.body = parsed.body ?? req.body;
            next();

        } catch (error) {
            if (error instanceof ZodError) {
                const firstError = error.issues[0];

                if (!firstError) {
                    next(new ApiError(400, "Validation failed"));
                    return;
                }

                const field = firstError.path[firstError.path.length - 1];
                const message = field
                    ? `${String(field)}: ${firstError.message}`
                    : firstError.message;

                next(new ApiError(400, message));
            } else {
                next(error);
            }
        }
    };