import * as taskService from "./task.service.js"
import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import type { ITaskDocument } from "./task.types.js";
import type { IUserDocument } from "../user/user.types.js";
import type { CreateTaskDTO, UpdateTaskDTO } from "./task.dto.js";



export const createTask = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    const { title, description } = req.body;

    if (!user) throw new ApiError(401, "Unauthorized");

    const data: CreateTaskDTO = {
        title,
        description
    };

    const task = await taskService.createTask(user._id, user.timezone, data);

    res.status(201).json(
        new ApiResponse(201, task, "Task created successfully")
    );
});


export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    if (!user) throw new ApiError(401, "Unauthorized");
    const { id } = req.params as { id: string };
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Id");
    }

    const task = await taskService.getTaskById(id, user._id);

    res.status(200).json(
        new ApiResponse(200, task, "Task fetched successfully")
    );
});

export const getTodayTasks = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    if (!user) throw new ApiError(401, "Unauthorized");

    const result = await taskService.getTodayTasks(user._id, user.timezone);

    res.status(200).json(
        new ApiResponse(200, result, "Today's tasks fetched successfully")
    );
});


export const updateTask = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = req.params as { id: string };
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Id");
    }


    const data: UpdateTaskDTO = {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
    };

    const task = await taskService.updateTask(id, user._id, data);

    res.status(200).json(
        new ApiResponse(200, task, "Task updated successfully")
    );
});


export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    if (!user) throw new ApiError(401, "Unauthorized");
    const { id } = req.params as { id: string };
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Id");
    }

    const result = await taskService.deleteTask(id, user._id);

    res.status(200).json(
        new ApiResponse(200, result, "Task deleted successfully")
    );
});


