import {
    LayoutDashboard,
    Users,
    LogOut
} from "lucide-react";

import {
    NavLink,
    useNavigate
} from "react-router-dom";

export default function AdminSidebar() {

    const navigate = useNavigate();

    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/login", {
            replace: true
        });

    };


    const menuItems = [
        {
            name: "Dashboard",
            path: "/admin",
            icon: LayoutDashboard
        },
        {
            name: "Customers",
            path: "/admin/customers",
            icon: Users
        }
    ];


    return (
        <aside className="hidden md:flex w-64 min-h-screen bg-white border-r border-gray-200 flex-col">

            {/* Logo */}
            <div className="h-16 px-6 flex items-center border-b border-gray-200">

                <h1 className="text-xl font-bold text-primary">
                    MediStock
                </h1>

                <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                    Admin
                </span>

            </div>


            {/* Navigation */}
            <nav className="flex-1 p-4">

                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-3">
                    Management
                </p>

                <div className="space-y-1">

                    {menuItems.map((item) => {

                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/admin"}
                                className={({ isActive }) =>
                                    `
                                    flex items-center gap-3
                                    px-3 py-2.5
                                    rounded-lg
                                    text-sm font-medium
                                    transition
                                    ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }
                                    `
                                }
                            >

                                <Icon size={18} />

                                <span>
                                    {item.name}
                                </span>

                            </NavLink>
                        );

                    })}

                </div>

            </nav>


            {/* Logout */}
            <div className="p-4 border-t border-gray-200">

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
                >

                    <LogOut size={18} />

                    Logout

                </button>

            </div>

        </aside>
    );
}
