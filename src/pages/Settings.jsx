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


export default function Settings() {

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");

    const menuItems = [
        {
            id: "profile",
            label: "Profile",
            icon: "👤"
        },
        {
            id: "business",
            label: "Business Information",
            icon: "🏢"
        },
        {
            id: "subscription",
            label: "Subscription",
            icon: "💳"
        },
        {
            id: "billing",
            label: "Billing & Payments",
            icon: "🧾"
        },
        {
            id: "security",
            label: "Security",
            icon: "🔒"
        },
        {
            id: "notifications",
            label: "Notifications",
            icon: "🔔"
        },
        {
            id: "preferences",
            label: "Preferences",
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
            <div className="min-h-screen bg-[#F7F9FC] p-6 mt-4">

                {/* Header */}

                <div className="mb-6">

                    <h1 className="text-3xl font-bold text-gray-900">
                        Settings
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage your account and business preferences
                    </p>

                </div>


                {/* Settings Layout */}

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                    <div className="flex min-h-[600px]">

                        {/* LEFT MENU */}

                        <aside className="w-[260px] border-r border-gray-200 p-4">

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
                                                ? "bg-blue-50 text-blue-600 font-semibold"
                                                : "text-gray-600 hover:bg-gray-50"
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

                            <div className="mt-8 pt-6 w-full">

                                <button
                                    onClick={handleLogout}
                                    className="w-full px-5 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition"
                                >
                                    Logout
                                </button>

                            </div>

                        </aside>


                        {/* RIGHT CONTENT */}

                        <main className="flex-1 p-8">

                            {activeTab === "profile" && (
                                <ProfileSettings />
                            )}

                            {activeTab === "business" && (
                                <BussinessSettings />
                            )}

                            {activeTab === "subscription" && (
                                <SubscriptionSettings />
                            )}

                            {activeTab === "billing" && (
                                <BillingSettings />
                            )}

                            {activeTab === "security" && (
                                <SecuritySettings />
                            )}

                            {activeTab === "notifications" && (
                                <NotificationSettings />
                            )}

                            {activeTab === "preferences" && (
                                <PreferenceSettings />
                            )}

                        </main>

                    </div>

                </div>

            </div>
        </div>
    );
}