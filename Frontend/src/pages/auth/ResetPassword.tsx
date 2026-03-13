import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ROUTES } from "../../routes/routePaths";
import { resetPasswordThunk } from "../../features/auth/authThunks";
import { useAppDispatch, useAppSelector } from "../../app/hook";

interface ResetFormData {
    newPassword: string;
    confirmPassword: string;
}

const Logo = () => (
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-600/40 mb-5">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="2" rx="1" fill="#a78bfa" />
            <rect x="2" y="7" width="8" height="2" rx="1" fill="#a78bfa" opacity="0.7" />
            <rect x="2" y="11" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.4" />
        </svg>
    </div>
);

const ResetPassword = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const loading = useAppSelector((state) => state.auth.resetPasswordLoading);

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetFormData>();

    // redirect if no token or email
    if (!token || !email) {
        return (
            <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Logo />
                        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
                            Invalid link
                        </h1>
                        <p className="text-gray-500 text-sm font-light">
                            This reset link is invalid or has expired
                        </p>
                    </div>
                    <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-8 text-center">
                        <div className="bg-red-950/30 border border-red-800/40 rounded-xl px-4 py-3 mb-6">
                            <p className="text-xs text-red-400 font-light">
                                Reset links expire after <span className="font-medium text-red-300">15 minutes</span>. Please request a new one.
                            </p>
                        </div>
                        <Link
                            to={ROUTES.FORGOT_PASSWORD}
                            className="block w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all text-center shadow-lg shadow-purple-900/40"
                        >
                            Request new link →
                        </Link>
                        <div className="h-px bg-purple-900/40 my-5" />
                        <Link
                            to={ROUTES.LOGIN}
                            className="text-sm text-gray-500 hover:text-gray-300 transition-colors font-light"
                        >
                            ← Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }


    const onSubmit = async (data: ResetFormData) => {
        const result = await (dispatch as any)(resetPasswordThunk({
            token,
            email,
            newPassword: data.newPassword,
        }));

        if (result.meta.requestStatus === "fulfilled" && result.payload !== null) {
            setSuccess(true);
        }
    };

    // ─────────────────────────────────────────
    // UI — Success
    // ─────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Logo />
                        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
                            Password updated
                        </h1>
                        <p className="text-gray-500 text-sm font-light">
                            Your password has been reset successfully
                        </p>
                    </div>
                    <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-8 text-center">
                        <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl px-4 py-3 mb-6">
                            <p className="text-xs text-purple-300 font-light">
                                You can now sign in with your <span className="font-medium text-purple-200">new password</span>
                            </p>
                        </div>
                        <p className="text-sm text-gray-500 font-light mb-6">
                            For security, all other sessions have been signed out.
                        </p>
                        <button
                            onClick={() => navigate(ROUTES.LOGIN)}
                            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all cursor-pointer shadow-lg shadow-purple-900/40"
                        >
                            Go to login →
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    // ─────────────────────────────────────────
    // UI — Form
    // ─────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

                {/* ── Brand ── */}
                <div className="text-center mb-8">
                    <Logo />
                    <h1 className="text-2xl font-light text-white tracking-tight mb-2">
                        Reset your password
                    </h1>
                    <p className="text-gray-500 text-sm font-light">
                        Enter a new password for your account
                    </p>
                </div>

                {/* ── Card ── */}
                <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

                        {/* ── New Password ── */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-400 tracking-[0.08em] uppercase">
                                New password
                            </label>
                            <input
                                type="password"
                                placeholder="Min 8 characters"
                                className={`w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border text-white text-sm outline-none transition-all duration-200 placeholder-gray-700 font-light
                                    ${errors.newPassword
                                        ? "border-red-500/60 focus:border-red-400"
                                        : "border-purple-900/50 focus:border-purple-600/80 focus:ring-1 focus:ring-purple-600/20"
                                    }`}
                                {...register("newPassword", {
                                    required: "Password is required",
                                    minLength: { value: 8, message: "At least 8 characters" },
                                    maxLength: { value: 32, message: "At most 32 characters" },
                                    validate: {
                                        hasUppercase: (v) => /[A-Z]/.test(v) || "Must contain uppercase letter",
                                        hasLowercase: (v) => /[a-z]/.test(v) || "Must contain lowercase letter",
                                        hasNumber: (v) => /[0-9]/.test(v) || "Must contain a number",
                                        hasSpecialChar: (v) => /[@$!%*?&#^]/.test(v) || "Must contain special character (@$!%*?&#^)",
                                    },
                                })}
                            />
                            {errors.newPassword && (
                                <span className="text-xs text-red-400 font-light">
                                    {errors.newPassword.message}
                                </span>
                            )}

                            {/* ── Strength Indicator ── */}
                            {watch("newPassword") && (
                                <div className="mt-1 flex flex-col gap-1.5">
                                    <div className="w-full h-1 bg-purple-900/30 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300
                                                ${(() => {
                                                    const v = watch("newPassword");
                                                    let s = 0;
                                                    if (v.length >= 8) s++;
                                                    if (/[A-Z]/.test(v)) s++;
                                                    if (/[a-z]/.test(v)) s++;
                                                    if (/[0-9]/.test(v)) s++;
                                                    if (/[@$!%*?&#^]/.test(v)) s++;
                                                    return [
                                                        "w-0",
                                                        "w-1/5 bg-red-500",
                                                        "w-2/5 bg-orange-500",
                                                        "w-3/5 bg-yellow-500",
                                                        "w-4/5 bg-blue-400",
                                                        "w-full bg-purple-400",
                                                    ][s];
                                                })()}`}
                                        />
                                    </div>
                                    <p className={`text-xs font-light
                                        ${(() => {
                                            const v = watch("newPassword");
                                            let s = 0;
                                            if (v.length >= 8) s++;
                                            if (/[A-Z]/.test(v)) s++;
                                            if (/[a-z]/.test(v)) s++;
                                            if (/[0-9]/.test(v)) s++;
                                            if (/[@$!%*?&#^]/.test(v)) s++;
                                            return [
                                                "",
                                                "text-red-400",
                                                "text-orange-400",
                                                "text-yellow-400",
                                                "text-blue-400",
                                                "text-purple-400",
                                            ][s];
                                        })()}`}
                                    >
                                        {(() => {
                                            const v = watch("newPassword");
                                            let s = 0;
                                            if (v.length >= 8) s++;
                                            if (/[A-Z]/.test(v)) s++;
                                            if (/[a-z]/.test(v)) s++;
                                            if (/[0-9]/.test(v)) s++;
                                            if (/[@$!%*?&#^]/.test(v)) s++;
                                            return ["", "Very weak", "Weak", "Fair", "Strong", "Very strong"][s];
                                        })()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── Confirm Password ── */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-400 tracking-[0.08em] uppercase">
                                Confirm password
                            </label>
                            <input
                                type="password"
                                placeholder="Repeat your password"
                                className={`w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border text-white text-sm outline-none transition-all duration-200 placeholder-gray-700 font-light
                                    ${errors.confirmPassword
                                        ? "border-red-500/60 focus:border-red-400"
                                        : "border-purple-900/50 focus:border-purple-600/80 focus:ring-1 focus:ring-purple-600/20"
                                    }`}
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (v) => v === watch("newPassword") || "Passwords do not match",
                                })}
                            />
                            {errors.confirmPassword && (
                                <span className="text-xs text-red-400 font-light">
                                    {errors.confirmPassword.message}
                                </span>
                            )}
                        </div>

                        {/* ── Submit ── */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`mt-1 w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
                                ${loading
                                    ? "bg-purple-900/40 cursor-not-allowed text-purple-400/60"
                                    : "bg-purple-600 hover:bg-purple-500 cursor-pointer text-white shadow-lg shadow-purple-900/40"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset password →"
                            )}
                        </button>

                        <div className="h-px bg-purple-900/40" />

                        <Link
                            to={ROUTES.LOGIN}
                            className="text-sm text-gray-500 hover:text-gray-300 transition-colors text-center font-light"
                        >
                            ← Back to login
                        </Link>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-600 mt-6 font-light">
                    Remembered your password?{" "}
                    <Link
                        to={ROUTES.LOGIN}
                        className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;