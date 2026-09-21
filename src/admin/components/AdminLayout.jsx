import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import Logo from "../../components/brand/Logo";

export default function AdminLayout() {

    const [open, setOpen] = useState(false);

    return (
        <div className="h-screen flex overflow-hidden bg-canvas">

            {open && (
                <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
            )}

            <aside
                className={[
                    "fixed lg:static inset-y-0 left-0 z-50 w-[260px] shrink-0 h-full",
                    "transform transition-transform duration-300",
                    open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                ].join(" ")}
            >
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="lg:hidden absolute right-3 top-5 z-10 grid place-items-center h-8 w-8 rounded-lg text-muted hover:bg-surface-hover"
                    aria-label="Close menu"
                >
                    <X className="h-4 w-4" />
                </button>
                <AdminSidebar onNavigate={() => setOpen(false)} />
            </aside>

            <div className="flex-1 min-w-0 flex flex-col">
                <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-surface border-b border-line shrink-0">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="grid place-items-center h-9 w-9 rounded-lg border border-line"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <Logo size="sm" />
                    <div className="w-9" />
                </header>

                <main className="flex-1 overflow-y-auto thin-scrollbar">
                    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
