import axiosInstance from "./axiosInstance";
import type {
    LoginDTO, RegisterDTO, VerifyOTPDTO,
    ResendVerificationDTO, ResendLoginOTPDTO, ForgotPasswordDTO
} from "../types/auth.types";

const authService = {

    register: async (data: RegisterDTO) => {
        const res = await axiosInstance.post("/users/register", data);
        return res.data;
    },

    login: async (data: LoginDTO) => {
        const res = await axiosInstance.post("/users/login", data);
        return res.data;
    },

    verifyLoginOTP: async (data: VerifyOTPDTO) => {
        const res = await axiosInstance.post("/users/login/verify-otp", data);
        return res.data;
    },

    verifyEmail: async (token: string, email: string) => {
        const res = await axiosInstance.post(`/users/verify-email?token=${token}&email=${email}`);
        return res.data;
    },
    resendLoginOtp: async (data: ResendLoginOTPDTO) => {
        const res = await axiosInstance.post(`/users/resend-otp`, data);
        return res.data;
    },
    resendVerification: async (data: ResendVerificationDTO) => {
        const res = await axiosInstance.post("/users/resend-verify", data);
        return res.data;
    },
    forgotPassword: async (data: ForgotPasswordDTO) => {
        const res = await axiosInstance.post("/users/forgot-password", data);
        return res.data;
    },
    resetPassword: async (token: string, email: string, newPassword: string) => {
        const res = await axiosInstance.post(`/users/reset-password?token=${token}&email=${email}`, { newPassword });
        return res.data;
    },
    refreshToken: async () => {
        const res = await axiosInstance.post("/users/refresh-token");
        return res.data;
    },

    getCurrentUser: async () => {
        const res = await axiosInstance.get("/users/me");
        return res.data;
    },

    logout: async () => {
        const res = await axiosInstance.post("/users/logout");
        return res.data;
    },
};

export default authService;