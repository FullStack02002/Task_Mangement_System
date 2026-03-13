import { Schema, model } from "mongoose";
import type { IUserDocument } from "./user.types.js";
import bcrypt from "bcrypt"
import { UserRole } from "./user.types.js";

const userSchema = new Schema<IUserDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        password: {
            type: String,
            trim: true,
            select: false
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER,
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        googleId: {
            type: String,
            default: null
        },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local"
        },
        avatar: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
)

// funciton to hash password

userSchema.pre("save", async function (this: IUserDocument) {
    if (!this.isModified("password") || !this.password) return;
    this.password = await bcrypt.hash(this.password as string, 10);
});

userSchema.methods.comparePassword = async function (this: IUserDocument, enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password as string)
}



export const User = model<IUserDocument>("User", userSchema)