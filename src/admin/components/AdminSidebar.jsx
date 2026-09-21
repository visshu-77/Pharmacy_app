import { LayoutDashboard, Users, LogOut, Moon, Sun, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";

import Logo from "../../components/brand/Logo";
import { useTheme } from "../../context/ThemeContext";
import { logout } from "../../utils/session";

const MENU = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
    { name: "Shops", path: "/admin/customers", icon: Users }
];

export const adminLogout = logout;

export default function AdminSidebar({ onNavigate }) {

    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex h-full flex-col bg-surface border-r border-line">
            <div className="px-5 pt-5 pb-4">
                <Logo />
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Platform admin
                </span>
            </div>

            <nav className="flex-1 px-3 py-2" aria-label="Admin">
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-faint">Management</p>
                <ul className="space-y-0.5">
                    {MENU.map(({ name, path, icon: Icon, end }) => (
                        <li key={path}>
                            <NavLink
                                to={path}
                                end={end}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    [
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-hover hover:text-heading"
                                    ].join(" ")
                                }
                            >
                                <Icon className="h-[18px] w-[18px]" />
                                {name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="border-t border-line p-4 flex gap-2">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-line text-xs font-semibold text-muted hover:bg-surface-hover hover:text-heading transition-colors"
                >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {theme === "dark" ? "Light" : "Dark"}
                </button>
                <button
                    type="button"
                    onClick={adminLogout}
                    className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-line text-xs font-semibold text-muted hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
