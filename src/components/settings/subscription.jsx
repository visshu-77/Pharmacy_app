import { useTranslation } from "react-i18next";
import { Crown, CalendarDays, CalendarClock, Hourglass, ArrowRight, CalendarPlus, ShieldCheck } from "lucide-react";

import SettingsHeading, { SettingsSection } from "./settingHeading";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { Spinner, EmptyState } from "../ui/State";

import { useSubscription } from "../../context/SubscriptionContext";
import { useBusiness } from "../../context/BusinessContext";
import { planLabel } from "../../config/plans";
import { getSubscriptionTiming, formatPlanDate } from "../../utils/subscription";

export const cycleLabel = (duration) =>
    ({ monthly: "Monthly", sixMonths: "6 months", yearly: "Yearly" }[duration] || duration);

const BAR = {
    success: "bg-white",
    warning: "bg-amber-300",
    danger: "bg-red-300"
};

export default function SubscriptionSettings() {

    const { t } = useTranslation();
    const { subscription, subscriptionLoading, upcoming, accessEndsAt, now } = useSubscription();
    const { formatMoney } = useBusiness();

    if (subscriptionLoading && !subscription) return <Spinner />;

    if (!subscription) {
        return (
            <div>
                <SettingsHeading heading={t("SubscriptionInformation.title")} content={t("SubscriptionInformation.content")} />
                <SettingsSection>
                    <EmptyState
                        icon={Crown}
                        title="No active plan"
                        message="Your plan has ended or hasn't started. Renew to keep billing, inventory and reports running — your data is safe."
                        action={<Button to="/subscription" iconRight={ArrowRight}>See plan</Button>}
                    />
                </SettingsSection>
            </div>
        );
    }

    const timing = getSubscriptionTiming(subscription, now);
    const queued = upcoming || [];
    const extendsAccess = queued.length > 0 && accessEndsAt;

    return (
        <div className="space-y-6">
            <SettingsHeading
                heading={t("SubscriptionInformation.title")}
                content={t("SubscriptionInformation.content")}
                action={<Button to="/subscription" variant="secondary" size="sm">Renew or change cycle</Button>}
            />

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-indigo-600 p-6 text-white shadow-md">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" aria-hidden="true" />

                <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/75">
                            <Crown className="h-3.5 w-3.5" />
                            {t("SubscriptionInformation.CurrentPlan")}
                        </p>
                        <h3 className="mt-1 text-2xl font-bold text-white">{planLabel(subscription.plan)}</h3>
                        <p className="text-sm text-white/80 mt-1">
                            {formatMoney(subscription.price)} · {cycleLabel(subscription.duration)}
                        </p>
                    </div>
                    <span className="self-start rounded-full bg-white/20 px-3 py-1 text-xs font-semibold capitalize">
                        {timing.expired ? "Expired" : subscription.subscriptionStatus}
                    </span>
                </div>

                <div className="relative mt-6">
                    <div className="flex items-baseline justify-between text-xs text-white/85 mb-2 tabular">
                        <span>Day {Math.min(timing.usedDays + 1, timing.totalDays)} of {timing.totalDays}</span>
                        <span className="text-sm font-semibold text-white">{timing.label}</span>
                    </div>

                    {/* Drains from full (just bought) to empty (expires). */}
                    <div
                        className="h-2.5 rounded-full bg-white/25 overflow-hidden"
                        role="progressbar"
                        aria-label="Plan time remaining"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(timing.remainingPercent)}
                    >
                        <div
                            className={`h-full rounded-full transition-[width] duration-700 ${BAR[timing.tone]}`}
                            style={{ width: `${timing.remainingPercent}%` }}
                        />
                    </div>

                    <div className="flex justify-between text-[11px] text-white/70 mt-2 tabular">
                        <span>{formatPlanDate(timing.start)}</span>
                        <span>{formatPlanDate(timing.end)}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { icon: CalendarDays, label: "Started", value: formatPlanDate(timing.start) },
                    { icon: CalendarClock, label: "Ends", value: formatPlanDate(timing.end) },
                    { icon: Hourglass, label: "Days remaining", value: `${timing.remainingDays} of ${timing.totalDays}` },
                    { icon: ShieldCheck, label: t("SubscriptionInformation.PaymentStatus"), value: <Badge tone="success" size="sm">{subscription.paymentStatus}</Badge> }
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl border border-line bg-surface p-4">
                        <p className="flex items-center gap-1.5 text-xs text-muted">
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </p>
                        <div className="mt-1.5 font-semibold text-heading tabular">{value}</div>
                    </div>
                ))}
            </div>

            {extendsAccess && (
                <SettingsSection
                    title="Renewal already paid"
                    description={`Starts automatically when the current period ends. You're covered until ${formatPlanDate(accessEndsAt)}.`}
                >
                    <ul className="-my-2 divide-y divide-line">
                        {queued.map((sub) => (
                            <li key={sub._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                <span className="flex items-center gap-2.5 text-sm font-medium text-heading">
                                    <CalendarPlus className="h-4 w-4 text-primary" />
                                    {planLabel(sub.plan)} · {cycleLabel(sub.duration)}
                                </span>
                                <span className="text-sm text-muted tabular">
                                    {formatPlanDate(sub.startDate)} → {formatPlanDate(sub.endDate)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </SettingsSection>
            )}

            {!extendsAccess && timing.remainingDays <= 7 && (
                <div className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-4 ${timing.tone === "danger" ? "border-danger/30 bg-danger/10" : "border-warning/30 bg-warning/10"}`}>
                    <p className="flex-1 text-sm text-heading">
                        {timing.remainingDays === 0
                            ? <>Your plan <span className="font-semibold">ends today</span>.</>
                            : <>Your plan ends in <span className="font-semibold">{timing.label.replace(" left", "")}</span>.</>}
                        {" "}Renew now — the new period starts right after this one, so you won't lose any days.
                    </p>
                    <Button to="/subscription" size="sm">Renew now</Button>
                </div>
            )}
        </div>
    );
}
