import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 min-w-0">

                <Outlet />

            </main>

        </div>
    );
}