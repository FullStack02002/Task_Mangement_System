import { env } from "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { startEODJob } from "./jobs/eodJob.js";


connectDB()
    .then(() => connectRedis())
    .then(() => {
        app.listen(env.PORT, () => {
            console.log(`Server is running on port ${env.PORT}`);
        });

        startEODJob();
    })
    .catch((error) => {
        console.error("Startup failed →", error);
        process.exit(1);
    });