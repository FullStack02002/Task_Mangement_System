import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { ROUTES } from "../../routes/routePaths";
import { loginThunk, verifyLoginOTPThunk, resendLoginOTPThunk } from "../../features/auth/authThunks";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import GoogleButton from "../../components/shared/GoogleButton";
import { useSearchParams } from "react-router-dom";

interface LoginFormData {
    email: string;
    password: string;
}

interface OTPFormData {
    otp: string;
}

const OTP_COOLDOWN = 60;

const Login = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams()
    const googleError = searchParams.get("error");

    const loginLoading = useAppSelector((state) => state.auth.loginLoading);
    const otpLoading = useAppSelector((state) => state.auth.loginOtpLoading);
    const resendLoading = useAppSelector((state) => state.auth.resendOtpLoading);

    const [step, setStep] = useState<"login" | "otp">("login");
    const [email, setEmail] = useState("");
    const [countdown, setCountdown] = useState(OTP_COOLDOWN);

    // ── Login Form ──
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    // ── OTP Form ──
    const {
        register: registerOTP,
        handleSubmit: handleSubmitOTP,
        formState: { errors: otpErrors },
        setValue: setOTPValue,
        watch: watchOTP,
    } = useForm<OTPFormData>();

    //  start countdown when step changes to otp
    useEffect(() => {
        if (step !== "otp") return;

        setCountdown(OTP_COOLDOWN);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [step]);

    // ── Step 1 — Login ──
    const onLogin = async (data: LoginFormData) => {
        const result = await (dispatch as any)(loginThunk({
            email: data.email,
            password: data.password,
        }));

        if (result.meta.requestStatus === "fulfilled" && result.payload !== null) {
            setEmail(data.email);
            localStorage.setItem("pendingEmail", data.email);
            setStep("otp");
        }

        if (result.meta.requestStatus === "rejected") {
            const payload = result.payload as { message: string; status: number };
            if (payload?.status === 403) {
                localStorage.setItem("pendingEmail", data.email);
            }
        }
    };

    // ── Step 2 — Verify OTP ──
    const onVerifyOTP = async (data: OTPFormData) => {
        const result = await (dispatch as any)(verifyLoginOTPThunk({
            email,
            otp: data.otp,
        }));

        if (result.meta.requestStatus === "fulfilled" && result.payload !== null) {
            localStorage.removeItem("pendingEmail");
            navigate(ROUTES.HOME);
        }
    };

    // ── Resend OTP ──
    const handleResendOTP = async () => {
        if (countdown > 0 || resendLoading) return;

        const result = await (dispatch as any)(resendLoginOTPThunk({ email }));

        if (result.meta.requestStatus === "fulfilled" && result.payload !== null) {
            setCountdown(OTP_COOLDOWN); // restart countdown

            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) { clearInterval(timer); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    // ── OTP digit only input ──
    const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
        setOTPValue("otp", val);
    };

    return (
        <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

                {/* ── Brand ── */}
                <Link to="/">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-600/40 mb-5">
                            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="3" width="12" height="2" rx="1" fill="#a78bfa" />
                                <rect x="2" y="7" width="8" height="2" rx="1" fill="#a78bfa" opacity="0.7" />
                                <rect x="2" y="11" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
                            {step === "login" ? "Welcome back" : "Check your email"}
                        </h1>
                        <p className="text-gray-500 text-sm font-light">
                            {step === "login"
                                ? "Sign in to your TaskFlow account"
                                : `We sent a 6-digit OTP to ${email}`
                            }
                        </p>
                    </div></Link>

                {/* ── Card ── */}
                <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-8">

                    {/* ════════════════════
                STEP 1 — Login
            ════════════════════ */}
                    {step === "login" && (
                        <div className="flex flex-col gap-5">

                            {googleError === "google_failed" && (
                                <div className="bg-red-950/30 border border-red-800/40 rounded-xl px-4 py-3 flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                    <div>
                                        <p className="text-xs text-red-400 font-medium">
                                            Google sign in failed
                                        </p>
                                        <p className="text-xs text-red-400/60 mt-0.5 font-light">
                                            Please try again or use email and password
                                        </p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onLogin)} className="flex flex-col gap-5">

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

                                {/* ── Password ── */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-medium text-gray-400 tracking-[0.08em] uppercase">
                                            Password
                                        </label>
                                        <Link
                                            to={ROUTES.FORGOT_PASSWORD}
                                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-light"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        className={`w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border text-white text-sm outline-none transition-all duration-200 placeholder-gray-700 font-light
                                    ${errors.password
                                                ? "border-red-500/60 focus:border-red-400"
                                                : "border-purple-900/50 focus:border-purple-600/80 focus:ring-1 focus:ring-purple-600/20"
                                            }`}
                                        {...register("password", {
                                            required: "Password is required",
                                        })}
                                    />
                                    {errors.password && (
                                        <span className="text-xs text-red-400 font-light">
                                            {errors.password.message}
                                        </span>
                                    )}
                                </div>

                                {/* ── Submit ── */}
                                <button
                                    type="submit"
                                    disabled={loginLoading}
                                    className={`mt-1 w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
                                ${loginLoading
                                            ? "bg-purple-900/40 cursor-not-allowed text-purple-400/60"
                                            : "bg-purple-600 hover:bg-purple-500 cursor-pointer text-white shadow-lg shadow-purple-900/40"
                                        }`}
                                >
                                    {loginLoading ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign in →"
                                    )}
                                </button>
                            </form>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-purple-900/40" />
                                <span className="text-xs text-gray-600 font-light">or</span>
                                <div className="flex-1 h-px bg-purple-900/40" />
                            </div>

                            <GoogleButton label="Continue with Google" />
                        </div>
                    )}

                    {/* ════════════════════
                STEP 2 — OTP
            ════════════════════ */}
                    {step === "otp" && (
                        <form onSubmit={handleSubmitOTP(onVerifyOTP)} className="flex flex-col gap-5">

                            {/* ── OTP hint ── */}
                            <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl px-4 py-3 text-center">
                                <p className="text-xs text-purple-300 font-light">
                                    OTP expires in <span className="font-medium text-purple-200">10 minutes</span>
                                </p>
                            </div>

                            {/* ── OTP Input ── */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-gray-400 tracking-[0.08em] uppercase text-center">
                                    Enter 6-digit OTP
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="000000"
                                    className={`w-full px-4 py-4 rounded-xl bg-[#0d0a1a] border text-white text-3xl font-light outline-none transition-all duration-200 text-center tracking-[1rem]
                                ${otpErrors.otp
                                            ? "border-red-500/60 focus:border-red-400"
                                            : "border-purple-900/50 focus:border-purple-600/80 focus:ring-1 focus:ring-purple-600/20"
                                        }`}
                                    {...registerOTP("otp", {
                                        required: "OTP is required",
                                        minLength: { value: 6, message: "OTP must be 6 digits" },
                                        maxLength: { value: 6, message: "OTP must be 6 digits" },
                                        pattern: { value: /^\d{6}$/, message: "OTP must be 6 digits" },
                                    })}
                                    onChange={handleOTPChange}
                                />
                                {otpErrors.otp && (
                                    <span className="text-xs text-red-400 text-center font-light">
                                        {otpErrors.otp.message}
                                    </span>
                                )}
                            </div>

                            {/* ── Verify Submit ── */}
                            <button
                                type="submit"
                                disabled={otpLoading || (watchOTP("otp") || "").length < 6}
                                className={`mt-1 w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
                            ${otpLoading || (watchOTP("otp") || "").length < 6
                                        ? "bg-purple-900/40 cursor-not-allowed text-purple-400/60"
                                        : "bg-purple-600 hover:bg-purple-500 cursor-pointer text-white shadow-lg shadow-purple-900/40"
                                    }`}
                            >
                                {otpLoading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify OTP →"
                                )}
                            </button>

                            {/* ── Resend OTP ── */}
                            <div className="flex flex-col items-center gap-2 pt-1">
                                <p className="text-xs text-gray-600 font-light">Didn't receive the OTP?</p>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={countdown > 0 || resendLoading}
                                    className={`text-sm font-medium transition-all flex items-center gap-2
                                ${countdown > 0 || resendLoading
                                            ? "text-gray-600 cursor-not-allowed"
                                            : "text-purple-400 hover:text-purple-300 cursor-pointer"
                                        }`}
                                >
                                    {resendLoading ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : countdown > 0 ? (
                                        <span className="flex items-center gap-2">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-purple-900/60 text-xs text-purple-400 font-mono">
                                                {countdown}
                                            </span>
                                            Resend OTP
                                        </span>
                                    ) : (
                                        "Resend OTP"
                                    )}
                                </button>
                            </div>

                            <div className="h-px bg-purple-900/40" />

                            <button
                                type="button"
                                onClick={() => setStep("login")}
                                className="text-sm text-gray-500 hover:text-gray-300 transition-colors text-center font-light"
                            >
                                ← Back to login
                            </button>
                        </form>
                    )}
                </div>

                {/* ── Register link ── */}
                {step === "login" && (
                    <p className="text-center text-sm text-gray-600 mt-6 font-light">
                        Don't have an account?{" "}
                        <Link
                            to={ROUTES.REGISTER}
                            className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
                        >
                            Create one
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;