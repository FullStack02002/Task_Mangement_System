import Header from "../shared/Header";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-[#0d0a1a]">
            <Header />
            <div className="h-16" />
            <Outlet />
        </div>
    );
};

export default DashboardLayout;