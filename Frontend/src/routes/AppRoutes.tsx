import { Routes, Route } from "react-router-dom";
import { ROUTES } from "./routePaths";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import {
    Login, Register, Home, VerifyEmail,
    ForgotPassword, ResetPassword, GoogleAuthSuccess, Dashboard
} from "../pages/index.ts"
import DashboardLayout from "../components/layout/DashboardLayout.tsx";

const AppRoutes = () => {
    return (
        <Routes>

            {/* ── Protected Routes ── */}
            <Route path={ROUTES.LOGIN} element={
                <ProtectedRoute authentication={false}>
                    <Login />
                </ProtectedRoute>
            } />

            <Route path={ROUTES.REGISTER} element={
                <ProtectedRoute authentication={false}>
                    <Register />
                </ProtectedRoute>
            } />

            <Route path={ROUTES.VERIFY_EMAIL} element={
                <ProtectedRoute authentication={false}>
                    <VerifyEmail />
                </ProtectedRoute>
            } />

            <Route path={ROUTES.FORGOT_PASSWORD} element={
                <ProtectedRoute authentication={false}>
                    <ForgotPassword />
                </ProtectedRoute>
            } />

            <Route path={ROUTES.RESET_PASSWORD} element={
                <ProtectedRoute authentication={false}>
                    <ResetPassword />
                </ProtectedRoute>
            } />

            <Route element={<DashboardLayout />}>
                <Route path={ROUTES.DASHBOARD} element={
                    <ProtectedRoute authentication={true}>
                        <Dashboard />
                    </ProtectedRoute>
                } />
            </Route>


            <Route path={ROUTES.GOOGLE_AUTH_SUCCESS} element={<GoogleAuthSuccess />} />




            {/* ── Public Routes ── */}

            <Route path={ROUTES.HOME} element={
                <Home />
            }
            />

        </Routes>
    );
};

export default AppRoutes;