import type { Document, Types } from "mongoose";

export enum UserRole {
    ADMIN = "admin",
    USER = "user",
}


export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password?: string | null;
    role: UserRole;
    isVerified: boolean;

    googleId?: string | null;
    authProvider?: "local" | "google" | null;

    avatar?: string | null;
    timezone: string
}

export interface IUserDocument extends IUser, Document {
    createdAt: Date;
    updatedAt: Date;
    comparePassword(enteredPassword: string): Promise<boolean>
}

export interface IUserResponse {
    _id: string;
    name: string;
    email: string;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
}