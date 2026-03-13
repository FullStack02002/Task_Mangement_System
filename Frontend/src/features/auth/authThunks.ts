import { createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import { toast } from "sonner";
import { broadcastLogout } from "../../utils/authSync";

// ─────────────────────────────────────────
// Register
// ─────────────────────────────────────────
export const registerThunk = createAsyncThunk(
    "auth/register",
    async (data: { name: string; email: string; password: string,timezone:string }, { rejectWithValue }) => {
        try {
            const res = await authService.register(data);
            toast.success("Account created!", {
                description: "Check your email to verify your account.",
            });
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Registration failed";
            toast.error("Registration failed", {
                description: message,
            });
            return rejectWithValue(null);
        }
    }
);

// ─────────────────────────────────────────
// Email Verification
// ─────────────────────────────────────────

export const verifyEmailThunk = createAsyncThunk(
    "auth/verifyEmail",
    async (data: { token: string; email: string }, { rejectWithValue }) => {
        try {
            const res = await authService.verifyEmail(data.token, data.email);
            toast.success("Email Verified Successfully");
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Email Verification Failed";
            toast.error("Email Verification Failed", {
                description: message,
            })
            return rejectWithValue(null);
        }
    }
);


// ─────────────────────────────────────────
// Resend Verification
// ─────────────────────────────────────────
export const resendVerificationThunk = createAsyncThunk(
    "auth/resendVerification",
    async (data: { email: string }, { rejectWithValue }) => {
        try {
            const res = await authService.resendVerification(data);
            toast.success("Resent Successfully", {
                description: "Check your email to verify your account.",
            });
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed To Resend Email";
            toast.error("Resend Failed", {
                description: message,
            })
            return rejectWithValue(null);
        }
    }
);


// ─────────────────────────────────────────
// Resend Login OTP
// ─────────────────────────────────────────

export const resendLoginOTPThunk = createAsyncThunk(
    "auth/resendLoginOTP",
    async (data: { email: string }, { rejectWithValue }) => {
        try {
            const res = await authService.resendLoginOtp(data);
            toast.success("Otp Resent Successfully", {
                description: "Check your email"
            })
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to Resent OTP";
            toast.error("Resent Failed", {
                description: message,
            })
            return rejectWithValue(null);
        }
    }
)


// ─────────────────────────────────────────
// Login Step 1
// ─────────────────────────────────────────
export const loginThunk = createAsyncThunk(
    "auth/login",
    async (data: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const res = await authService.login(data);
            toast.success("Otp Sent to Your Mail");
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed  To Send Otp";
            toast.error("Login Failed", {
                description: message
            })
            return rejectWithValue(null);
        }
    }
);



// ─────────────────────────────────────────
// Login Step 2 — verify OTP
// ─────────────────────────────────────────
export const verifyLoginOTPThunk = createAsyncThunk(
    "auth/verifyLoginOTP",
    async (data: { email: string; otp: string }, { rejectWithValue }) => {
        try {
            const res = await authService.verifyLoginOTP(data);
            toast.success("Otp Verified", {
                description: "Login Successfull"
            })
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Login Failed";
            toast.error("Login Failed", {
                description: message
            })
            return rejectWithValue(null);
        }
    }
);



// ─────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────

export const forgotPasswordThunk = createAsyncThunk(
    "auth/forgotPassword",
    async (data: { email: string }, { rejectWithValue }) => {
        try {
            const res = await authService.forgotPassword(data);
            toast.success("Reset Password Link Sent To Your Mail");
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Something Went Wrong Please Try Again Later";
            toast.error("Something Went Wrong", {
                description: message
            })
            return rejectWithValue(null);
        }
    }
);


// ─────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────


export const resetPasswordThunk = createAsyncThunk(
    "auth/resetPassword",
    async (data: { email: string, token: string, newPassword: string }, { rejectWithValue }) => {
        try {
            const res = await authService.resetPassword(data.token, data.email, data.newPassword);
            toast.success("Reset Password Link Sent To Your Mail");
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Something Went Wrong Please Try Again Later";
            toast.error("Something Went Wrong", {
                description: message
            })
            return rejectWithValue(null);
        }
    }
);



// ─────────────────────────────────────────
// Restore Session
// ─────────────────────────────────────────
export const restoreSession = createAsyncThunk(
    "auth/restoreSession",
    async (_, { rejectWithValue }) => {
        try {
            const refreshRes = await authService.refreshToken();
            const accessToken = refreshRes.data.accessToken as string;
            const userRes = await authService.getCurrentUser();
            return { user: userRes.data, accessToken };
        } catch {
            return rejectWithValue("Session expired");
        }
    }
);



// ─────────────────────────────────────────
// Logout
// ─────────────────────────────────────────
export const logoutThunk = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await authService.logout();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Logout failed");
        }
        finally {
            broadcastLogout();
        }
    }
);


export const getCurrentUserThunk = createAsyncThunk(
    "auth/getCurrentUser",
    async () => {
        try {
            const res = await authService.getCurrentUser();
            return res.data.data; 
        } catch (error: any) {
            return null;
        }
    }
);