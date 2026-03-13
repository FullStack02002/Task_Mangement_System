import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/routePaths";
import { forgotPasswordThunk } from "../../features/auth/authThunks";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import { maskEmail } from "../../utils/maskEmail";


interface ForgotFormData {
    email: string;
}

const ForgotPassword = () => {
    const dispatch = useAppDispatch();
    const loading = useAppSelector((state) => state.auth.forgotPasswordLoading);

    const [submitted, setSubmitted] = useState(false);
    const [email, setEmail] = useState("");
    const [countdown, setCountdown] = useState(60);


    // start countdown when submitted becomes true
    useEffect(() => {
        if (!submitted) return;

        setCountdown(60);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [submitted]);


    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotFormData>();

    const onSubmit = async (data: ForgotFormData) => {
        const result = await (dispatch as any)(forgotPasswordThunk({ email: data.email }));

        //  always show success UI — don't reveal if email exists
        if (result.meta.requestStatus === "fulfilled") {
            setEmail(data.email);
            setSubmitted(true);
        }
    };

    // ─────────────────────────────────────────
    // UI — After submit
    // ─────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-600/40 mb-5">
                            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="3" width="12" height="2" rx="1" fill="#a78bfa" />
                                <rect x="2" y="7" width="8" height="2" rx="1" fill="#a78bfa" opacity="0.7" />
                                <rect x="2" y="11" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
                            Check your email
                        </h1>
                        <p className="text-gray-500 text-sm font-light">
                            We sent a reset link to your inbox
                        </p>
                    </div>

                    <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-8 text-center">

                        <p className="text-xs text-gray-500 font-light mb-1">Reset link sent to</p>
                        <p className="text-base font-medium text-purple-400 mb-6">
                            {maskEmail(email)}
                        </p>

                        <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl px-4 py-3 mb-6">
                            <p className="text-xs text-purple-300 font-light">
                                Link expires in <span className="font-medium text-purple-200">15 minutes</span>
                            </p>
                        </div>

                        <p className="text-xs text-gray-600 font-light mb-6">
                            Didn't receive it? Check your spam folder or resend below.
                        </p>

                        <div className="flex flex-col items-center gap-2 mb-6">
                            <p className="text-xs text-gray-600 font-light">Didn't receive the link?</p>
                            <button
                                onClick={() => setSubmitted(false)}
                                disabled={countdown > 0 || loading}
                                className={`text-sm font-medium transition-all flex items-center gap-2
                                    ${countdown > 0 || loading
                                        ? "text-gray-600 cursor-not-allowed"
                                        : "text-purple-400 hover:text-purple-300 cursor-pointer"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : countdown > 0 ? (
                                    <span className="flex items-center gap-2">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-purple-900/60 text-xs text-purple-400 font-mono">
                                            {countdown}
                                        </span>
                                        Resend link
                                    </span>
                                ) : (
                                    "Resend link"
                                )}
                            </button>
                        </div>

                        <div className="h-px bg-purple-900/40 mb-6" />

                        <Link
                            to={ROUTES.LOGIN}
                            className="text-sm text-gray-500 hover:text-gray-300 transition-colors font-light"
                        >
                            ← Back to login
                        </Link>
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
    }

    // ─────────────────────────────────────────
    // UI — Form
    // ─────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

                {/* ── Brand ── */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-600/40 mb-5">
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="3" width="12" height="2" rx="1" fill="#a78bfa" />
                            <rect x="2" y="7" width="8" height="2" rx="1" fill="#a78bfa" opacity="0.7" />
                            <rect x="2" y="11" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-light text-white tracking-tight mb-2">
                        Forgot your password?
                    </h1>
                    <p className="text-gray-500 text-sm font-light">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                {/* ── Card ── */}
                <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

                        <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl px-4 py-3 text-center">
                            <p className="text-xs text-purple-300 font-light">
                                Reset link expires in <span className="font-medium text-purple-200">15 minutes</span>
                            </p>
                        </div>

                        {/* ── Email ── */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-400 tracking-[0.08em] uppercase">
                                Email address
                            </label>
                            <input
                                placeholder="you@example.com"
                                className={`w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border text-white text-sm outline-none transition-all duration-200 placeholder-gray-700 font-light
                                    ${errors.email
                                        ? "border-red-500/60 focus:border-red-400"
                                        : "border-purple-900/50 focus:border-purple-600/80 focus:ring-1 focus:ring-purple-600/20"
                                    }`}
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Invalid email format",
                                    },
                                    setValueAs: (v) => v.trim().toLowerCase(),
                                })}
                            />
                            {errors.email && (
                                <span className="text-xs text-red-400 font-light">
                                    {errors.email.message}
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
                                    Sending...
                                </>
                            ) : (
                                "Send reset link →"
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

export default ForgotPassword;