import { redis } from "../config/redis.js";

export const invalidateUserCache = async (userId: string): Promise<void> => {
    await redis.del(`user:${userId}`);
};