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
        from: `"Auth System" <${env.SMTP_USER}>`,
        to: email,
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


export const sendEODSummaryEmail = async (
    email: string,
    name: string,
    stats: {
        totalTasks: number;
        completed: number;
        pending: number;
        notCompleted: number;
        completionPct: number;
        dateStr: string;
    }
) => {
    await transporter.sendMail({
        from: `"TaskFlow" <${env.SMTP_USER}>`,
        to: email,
        subject: `Your EOD Summary — ${stats.dateStr}`,
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0d0a1a; color: #fff; border-radius: 16px;">
                <h2 style="color: #a78bfa; font-weight: 400; margin-bottom: 8px;">End of Day Summary</h2>
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">Hi ${name}, here's how your day went on ${stats.dateStr}</p>

                <div style="background: #110d20; border: 1px solid #3b1f6e; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Total tasks</td>
                            <td style="padding: 8px 0; color: #fff; font-size: 14px; text-align: right;">${stats.totalTasks}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Completed</td>
                            <td style="padding: 8px 0; color: #a78bfa; font-size: 14px; text-align: right;">${stats.completed}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Pending</td>
                            <td style="padding: 8px 0; color: #facc15; font-size: 14px; text-align: right;">${stats.pending}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Not completed</td>
                            <td style="padding: 8px 0; color: #f87171; font-size: 14px; text-align: right;">${stats.notCompleted}</td>
                        </tr>
                        <tr style="border-top: 1px solid #3b1f6e;">
                            <td style="padding: 12px 0 0; color: #9ca3af; font-size: 14px;">Completion rate</td>
                            <td style="padding: 12px 0 0; color: #a78bfa; font-size: 16px; font-weight: 600; text-align: right;">${stats.completionPct}%</td>
                        </tr>
                    </table>
                </div>

                <p style="color: #4b5563; font-size: 12px; text-align: center;">TaskFlow · Sent at ${new Date().toLocaleTimeString()}</p>
            </div>
        `,
    });
};
