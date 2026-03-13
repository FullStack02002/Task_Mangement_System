import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ROUTES } from "../../routes/routePaths";
import { verifyEmailThunk, resendVerificationThunk } from "../../features/auth/authThunks";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import { resetVerifyState } from "../../features/auth/authSlice";
import { maskEmail } from "../../utils/maskEmail";

const RESEND_COOLDOWN = 60;

const Logo = () => (
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-600/40 mb-5">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="2" rx="1" fill="#a78bfa" />
            <rect x="2" y="7" width="8" height="2" rx="1" fill="#a78bfa" opacity="0.7" />
            <rect x="2" y="11" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.4" />
        </svg>
    </div>
);


const VerifyEmail = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");
    const email = searchParams.get("email") || localStorage.getItem("pendingEmail") || "";

    const verifying = useAppSelector((state) => state.auth.verifyingemail);
    const verified = useAppSelector((state) => state.auth.emailverified);
    const resending = useAppSelector((state) => state.auth.resendingemail);
    const verifyEmailFailed = useAppSelector((state) => state.auth.verifyEmailFailed)

    const [countdown, setCountdown] = useState(0);

    // guard — redirect if no token and no pendingEmail

    useEffect(() => {
        const hasPendingEmail = localStorage.getItem("pendingEmail");
        const hasTokenInURL = token && searchParams.get("email");

        if (!hasPendingEmail && !hasTokenInURL) {
            navigate(ROUTES.REGISTER, { replace: true });
        }
    }, []);




    //  auto verify when token is in URL
    useEffect(() => {
        dispatch(resetVerifyState())
        if (token && email) {
            handleVerify();
        }
    }, []);


    //  countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);


    //  call verify API 
    const handleVerify = async () => {
        if (!token || !email) return;

        const result = await (dispatch as any)(verifyEmailThunk({ token, email }));


        if (result.meta.requestStatus === "fulfilled" && result.payload !== null) {
            localStorage.removeItem("pendingEmail");
            setTimeout(() => navigate(ROUTES.LOGIN), 2000);
        }
    };


    //  resend verification email using thunk
    const handleResend = async () => {
        if (countdown > 0 || resending || !email) return;

        const result = await (dispatch as any)(resendVerificationThunk({ email }));

        if (result.meta.requestStatus === "fulfilled" && result.payload !== null) {
            setCountdown(RESEND_COOLDOWN);
        }
    };


    // ─────────────────────────────────────────
    // UI — Verifying state
    // ─────────────────────────────────────────
    if (verifying) {
        return (
            <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Logo />
                        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
                            Verifying your email
                        </h1>
                        <p className="text-gray-500 text-sm font-light">
                            Please wait a moment...
                        </p>
                    </div>
                    <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-8 flex flex-col items-center gap-5">
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 rounded-full border border-purple-900/50" />
                            <div className="absolute inset-0 rounded-full border border-t-purple-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                        </div>
                        <p className="text-xs text-gray-600 font-light">
                            This won't take long...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────
    // UI — Verified state
    // ─────────────────────────────────────────
    if (verified) {
        return (
            <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Logo />
                        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
                            Email verified
                        </h1>
                        <p className="text-gray-500 text-sm font-light">
                            Your account is ready. Redirecting to login...
                        </p>
                    </div>
                    <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-8 text-center">
                        <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl px-4 py-3 mb-6">
                            <p className="text-xs text-purple-300 font-light">
                                Verification successful — you can now <span className="font-medium text-purple-200">sign in</span>
                            </p>
                        </div>
                        <div className="flex justify-center mb-6">
                            <div className="relative w-8 h-8">
                                <div className="absolute inset-0 rounded-full border border-purple-900/50" />
                                <div className="absolute inset-0 rounded-full border border-t-purple-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                            </div>
                        </div>
                        <Link
                            to={ROUTES.LOGIN}
                            className="block w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all text-center shadow-lg shadow-purple-900/40"
                        >
                            Go to login →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    if (verifyEmailFailed) {
        return (
            <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Logo />
                        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
                            Link expired or invalid
                        </h1>
                        <p className="text-gray-500 text-sm font-light">
                            This verification link has expired. Request a new one below.
                        </p>
                    </div>
                    <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-8 text-center">

                        <div className="bg-red-950/30 border border-red-800/40 rounded-xl px-4 py-3 mb-6">
                            <p className="text-xs text-red-400 font-light">
                                Verification links expire after <span className="font-medium text-red-300">10 minutes</span>
                            </p>
                        </div>

                        <button
                            onClick={handleResend}
                            disabled={countdown > 0 || resending}
                            className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
                                ${countdown > 0 || resending
                                    ? "bg-purple-900/40 cursor-not-allowed text-purple-400/60"
                                    : "bg-purple-600 hover:bg-purple-500 cursor-pointer text-white shadow-lg shadow-purple-900/40"
                                }`}
                        >
                            {resending ? (
                                <>
                                    <div className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : countdown > 0 ? (
                                <span className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-purple-900/60 text-xs text-purple-400 font-mono">
                                        {countdown}
                                    </span>
                                    Resend verification email
                                </span>
                            ) : (
                                "Send new verification email →"
                            )}
                        </button>

                        {email && (
                            <p className="text-xs text-gray-600 font-light mt-4">
                                Sending to{" "}
                                <span className="text-purple-400 font-medium">{maskEmail(email)}</span>
                            </p>
                        )}

                        <div className="h-px bg-purple-900/40 my-5" />

                        <p className="text-sm text-gray-600 font-light">
                            Already verified?{" "}
                            <Link to={ROUTES.LOGIN} className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────
    // UI — Waiting / Resend
    // ─────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <Logo />
                    <h1 className="text-2xl font-light text-white tracking-tight mb-2">
                        Check your email
                    </h1>
                    <p className="text-gray-500 text-sm font-light">
                        We sent a verification link to your inbox
                    </p>
                </div>

                <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-8 text-center">

                    <p className="text-xs text-gray-500 font-light mb-1">Verification link sent to</p>
                    <p className="text-base font-medium text-purple-400 mb-6">
                        {email ? maskEmail(email) : "your email"}
                    </p>

                    <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl px-4 py-3 mb-6">
                        <p className="text-xs text-purple-300 font-light">
                            Link expires in <span className="font-medium text-purple-200">10 minutes</span>
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-2 mb-6">
                        <p className="text-xs text-gray-600 font-light">Didn't receive the email?</p>
                        <button
                            onClick={handleResend}
                            disabled={countdown > 0 || resending}
                            className={`text-sm font-medium transition-all flex items-center gap-2
                                ${countdown > 0 || resending
                                    ? "text-gray-600 cursor-not-allowed"
                                    : "text-purple-400 hover:text-purple-300 cursor-pointer"
                                }`}
                        >
                            {resending ? (
                                <>
                                    <div className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : countdown > 0 ? (
                                <span className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-purple-900/60 text-xs text-purple-400 font-mono">
                                        {countdown}
                                    </span>
                                    Resend verification email
                                </span>
                            ) : (
                                "Resend verification email"
                            )}
                        </button>
                    </div>

                    <div className="h-px bg-purple-900/40 mb-5" />

                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-gray-600 font-light">
                            Wrong email?{" "}
                            <Link
                                to={ROUTES.REGISTER}
                                className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
                                onClick={() => localStorage.removeItem("pendingEmail")}
                            >
                                Register again
                            </Link>
                        </p>
                        <p className="text-xs text-gray-600 font-light">
                            Already verified?{" "}
                            <Link to={ROUTES.LOGIN} className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;