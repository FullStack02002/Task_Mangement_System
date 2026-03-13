import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/utils.js";
import { User } from "../modules/user/user.model.js";
import type { Request, Response, NextFunction } from "express";
import type { IUserDocument } from "../modules/user/user.types.js";
import { redis } from "../config/redis.js";


export const verifyJWT = asyncHandler(async (req: Request, _: Response, next: NextFunction) => {

    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new ApiError(401, "Unauthorized request");

    const decoded = verifyAccessToken(token);
    if (!decoded) throw new ApiError(401, "Invalid access token");

    const cachedUser = await redis.get(`user:${decoded._id}`);

    if (cachedUser) {
        req.user = JSON.parse(cachedUser) as IUserDocument
        return next();
    }


    const user = await User.findById(decoded._id);
    if (!user) throw new ApiError(401, "User not found");
    if (!user.isVerified) throw new ApiError(403, "Please verify your email");

    await redis.set(`user:${decoded._id}`, JSON.stringify(user), "EX", 3600);
    req.user = user;
    next();
});

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, _: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new ApiError(403, `Access denied`);
        }
        next();
    };
};