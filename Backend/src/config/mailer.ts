import nodemailer from "nodemailer";
import { env } from "./env.js";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (
    email: string,
    token: string
): Promise<void> => {
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${token}&email=${email}`;

    await transporter.sendMail({
        from: `"Auth System" <${env.SMTP_USER}>`,
        to: email,
        subject: "Verify your email",
        html: `
            <h2>Email Verification</h2>
            <p>Click the button below to verify your email</p>
            <a href="${verifyUrl}" 
               style="
                background: #4F46E5;
                color: white;
                padding: 12px 24px;
                border-radius: 6px;
                text-decoration: none;
               "
            >
                Verify Email
            </a>
            <p>This link expires in <b>10 minutes</b></p>
            <p>If you didn't request this, ignore this email</p>
        `,
    });
};


export const sendLoginOTPEmail = async (
    email: string,
    otp: string
): Promise<void> => {
    await transporter.sendMail({
        from: `"Auth System" <${env.SMTP_USER}>`,
        to: email,
        subject: "Your Login OTP",
        html: `
            <h2>Login Verification</h2>
            <p>Your OTP for login is:</p>
            <h1 style="color: #4F46E5; letter-spacing: 8px">${otp}</h1>
            <p>This OTP expires in <b>10 minutes</b></p>
            <p>If you didn't try to login, please secure your account</p>
        `,
    });
};


export const sendForgotPasswordEmail = async (
    email: string,
    token: string
): Promise<void> => {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;

    await transporter.sendMail({
        from:    `"Auth System" <${env.SMTP_USER}>`,
        to:      email,
        subject: "Reset your password",
        html: `
            <h2>Password Reset</h2>
            <p>You requested a password reset. Click the button below:</p>
            <a href="${resetUrl}"
               style="
                background: #9333ea;
                color: white;
                padding: 12px 24px;
                border-radius: 6px;
                text-decoration: none;
               "
            >
                Reset Password
            </a>
            <p>This link expires in <b>15 minutes</b></p>
            <p>If you didn't request this, ignore this email</p>
        `,
    });
};
