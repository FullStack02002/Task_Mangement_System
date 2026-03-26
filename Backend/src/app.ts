import express from "express";
import { ApiError } from "./utils/ApiError.js";
import { env } from "./config/env.js";
import cors from "cors"
import cookieParser from "cookie-parser";
import { sanitize } from "express-mongo-sanitize";
import helmet from "helmet";

const app = express();

const allowedOrigins = [
    env.FRONTEND_URL
];

const corsOptions: cors.CorsOptions = {
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
};


app.use(helmet());

app.use(
    helmet.contentSecurityPolicy({
        directives: {

            //  default — only allow resources from our own domain
            defaultSrc: ["'self'"],

            // scripts — only from our own domain
            // 'unsafe-inline' needed for Vite in dev (remove in prod)
            scriptSrc: ["'self'"],

            //  styles — only from our own domain
            styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for Tailwind

            //  images — your domain + Google profile pictures
            imgSrc: [
                "'self'",
                "data:",
                "https://lh3.googleusercontent.com",
            ],

            //  API calls — only to our own backend
            connectSrc: [
                "'self'",
                env.NODE_ENV === "production"
                    ? "http://localhost:5000" ///***** need to be change when deployed*********/
                    : "http://localhost:5000",
            ],

            //  fonts
            fontSrc: ["'self'", "https://fonts.gstatic.com"],

            //  no iframes allowed — prevents clickjacking
            frameSrc: ["'none'"],

            //  form submissions — only to our own domain
            formAction: ["'self'"],

            //  base tag restriction
            baseUri: ["'self'"],

            //  objects — no Flash or plugins
            objectSrc: ["'none'"],

            //  upgrade HTTP to HTTPS in production
            ...(env.NODE_ENV === "production" && {
                upgradeInsecureRequests: [],
            }),
        },
    })
);

// automatically set by helmet

// X-Content-Type-Options: nosniff
// //  browser won't guess content type
// // prevents MIME type sniffing attacks

// X-Frame-Options: DENY
// //  your site can't be embedded in iframes
// // prevents clickjacking

// X-XSS-Protection: 1; mode=block
// //  browser's built-in XSS filter enabled

// Strict-Transport-Security: max-age=15552000
// //  forces HTTPS for 180 days
// // prevents protocol downgrade attacks

// Referrer-Policy: no-referrer
// //  no referrer header sent
// // prevents leaking URLs to other sites

// X-Powered-By: (removed)
// //  hides Express from attackers

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, _res, next) => {
    req.body = sanitize(req.body);
    next();
});

app.get("/", (req, res) => {
    res.end("Api Running");
})


// Routes Import
import userRouter from "./modules/user/user.routes.js"
import taskRouter from "./modules/task/task.routes.js"
import archivedTaskRouter from "./modules/archived-task/archived-task.routes.js"



app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/archived", archivedTaskRouter)





app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            data: null,
        });
    } else {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: [],
            data: null,
        });
    }
})


export default app;