import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    LayoutDashboard,
    ReceiptText,
    Package,
    Tags,
    Truck,
    ChartNoAxesCombined,
    Crown,
    Settings2,
    LogOut,
    Moon,
    Sun
} from "lucide-react";

import Logo from "./brand/Logo";
import { useSubscription } from "../context/SubscriptionContext";
import { useBusiness } from "../context/BusinessContext";
import { useTheme } from "../context/ThemeContext";
import { logout } from "../utils/session";

const daysUntil = (endDate) => {
    const difference = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
};

/**
 * Main navigation. The file keeps its historical name because layout.jsx and
 * other screens import it; it is the sidebar, not a profile card.
 */
export default function ProfileCard({ closeSidebar }) {

    const { t } = useTranslation();

    const { subscription, subscriptionLoading } = useSubscription();
    const { profile, term, shopName } = useBusiness();
    const { theme, toggleTheme } = useTheme();

    const BusinessIcon = profile.icon;

    const groups = [
        {
            label: "Overview",
            items: [
                { icon: LayoutDashboard, name: t("sidebar.dashboard"), path: "/", end: true },
                { icon: ReceiptText, name: t("sidebar.billing"), path: "/billing" }
            ]
        },
        {
            label: "Inventory",
            items: [
                // Label follows the shop: "Medicines", "Items", "Parts"…
                { icon: Package, name: term.items, path: "/product" },
                { icon: Tags, name: term.categories, path: "/category" },
                { icon: Truck, name: term.suppliers, path: "/suppliers" }
            ]
        },
        {
            label: "Insights",
            items: [
                { icon: ChartNoAxesCombined, name: t("sidebar.reports"), path: "/reports" }
            ]
        },
        {
            label: "Account",
            items: [
                { icon: Crown, name: t("sidebar.subscription"), path: "/subscription" },
                { icon: Settings2, name: t("sidebar.settings"), path: "/settings" }
            ]
        }
    ];

    const handleLogout = () => {
        closeSidebar?.();
        logout();
    };

    const remaining = subscription ? daysUntil(subscription.endDate) : 0;

    return (
        <div className="flex h-full flex-col bg-surface border-r border-line">

            {/* Brand */}
            <div className="px-5 pt-5 pb-4">
                <Logo showTagline />
            </div>

            {/* Shop identity */}
            <div className="mx-4 mb-2 rounded-xl border border-line bg-surface-muted p-3">
                <div className="flex items-center gap-3">
                    <span
                        className="grid place-items-center h-9 w-9 shrink-0 rounded-lg text-white"
                        style={{ backgroundColor: profile.accent }}
                    >
                        <BusinessIcon className="h-4 w-4" aria-hidden="true" />
                    </span>

                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-heading truncate">
                            {shopName}
                        </p>
                        <p className="text-[11px] text-muted truncate">
                            {profile.shortLabel}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto thin-scrollbar px-3 py-2" aria-label="Main">
                {groups.map((group) => (
                    <div key={group.label} className="mb-4">
                        <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-faint">
                            {group.label}
                        </p>

                        <ul className="space-y-0.5">
                            {group.items.map(({ icon: Icon, name, path, end }) => (
                                <li key={path}>
                                    <NavLink
                                        to={path}
                                        end={end}
                                        onClick={closeSidebar}
                                        className={({ isActive }) =>
                                            [
                                                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted hover:bg-surface-hover hover:text-heading"
                                            ].join(" ")
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <span
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                                                <span className="truncate">{name}</span>
                                            </>
                                        )}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-line p-4 space-y-3">

                {!subscriptionLoading && (
                    subscription ? (
                        <NavLink
                            to="/subscription"
                            onClick={closeSidebar}
                            className="block rounded-xl bg-gradient-to-br from-primary to-indigo-600 p-3.5 text-white shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold capitalize">
                                    {subscription.plan} plan
                                </p>
                                <Crown className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                            </div>

                            <p className="text-[11px] text-white/80 mt-0.5">
                                {remaining} day{remaining === 1 ? "" : "s"} remaining
                            </p>

                            <div className="mt-2 h-1.5 rounded-full bg-white/25 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-white"
                                    style={{ width: `${Math.min(100, (remaining / 30) * 100)}%` }}
                                />
                            </div>
                        </NavLink>
                    ) : (
                        <NavLink
                            to="/subscription"
                            onClick={closeSidebar}
                            className="block rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-3 hover:bg-warning/15 transition-colors"
                        >
                            <p className="text-xs font-semibold text-warning">
                                No active plan
                            </p>
                            <p className="text-[11px] text-muted mt-0.5">
                                Choose a plan to unlock {term.itemsLower}, billing and reports.
                            </p>
                        </NavLink>
                    )
                )}

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-line text-xs font-semibold text-muted hover:bg-surface-hover hover:text-heading transition-colors"
                        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    >
                        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        {theme === "dark" ? "Light" : "Dark"}
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-line text-xs font-semibold text-muted hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        {t("common.logout")}
                    </button>
                </div>
            </div>
        </div>
    );
}
