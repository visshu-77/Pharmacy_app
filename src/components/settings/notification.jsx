
import { useEffect, useState } from "react";
import SettingsHeading from "./settingHeading";
import { getNotification, updateNotification } from "../../services/userService";
// import { set } from "mongoose";

export default function Notification() {

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        orderNotifications: true,
        lowStockAlerts: true,
        subscriptionExpiryAlerts: true,
        paymentNotifications: true,
        promotionalUpdates: false
    });

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchNotification();
    }, []);

    const fetchNotification = async () => {
        try {
            setLoading(true);
            const data = await getNotification();

            if (data.notificationSettings) {
                setNotifications(data.notificationSettings)
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (name) => {
        try {
            setUpdating(true);
            const updatedNotifications = {
                ...notifications,
                [name]: !notifications[name]
            };

            console.log("sending data to backend", updatedNotifications)

            setNotifications(updatedNotifications);
            const response = await updateNotification(
                updatedNotifications
            );
            console.log("Notification updated:", response);
        } catch (error) {
            console.log("Update notification error:", error);
            setError(error?.response?.data?.message || "Something went wrong")
            fetchNotification();
        } finally {
            setUpdating(false);
        }
    };

    const notificationItems = [
        {
            key: "emailNotifications",
            title: "Email Notifications",
            description: "Receive all notifications via email."
        },
        {
            key: "orderNotifications",
            title: "Order Notifications",
            description: "Get notified when new orders are placed or updated."
        },
        {
            key: "lowStockAlerts",
            title: "Low Stock Alerts",
            description: "We'll alert you when products drop below stock threshold."
        },
        {
            key: "subscriptionExpiryAlerts",
            title: "Subscription Expiry Alerts",
            description: "Reminders 30, 15, and 7 days before your plan expires."
        },
        {
            key: "paymentNotifications",
            title: "Payment Notifications",
            description: "Confirmations and failures for all payment events."
        },
        {
            key: "promotionalUpdates",
            title: "Promotional Updates",
            description: "News, feature announcements, and special offers."
        }
    ];

    return (
        <div className="bg-white">

            <div>
                <SettingsHeading
                    heading="Notification"
                    content="Choose which notifications you want to receive."
                />
            </div>


            {loading ? (
                <div className="px-6 py-10 text-center text-gray-500">
                    Loading notification settings...
                </div>
            ) : (
                <div className="px-6">

                    {notificationItems.map((item) => {

                        const enabled = notifications[item.key];

                        return (
                            <div
                                key={item.key}
                                className="flex items-center justify-between py-5 border-b border-gray-100 last:border-b-0"
                            >

                                {/* Text */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {item.title}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Toggle */}
                                <button
                                    type="button"
                                    disabled={updating}
                                    onClick={() => handleToggle(item.key)}
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled
                                        ? "bg-blue-600"
                                        : "bg-gray-200"
                                        }`}
                                >

                                    <span
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${enabled
                                            ? "translate-x-6"
                                            : "translate-x-1"
                                            }`}
                                    />

                                </button>

                            </div>

                        );
                    })}
                </div>
            )}
            <div className="flex items-center justify-center text-red-500 text-xs">
               <p>{error}</p>
            </div>
        </div>
    )
}