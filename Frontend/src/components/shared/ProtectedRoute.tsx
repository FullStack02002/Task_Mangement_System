import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../app/hook";
import { ROUTES } from "../../routes/routePaths";

interface ProtectedRouteProps {
    children: React.ReactNode;
    authentication: boolean;
}

const ProtectedRoute = ({ children, authentication }: ProtectedRouteProps) => {
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
    const restoreLoading  = useAppSelector((state) => state.auth.restoreLoading);

      if (restoreLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (loading) return <div>Loading...</div>;

    if (authentication && !isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

     if (!authentication && isAuthenticated) {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;