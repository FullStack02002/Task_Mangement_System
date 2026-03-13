import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(env.MONGO_URI, {
            dbName: env.DB_NAME,
        });
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED", error);
        process.exit(1);
    }
}