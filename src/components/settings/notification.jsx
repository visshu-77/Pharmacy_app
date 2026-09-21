import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import SettingsHeading, { SettingsSection } from "./settingHeading";
import { Toggle } from "../ui/Field";
import { Spinner } from "../ui/State";
import { useToast } from "../ui/Toast";

import { getNotification, updateNotification } from "../../services/userService";
import { useBusiness } from "../../context/BusinessContext";

export default function Notification() {

    const { t } = useTranslation();
    const toast = useToast();
    const { profile, term } = useBusiness();

    const [settings, setSettings] = useState({
        emailNotifications: true,
        orderNotifications: true,
        lowStockAlerts: true,
        subscriptionExpiryAlerts: true,
        paymentNotifications: true,
        promotionalUpdates: false
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        getNotification()
            .then((data) => data.notificationSettings && setSettings(data.notificationSettings))
            .catch((err) => toast.error(err?.response?.data?.message || "Could not load notification settings"))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save each switch immediately; roll back if the server refuses.
    const toggle = async (key, value) => {
        const previous = settings;
        const next = { ...settings, [key]: value };

        setSettings(next);
        setUpdating(true);

        try {
            await updateNotification(next);
        } catch (err) {
            setSettings(previous);
            toast.error(err?.response?.data?.message || "Could not update");
        } finally {
            setUpdating(false);
        }
    };

    const groups = [
        {
            title: "Shop activity",
            items: [
                { key: "orderNotifications", title: t("NotificationInformation.OrderNotifications"), description: t("NotificationInformation.OrderNotificationsContent") },
                {
                    key: "lowStockAlerts",
                    title: profile.tracksExpiry ? "Low stock & expiry alerts" : t("NotificationInformation.LowStockAlerts"),
                    description: profile.tracksExpiry
                        ? `When ${term.itemsLower} run low or are close to expiry.`
                        : t("NotificationInformation.LowStockAlertsContent")
                },
                { key: "paymentNotifications", title: t("NotificationInformation.PaymentNotifications"), description: t("NotificationInformation.PaymentNotificationsContent") }
            ]
        },
        {
            title: "Account",
            items: [
                { key: "emailNotifications", title: t("NotificationInformation.EmailNotifications"), description: t("NotificationInformation.EmailNotificationsContent") },
                { key: "subscriptionExpiryAlerts", title: t("NotificationInformation.SubscriptionExpiryAlerts"), description: t("NotificationInformation.SubscriptionExpiryAlertsContent") },
                { key: "promotionalUpdates", title: t("NotificationInformation.PromotionalUpdates"), description: t("NotificationInformation.PromotionalUpdatesContent") }
            ]
        }
    ];

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            <SettingsHeading heading={t("NotificationInformation.title")} content={t("NotificationInformation.content")} />

            {groups.map((group) => (
                <SettingsSection key={group.title} title={group.title}>
                    <div className="divide-y divide-line -my-3">
                        {group.items.map((item) => (
                            <Toggle
                                key={item.key}
                                label={item.title}
                                description={item.description}
                                checked={Boolean(settings[item.key])}
                                disabled={updating}
                                onChange={(value) => toggle(item.key, value)}
                            />
                        ))}
                    </div>
                </SettingsSection>
            ))}
        </div>
    );
}
