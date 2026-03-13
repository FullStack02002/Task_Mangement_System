import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../app/hook";
import { setAccessToken } from "../../features/auth/authSlice";
import { getCurrentUserThunk } from "../../features/auth/authThunks";
import { ROUTES } from "../../routes/routePaths";

const GoogleAuthSuccess = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("accessToken");

        if (!token) {
            navigate(ROUTES.LOGIN, { replace: true });
            return;
        }

        const finish = async () => {

            dispatch(setAccessToken(token));

            window.history.replaceState({}, "", "/auth/google/success");

            const result = await (dispatch as any)(getCurrentUserThunk());

            if (result.meta.requestStatus === "fulfilled" && result.payload !== null) {
                navigate(ROUTES.HOME, { replace: true });
            } else {
                navigate(ROUTES.LOGIN, { replace: true });
            }
        };

        finish();
    }, []);

    return (
        <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-4">
            <div className="flex flex-col items-center gap-6">

                {/* ── Logo ── */}
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-600/40 flex items-center justify-center mb-2">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="3" width="12" height="2" rx="1" fill="#a78bfa" />
                        <rect x="2" y="7" width="8" height="2" rx="1" fill="#a78bfa" opacity="0.7" />
                        <rect x="2" y="11" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.4" />
                    </svg>
                </div>

                {/* ── Spinner ── */}
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border border-purple-900/50" />
                    <div className="absolute inset-0 rounded-full border border-t-purple-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>

                {/* ── Text ── */}
                <div className="text-center">
                    <p className="text-white text-sm font-light mb-1">
                        Signing you in with Google
                    </p>
                    <p className="text-gray-600 text-xs font-light">
                        Please wait, this won't take long...
                    </p>
                </div>

            </div>
        </div>
    );
};

export default GoogleAuthSuccess;