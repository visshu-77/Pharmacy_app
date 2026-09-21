import { useTranslation } from "react-i18next";
import { Crown, CalendarDays, CalendarClock, Hourglass, ArrowRight } from "lucide-react";

import SettingsHeading, { SettingsSection } from "./settingHeading";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { Spinner, EmptyState } from "../ui/State";

import { useSubscription } from "../../context/SubscriptionContext";
import { useBusiness } from "../../context/BusinessContext";

export const cycleLabel = (duration) =>
    ({ monthly: "Monthly", sixMonths: "6 months", yearly: "Yearly" }[duration] || duration);

const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const daysLeft = (endDate) =>
    endDate ? Math.max(0, Math.ceil((new Date(endDate) - new Date()) / 86400000)) : 0;

const elapsedPercent = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const total = new Date(endDate).getTime() - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round(((Date.now() - start) / total) * 100)));
};

export default function SubscriptionSettings() {

    const { t } = useTranslation();
    const { subscription, subscriptionLoading } = useSubscription();
    const { formatMoney } = useBusiness();

    if (subscriptionLoading) return <Spinner />;

    if (!subscription) {
        return (
            <div>
                <SettingsHeading heading={t("SubscriptionInformation.title")} content={t("SubscriptionInformation.content")} />
                <SettingsSection>
                    <EmptyState
                        icon={Crown}
                        title="No active plan"
                        message="Choose a plan to keep billing, inventory and reports running."
                        action={<Button to="/subscription" iconRight={ArrowRight}>See plans</Button>}
                    />
                </SettingsSection>
            </div>
        );
    }

    const used = elapsedPercent(subscription.startDate, subscription.endDate);
    const remaining = daysLeft(subscription.endDate);

    return (
        <div className="space-y-6">
            <SettingsHeading
                heading={t("SubscriptionInformation.title")}
                content={t("SubscriptionInformation.content")}
                action={<Button to="/subscription" variant="secondary" size="sm">Change plan</Button>}
            />

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-indigo-600 p-6 text-white shadow-md">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
                <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/75">
                            <Crown className="h-3.5 w-3.5" />
                            {t("SubscriptionInformation.CurrentPlan")}
                        </p>
                        <h3 className="mt-1 text-2xl font-bold capitalize text-white">{subscription.plan} plan</h3>
                        <p className="text-sm text-white/80 mt-1">
                            {formatMoney(subscription.price)} · {cycleLabel(subscription.duration)}
                        </p>
                    </div>
                    <span className="self-start rounded-full bg-white/20 px-3 py-1 text-xs font-semibold capitalize">
                        {subscription.subscriptionStatus}
                    </span>
                </div>

                <div className="relative mt-6">
                    <div className="flex justify-between text-xs text-white/80 mb-2">
                        <span>{t("SubscriptionInformation.SubscriptionPeriod")}</span>
                        <span>{remaining} days left</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/25 overflow-hidden">
                        <div className="h-full rounded-full bg-white" style={{ width: `${used}%` }} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { icon: CalendarDays, label: "Started", value: formatDate(subscription.startDate) },
                    { icon: CalendarClock, label: "Renews / ends", value: formatDate(subscription.endDate) },
                    { icon: Hourglass, label: "Days remaining", value: remaining },
                    { icon: Crown, label: t("SubscriptionInformation.PaymentStatus"), value: <Badge tone="success" size="sm">{subscription.paymentStatus}</Badge> }
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl border border-line bg-surface p-4">
                        <p className="flex items-center gap-1.5 text-xs text-muted">
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </p>
                        <div className="mt-1.5 font-semibold text-heading capitalize">{value}</div>
                    </div>
                ))}
            </div>

            {remaining <= 7 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
                    <p className="flex-1 text-sm text-heading">
                        Your plan ends in <span className="font-semibold">{remaining} day{remaining === 1 ? "" : "s"}</span>. Renew to avoid interruptions at the counter.
                    </p>
                    <Button to="/subscription" size="sm">Renew now</Button>
                </div>
            )}
        </div>
    );
}
