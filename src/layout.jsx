import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import ProfileCard from './components/ProfileCard';
import GeminiAssistant from './components/gemini/GeminiAssistant';
import Logo from './components/brand/Logo';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen flex overflow-hidden bg-canvas">

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-fade-in"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={[
                    "fixed lg:static inset-y-0 left-0 z-50",
                    "w-[272px] shrink-0 h-full",
                    "transform transition-transform duration-300 ease-out",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                ].join(" ")}
            >
                <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden absolute right-3 top-5 z-10 grid place-items-center h-8 w-8 rounded-lg text-muted hover:bg-surface-hover"
                    aria-label="Close menu"
                >
                    <X className="w-4 h-4" />
                </button>

                <ProfileCard closeSidebar={() => setSidebarOpen(false)} />
            </aside>

            {/* Main column */}
            <div className="flex-1 min-w-0 flex flex-col h-full">

                {/* Mobile top bar */}
                <header className="lg:hidden flex items-center justify-between gap-3 px-4 h-14 bg-surface border-b border-line shrink-0">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="grid place-items-center h-9 w-9 rounded-lg border border-line text-heading hover:bg-surface-hover"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <Logo size="sm" />

                    <div className="w-9" />
                </header>

                {/* Only this scrolls */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden thin-scrollbar">
                    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-24">
                        <Outlet />
                    </div>
                </main>
            </div>

            <GeminiAssistant />
        </div>
    );
}
