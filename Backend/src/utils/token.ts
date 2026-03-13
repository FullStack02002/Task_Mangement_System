import crypto from "crypto";

export const generateToken = (): string => {
    return crypto.randomBytes(32).toString("hex");
};

export const hashToken = (token: string): string => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


