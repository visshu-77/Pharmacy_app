import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import ProfileCard from './components/ProfileCard';
import GeminiAssistant from './components/gemini/GeminiAssistant';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen overflow-hidden p-2 sm:p-4">

            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-3 lg:hidden">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg bg-white shadow"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <h2 className="font-bold text-lg">MediTask</h2>

                <div className="w-10" />
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                />
            )}

            {/* Main Layout */}
            <div className="flex gap-10 h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)]">

                {/* Sidebar */}
                <aside
                    className={`
                        fixed lg:relative
                        top-0 left-0
                        z-50
                        h-full
                        w-[280px] lg:w-[15%]
                        flex-shrink-0
                        bg-white
                        transform transition-transform duration-300
                        overflow-hidden
                        ${sidebarOpen
                            ? 'translate-x-0'
                            : '-translate-x-full lg:translate-x-0'
                        }
                    `}
                >
                    {/* Close button - mobile only */}
                    <div className="flex justify-end p-2 lg:hidden">
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <ProfileCard
                        closeSidebar={() => setSidebarOpen(false)}
                    />
                </aside>

                {/* Main Content - ONLY THIS SCROLLS */}
                <main className="w-full lg:w-[85%] h-full overflow-y-auto overflow-x-hidden">
                    <Outlet />
                </main>

                <GeminiAssistant />
            </div>
        </div>
    );
}