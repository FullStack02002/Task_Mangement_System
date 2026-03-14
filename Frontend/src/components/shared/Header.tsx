import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import { logoutThunk } from "../../features/auth/authThunks";
import { ROUTES } from "../../routes/routePaths";
import { useLocation } from "react-router-dom";


const Header = () => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const user = useAppSelector((state) => state.auth.user);
    const loading = useAppSelector((state) => state.auth.logoutLoading);
    const location = useLocation();
    const isDashboard = location.pathname === ROUTES.DASHBOARD;

    const handleLogout = () => {
        (dispatch as any)(logoutThunk());
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#0d0a1a]/95 backdrop-blur-md border-b border-purple-900/40">
            <div className="max-w-4xl mx-auto flex items-center justify-between">

                {/* ── Logo ── */}
                <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-600/40 flex items-center justify-center group-hover:bg-purple-600/30 transition-all">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="3" width="12" height="2" rx="1" fill="#a78bfa" />
                            <rect x="2" y="7" width="8" height="2" rx="1" fill="#a78bfa" opacity="0.7" />
                            <rect x="2" y="11" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.4" />
                        </svg>
                    </div>
                    <span className="text-white font-medium text-base tracking-tight">
                        Task<span className="text-purple-400">Flow</span>
                    </span>
                </Link>

                {/* ── Nav ── */}
                <nav className="hidden md:flex items-center gap-7">
                    <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                        Features
                    </a>
                    <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                        How it works
                    </a>
                </nav>

                {/* ── Auth Buttons ── */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <span className="text-sm text-gray-400 hidden md:flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                <span className="text-gray-300">
                                    {user?.name}
                                </span>
                            </span>

                            {!isDashboard && (
                                <Link
                                    to={ROUTES.DASHBOARD}
                                    className="text-sm text-white px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/40 font-medium"
                                >
                                    Dashboard
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                className={`text-sm px-4 py-2 rounded-lg border transition-all flex items-center gap-2 font-light
                                    ${loading
                                        ? "bg-red-900/10 border-red-900/30 cursor-not-allowed text-red-400/60"
                                        : "bg-transparent border-purple-900/60 text-gray-300 hover:border-red-800/60 hover:text-red-400 cursor-pointer"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                        Signing out...
                                    </>
                                ) : (
                                    "Sign out"
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to={ROUTES.LOGIN}
                                className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg border border-purple-900/50 hover:border-purple-700/60 transition-all font-light"
                            >
                                Sign in
                            </Link>
                            <Link
                                to={ROUTES.REGISTER}
                                className="text-sm text-white px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/40 font-medium"
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
