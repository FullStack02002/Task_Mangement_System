import * as userService from "./user.service.js";
import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import type { UserResponseDTO } from "./user.dto.js";
import { toUserResponseDTO } from "./user.dto.js";
import { ApiError } from "../../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import { verifyRefreshToken } from "../../utils/utils.js";
import type { IUserDocument } from "./user.types.js";
import { env } from "../../config/env.js";


const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};



// AUth Controllers


export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, timezone } = req.body;
    const user = await userService.CreateUser({ name, email, password, timezone });
    res.status(201).json(new ApiResponse(201, user, "Registration successful. Verification link sent to your email"))
})

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token, email } = req.query as { token: string; email: string };
    const user = await userService.verifyEmail(email, token);
    res.status(200).json(new ApiResponse(200, user, "Email Verified Successfully"));
})

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await userService.resendVerification(email);
    res.status(200).json(new ApiResponse(200, result, "Verification email sent"))
})

export const resendLoginOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await userService.resendLoginOTP(email);
    res.status(200).json(new ApiResponse(200, result, "Otp Resent Successfully"));
})

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await userService.loginUser({ email, password });
    res.status(200).json(new ApiResponse(200, result, "OTP sent to your email"));
});

export const verifyLoginOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const { user, accessToken, refreshToken } = await userService.verifyLoginOTP(email, otp);

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json(new ApiResponse(200, { user, accessToken, refreshToken }, "Login Successful"));
});


export const refreshToken = asyncHandler(async (req: Request, res: Response) => {

    const origin = req.headers.origin || req.headers.referer;

    if (origin && !origin.startsWith(env.FRONTEND_URL)) {
        throw new ApiError(403, "Forbidden");
    }



    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) throw new ApiError(401, "Refresh token missing");

    const { accessToken } = await userService.refreshToken(token);
    res.status(200).json(new ApiResponse(200, { accessToken }, "Token refreshed"));
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) throw new ApiError(401, "Already logged out");

    const decoded = verifyRefreshToken(token);
    await userService.logoutUser(decoded._id);

    res.clearCookie("refreshToken", cookieOptions);
    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await userService.forgotPassword(email);

    res.status(200).json(new ApiResponse(200, result, result.message));

})

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, email } = req.query as { token: string; email: string };
    const { newPassword } = req.body;

    const result = await userService.resetPassword(email, token, newPassword);

    res.status(200).json(new ApiResponse(200, result, result.message));
})

export const googleAuthCallback = asyncHandler(
    async (req: Request, res: Response) => {

        const user = req.user as IUserDocument;

        if (!user) {
            return res.redirect(`${env.FRONTEND_URL}/login?error=google_failed`);
        }

        const timezone = req.query.state
            ? decodeURIComponent(req.query.state as string)
            : "UTC";


        const { accessToken, refreshToken } = await userService.googleAuthService(user, timezone);
        console.log(accessToken);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect(
            `${env.FRONTEND_URL}/auth/google/success?accessToken=${accessToken}`
        );
    }
);



// User Controllers

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await userService.getUsers();

    const response: UserResponseDTO[] = users.map(toUserResponseDTO);

    res.status(200).json(new ApiResponse(200, response, "All Users Fetched Successfully"))
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Id")
    }

    const user = await userService.getById(id);


    const response = toUserResponseDTO(user);

    res.status(200).json(new ApiResponse(200, response, "User Fetched Successfully"))
})

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Id")
    }

    const user = await userService.deleteUser(id);

    const response = toUserResponseDTO(user);

    res.status(200).json(new ApiResponse(200, response, "User Deleted Successfully"))
})

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const data = req.body

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Id")
    }

    const updatedUser = await userService.updateUser(id, data);

    const response = toUserResponseDTO(updatedUser);

    res.status(200).json(new ApiResponse(200, response, "User updated Successfully"));

})

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {

    const response = toUserResponseDTO(req?.user);

    res.status(200).json(new ApiResponse(200, response, "Current User Fetched Successfully"))
})






