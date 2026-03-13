export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: IUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    registerLoading: boolean;
    verifyingemail: boolean;
    emailverified: boolean;
    resendingemail: boolean;
    verifyEmailFailed: boolean;
    loginLoading: boolean;
    loginOtpLoading: boolean;
    restoreLoading: boolean;
    logoutLoading: boolean;
    resendOtpLoading: boolean;
    forgotPasswordLoading: boolean;
    resetPasswordLoading: boolean;

}

export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    timezone: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface VerifyOTPDTO {
    email: string;
    otp: string;
}

export interface ResendVerificationDTO {
    email: string;
}

export interface ResendLoginOTPDTO {
    email: string
}

export interface ForgotPasswordDTO {
    email: string
}
