import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSettings from "../components/settings/profile";
import BussinessSettings from "../components/settings/bussiness";
import BillingSettings from "../components/settings/billing";
import SubscriptionSettings from "../components/settings/subscription";
import SecuritySettings from "../components/settings/security";
import NotificationSettings from "../components/settings/notification";
import PreferenceSettings from "../components/settings/preferences";
import LastParams from "../components/lastParams";

import { useTranslation } from "react-i18next";


export default function Settings() {
    const { t, i18n } = useTranslation();

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");

    const menuItems = [
        {
            id: "profile",
            label: t("settingSidebar.profile"),
            icon: "👤"
        },
        {
            id: "business",
            label: t("settingSidebar.businessInformation"),
            icon: "🏢"
        },
        {
            id: "subscription",
            label: t("settingSidebar.subscription"),
            icon: "💳"
        },
        {
            id: "billing",
            label: t("settingSidebar.billingAndPayments"),
            icon: "🧾"
        },
        {
            id: "security",
            label: t("settingSidebar.security"),
            icon: "🔒"
        },
        {
            id: "notifications",
            label: t("settingSidebar.notifications"),
            icon: "🔔"
        },
        {
            id: "preferences",
            label: t("settingSidebar.preferences"),
            icon: "⚙️"
        }
    ];

    const handleLogout = async () => {
        const confirmed = window.confirm("Are you sure you want to logout?")

        if (!confirmed) {
            return;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("rzp_checkout_anon_id");
        localStorage.removeItem("rzp_device_id");
        localStorage.removeItem("rzp_stored_checkout_id");

        navigate('/login', {
            replace: true
        })
    }

    return (
        <div>
            <div>
                <LastParams />
            </div>
            <div className="min-h-screen bg-[#F7F9FC] px-3 py-4 sm:px-6 sm:py-6 mt-4 dark:bg-darkColor dark:text-white">

                {/* Header */}

                <div className="mb-6">

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:bg-darkColor dark:text-white">
                        Settings
                    </h1>

                    <p className="text-sm sm:text-base text-gray-500 mt-1">
                        Manage your account and business preferences
                    </p>

                </div>

                {/* Settings Layout */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden dark:bg-darkColor dark:text-white dark:border dark:border-white">

                    {/* DESKTOP */}
                    <div className="hidden md:flex min-h-[600px]">

                        {/* LEFT MENU */}
                        <aside className="w-[260px] border-r border-gray-200 p-4 flex-shrink-0">

                            <div className="space-y-1">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`
                            w-full flex items-center gap-3
                            px-4 py-3
                            rounded-lg
                            text-left
                            transition
                            ${activeTab === item.id
                                                ? "bg-blue-50 text-blue-600 dark:text-black font-semibold"
                                                : "text-gray-600 hover:bg-gray-50 dark:text-white dark:hover:text-black"
                                            }
                        `}
                                    >
                                        <span className="text-lg">
                                            {item.icon}
                                        </span>

                                        <span className="text-sm">
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 pt-6">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-5 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition"
                                >
                                    Logout
                                </button>
                            </div>

                        </aside>

                        {/* DESKTOP CONTENT */}
                        <main className="flex-1 min-w-0 p-8">
                            {activeTab === "profile" && <ProfileSettings />}
                            {activeTab === "business" && <BussinessSettings />}
                            {activeTab === "subscription" && <SubscriptionSettings />}
                            {activeTab === "billing" && <BillingSettings />}
                            {activeTab === "security" && <SecuritySettings />}
                            {activeTab === "notifications" && <NotificationSettings />}
                            {activeTab === "preferences" && <PreferenceSettings />}
                        </main>

                    </div>


                    {/* MOBILE */}
                    <div className="md:hidden">

                        {/* Horizontal Navigation */}
                        <div className="border-b border-gray-200 overflow-x-auto">
                            <div className="flex min-w-max px-3 py-2 gap-2">

                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`
                            flex items-center gap-2
                            px-3 py-2
                            rounded-lg
                            whitespace-nowrap
                            text-sm
                            transition
                            ${activeTab === item.id
                                                ? "bg-blue-50 text-blue-600 font-semibold"
                                                : "text-gray-600 hover:bg-gray-50 dark:text-white dark:hover:text-black"
                                            }
                        `}
                                    >
                                        <span>
                                            {item.icon}
                                        </span>

                                        <span>
                                            {item.label}
                                        </span>
                                    </button>
                                ))}

                            </div>
                        </div>


                        {/* MOBILE CONTENT */}
                        <main className="p-4">

                            {activeTab === "profile" && <ProfileSettings />}
                            {activeTab === "business" && <BussinessSettings />}
                            {activeTab === "subscription" && <SubscriptionSettings />}
                            {activeTab === "billing" && <BillingSettings />}
                            {activeTab === "security" && <SecuritySettings />}
                            {activeTab === "notifications" && <NotificationSettings />}
                            {activeTab === "preferences" && <PreferenceSettings />}

                        </main>
                        <div className="md:hidden border-t border-gray-200 p-4 mt-4">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition"
                            >
                                <span>🚪</span>
                                Logout
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}