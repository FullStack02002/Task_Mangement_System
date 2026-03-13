import { Redis } from "ioredis";
import { env } from "./env.js";

export const redis = new Redis(env.UPSTASH_REDIS_URL, {
    tls: {},
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        if (times > 3) {
            console.error("Redis retry limit reached");
            return null;
        }
        return Math.min(times * 200, 1000);
    },
});

export const connectRedis = async (): Promise<void> => {
    try {
        const ping = await redis.ping();
        if (ping === "PONG") {
            console.log("Redis connected successfully ✅");
        }
    } catch (error) {
        console.error("Redis connection failed →", error);
        process.exit(1);
    }
};