import dotenv from "dotenv"
dotenv.config();

export const env = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI as string,
    DB_NAME: process.env.DB_NAME as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    NODE_ENV: process.env.NODE_ENV as string || "development",
    UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL as string,
    SMTP_PASS: process.env.SMTP_PASS as string,
    SMTP_PORT: process.env.SMTP_PORT as string,
    SMTP_USER: process.env.SMTP_USER as string,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as string,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN as string
}