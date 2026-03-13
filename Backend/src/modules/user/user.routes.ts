import { Router } from "express";
import {
    createUserSchema, updateUserSchema,
    verifyEmailSchema, resendVerificationSchema,
    loginUserSchema, verifyLoginOTPSchema, resendLoginOTPSchema,
    forgotPasswordSchema, resetPasswordSchema
} from "./user.validation.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import {
    registerUser, getAllUsers, getById, deleteUser,
    updateUser, verifyEmail, resendVerification,
    loginUser, verifyLoginOTP, logoutUser, refreshToken,
    getCurrentUser, resendLoginOTP, forgotPassword, resetPassword,
    googleAuthCallback
} from "./user.controller.js";
import { verifyJWT, authorizeRoles } from "../../middlewares/auth.middleware.js";
import passport from "../../config/passport.js"
import { env } from "../../config/env.js";



const router = Router();

// Auth Routes
router.post("/register", validateRequest(createUserSchema), registerUser);
router.post("/verify-email", validateRequest(verifyEmailSchema), verifyEmail);
router.post("/resend-verify", validateRequest(resendVerificationSchema), resendVerification);
router.post("/resend-otp", validateRequest(resendLoginOTPSchema), resendLoginOTP);
router.post("/login", validateRequest(loginUserSchema), loginUser);
router.post("/login/verify-otp", validateRequest(verifyLoginOTPSchema), verifyLoginOTP);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPassword);
router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
);
router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        session:         false,
        failureRedirect: `${env.FRONTEND_URL}/login?error=google_failed`,
    }),
    googleAuthCallback
);




// Protected Routes
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);


// Admin routes
router.get("/", verifyJWT, authorizeRoles("admin"), getAllUsers);
router.get("/get/:id", verifyJWT, authorizeRoles("admin"), getById);
router.delete("/delete/:id", verifyJWT, authorizeRoles("admin"), deleteUser);
router.patch("/update/:id", verifyJWT, authorizeRoles("admin"), validateRequest(updateUserSchema), updateUser);

export default router;