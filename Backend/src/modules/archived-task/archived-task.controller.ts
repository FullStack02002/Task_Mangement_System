import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import * as archivedTaskService from "./archived-task.service.js";
import type { IUserDocument } from "../user/user.types.js";

export const getArchivedTasksByDate = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    if (!user) throw new ApiError(401, "Unauthorized");

    const result = await archivedTaskService.getArchivedTasksByDate(
        user._id,
        user.timezone,
        req.query.date as string
    );

    res.status(200).json(
        new ApiResponse(200, result, "Archived tasks fetched successfully")
    );
});

export const getArchivedDates = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    if (!user) throw new ApiError(401, "Unauthorized");

    const dates = await archivedTaskService.getArchivedDates(user._id);

    res.status(200).json(
        new ApiResponse(200, dates, "Archived dates fetched successfully")
    );
});