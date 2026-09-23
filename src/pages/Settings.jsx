import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Settings2,
    User,
    Store,
    Crown,
    Receipt,
    ShieldCheck,
    Bell,
    SlidersHorizontal,
    LogOut
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import { logout } from "../utils/session";
import Card from "../components/ui/Card";
import { ConfirmDialog } from "../components/ui/Modal";

import ProfileSettings from "../components/settings/profile";
import BussinessSettings from "../components/settings/bussiness";
import BillingSettings from "../components/settings/billing";
import SubscriptionSettings from "../components/settings/subscription";
import SecuritySettings from "../components/settings/security";
import NotificationSettings from "../components/settings/notification";
import PreferenceSettings from "../components/settings/preferences";

const PANELS = {
    profile: ProfileSettings,
    business: BussinessSettings,
    subscription: SubscriptionSettings,
    billing: BillingSettings,
    security: SecuritySettings,
    notifications: NotificationSettings,
    preferences: PreferenceSettings
};

export default function Settings() {

    const { t } = useTranslation();

    // Tab lives in the URL (?tab=notifications) so it can be linked and
    // survives a refresh.
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const activeTab = PANELS[tabFromUrl] ? tabFromUrl : "business";

    const setActiveTab = (id) =>
        setSearchParams(id === "business" ? {} : { tab: id }, { replace: true });

    const [confirmLogout, setConfirmLogout] = useState(false);

    const menuItems = [
        { id: "business", label: t("settingSidebar.businessInformation"), icon: Store },
        { id: "profile", label: t("settingSidebar.profile"), icon: User },
        { id: "preferences", label: t("settingSidebar.preferences"), icon: SlidersHorizontal },
        { id: "notifications", label: t("settingSidebar.notifications"), icon: Bell },
        { id: "security", label: t("settingSidebar.security"), icon: ShieldCheck },
        { id: "subscription", label: t("settingSidebar.subscription"), icon: Crown },
        { id: "billing", label: t("settingSidebar.billingAndPayments"), icon: Receipt }
    ];

    const handleLogout = () => logout();

    // On phones the tabs scroll sideways; keep the selected one in view.
    const focusActiveTab = useCallback((node) => {
        node?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }, []);

    const Panel = PANELS[activeTab];

    return (
        <div className="space-y-6">
            <PageHeader icon={Settings2} title={t("settings.title")} subtitle="Manage your shop, account and preferences" />

            <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6 items-start">

                {/* Menu */}
                <nav aria-label="Settings sections" className="lg:sticky lg:top-4">
                    <div className="flex lg:flex-col gap-1 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                        {menuItems.map(({ id, label, icon: Icon }) => {
                            const active = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    ref={active ? focusActiveTab : undefined}
                                    type="button"
                                    onClick={() => setActiveTab(id)}
                                    aria-current={active ? "page" : undefined}
                                    className={[
                                        "flex items-center gap-3 shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                                        active
                                            ? "bg-surface text-primary shadow-card"
                                            : "text-muted hover:bg-surface-hover hover:text-heading"
                                    ].join(" ")}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {label}
                                </button>
                            );
                        })}

                        <div className="hidden lg:block h-px bg-line my-3" />

                        <button
                            type="button"
                            onClick={() => setConfirmLogout(true)}
                            className="flex items-center gap-3 shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger/10 whitespace-nowrap transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            {t("common.logout")}
                        </button>
                    </div>
                </nav>

                {/* Content */}
                <Card className="p-5 sm:p-7 min-w-0">
                    <Panel />
                </Card>
            </div>

            <ConfirmDialog
                open={confirmLogout}
                tone="primary"
                onCancel={() => setConfirmLogout(false)}
                onConfirm={handleLogout}
                confirmLabel="Log out"
                title="Log out of StoreFlow?"
                message="The current unsaved bill will be cleared from this device."
            />
        </div>
    );
}
