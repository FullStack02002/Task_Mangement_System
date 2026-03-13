import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "../../types/auth.types";
import {
    registerThunk,
    verifyEmailThunk,
    resendVerificationThunk,
    loginThunk,
    verifyLoginOTPThunk,
    restoreSession,
    logoutThunk,
    resendLoginOTPThunk,
    forgotPasswordThunk,
    resetPasswordThunk,
    getCurrentUserThunk
} from "./authThunks";

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loading: false,
    registerLoading: false,
    verifyingemail: false,
    emailverified: false,
    resendingemail: false,
    verifyEmailFailed: false,
    loginLoading: false,
    loginOtpLoading: false,
    restoreLoading: true,
    logoutLoading: false,
    resendOtpLoading: false,
    forgotPasswordLoading: false,
    resetPasswordLoading: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
            state.isAuthenticated = true;
        },
        clearAuth: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
        },
        resetVerifyState: (state) => {
            state.emailverified = false;
            state.verifyingemail = false;
            state.resendingemail = false;
            state.verifyEmailFailed = false;

        },
    },
    extraReducers: (builder) => {

        // ── Register ──
        builder
            .addCase(registerThunk.pending, (state) => { state.registerLoading = true; })
            .addCase(registerThunk.fulfilled, (state) => { state.registerLoading = false; })
            .addCase(registerThunk.rejected, (state) => {
                state.registerLoading = false;
            });

        // ── Verify Email ──
        builder
            .addCase(verifyEmailThunk.pending, (state) => { state.verifyingemail = true; state.emailverified = false; state.verifyEmailFailed = false; })
            .addCase(verifyEmailThunk.fulfilled, (state) => { state.verifyingemail = false; state.emailverified = true; state.verifyEmailFailed = false; })
            .addCase(verifyEmailThunk.rejected, (state) => {
                state.verifyingemail = false;
                state.emailverified = false;
                state.verifyEmailFailed = true;
            });

        // ── Resend Verification ──
        builder
            .addCase(resendVerificationThunk.pending, (state) => { state.resendingemail = true; })
            .addCase(resendVerificationThunk.fulfilled, (state) => { state.resendingemail = false; })
            .addCase(resendVerificationThunk.rejected, (state) => {
                state.resendingemail = false;
            });

        // ── Login ──
        builder
            .addCase(loginThunk.pending, (state) => { state.loginLoading = true; })
            .addCase(loginThunk.fulfilled, (state) => { state.loginLoading = false; })
            .addCase(loginThunk.rejected, (state) => {
                state.loginLoading = false;
            });

        // ── Verify Login OTP ──
        builder
            .addCase(verifyLoginOTPThunk.pending, (state) => { state.loginOtpLoading = true; })
            .addCase(verifyLoginOTPThunk.fulfilled, (state, action) => {
                state.loginOtpLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
            })
            .addCase(verifyLoginOTPThunk.rejected, (state) => {
                state.loginOtpLoading = false;
            });

        // --- Resend Login OTP ---
        builder
            .addCase(resendLoginOTPThunk.pending, (state) => { state.resendOtpLoading = true; })
            .addCase(resendLoginOTPThunk.fulfilled, (state) => { state.resendOtpLoading = false; })
            .addCase(resendLoginOTPThunk.rejected, (state) => {
                state.resendOtpLoading = false;
            });

        // ── ForgotPassword ──
        builder
            .addCase(forgotPasswordThunk.pending, (state) => { state.forgotPasswordLoading = true; })
            .addCase(forgotPasswordThunk.fulfilled, (state) => {
                state.forgotPasswordLoading = false;
            })
            .addCase(forgotPasswordThunk.rejected, (state) => {
                state.forgotPasswordLoading = false;
            });

        // --- Reset Password ---
        builder
            .addCase(resetPasswordThunk.pending, (state) => { state.resetPasswordLoading = true; })
            .addCase(resetPasswordThunk.fulfilled, (state) => { state.resetPasswordLoading = false; })
            .addCase(resetPasswordThunk.rejected, (state) => {
                state.resetPasswordLoading = false;
            });

        // ── Restore Session ──
        builder
            .addCase(restoreSession.pending, (state) => { state.restoreLoading = true; })
            .addCase(restoreSession.fulfilled, (state, action) => {
                state.restoreLoading = false;
                state.user = action.payload?.user ?? null;
                state.accessToken = action.payload?.accessToken ?? null;
                state.isAuthenticated = !!action.payload?.user;
            })
            .addCase(restoreSession.rejected, (state) => {
                state.restoreLoading = false;
                state.isAuthenticated = false;
            });

        // ── Logout ──
        builder
            .addCase(logoutThunk.pending, (state) => { state.logoutLoading = true })
            .addCase(logoutThunk.fulfilled, (state) => {
                state.logoutLoading = false;
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutThunk.rejected, (state) => {
                state.logoutLoading = false;
            });

        builder
            .addCase(getCurrentUserThunk.fulfilled, (state, action) => {
                if (action.payload) {
                    state.user = action.payload;
                    state.isAuthenticated = true;
                }
            });
    },
});

export const { setAccessToken, clearAuth, resetVerifyState } = authSlice.actions;
export default authSlice.reducer;