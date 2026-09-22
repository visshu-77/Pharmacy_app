import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarClock, ShieldCheck, Crown } from "lucide-react";

import Modal from "./ui/Modal";
import Button from "./ui/Button";

import { useSubscription } from "../context/SubscriptionContext";
import { useBusiness } from "../context/BusinessContext";
import { getSubscriptionTiming, formatPlanDate } from "../utils/subscription";
import { planLabel } from "../config/plans";

/** Start warning this many days before the plan ends. */
export const REMINDER_DAYS = 7;

const DAY = 24 * 60 * 60 * 1000;

// Cleared on logout (see utils/session.js), so it shows once per login.
const SHOWN_KEY = "storeflow.planReminderShown";

const alreadyShown = () => {
    try {
        return sessionStorage.getItem(SHOWN_KEY) === "1";
    } catch {
        return false;
    }
};

const markShown = () => {
    try {
        sessionStorage.setItem(SHOWN_KEY, "1");
    } catch {
        // No sessionStorage: the popup may show again next load — harmless.
    }
};

/**
 * Popup shown once after sign-in when the plan is about to end (last
 * REMINDER_DAYS days), or has already ended. Stays quiet when a renewal is
 * already paid for.
 */
export default function PlanReminder() {

    const navigate = useNavigate();
    const location = useLocation();

    const { subscription, subscriptionLoading, upcoming, lastEnded, now } = useSubscription();
    const { term, formatNumber } = useBusiness();

    const [open, setOpen] = useState(false);
    const [kind, setKind] = useState(null); // "ending" | "ended"

    useEffect(() => {
        if (subscriptionLoading || alreadyShown()) return;

        if (subscription) {
            const timing = getSubscriptionTiming(subscription, now);
            const renewalQueued = upcoming?.length > 0;

            if (timing && !renewalQueued && timing.remainingDays <= REMINDER_DAYS) {
                setKind("ending");
                setOpen(true);
            }
        } else if (lastEnded) {
            setKind("ended");
            setOpen(true);
        }

        // Decided for this login either way — don't re-evaluate on every tick.
        markShown();
    }, [subscriptionLoading, subscription, upcoming, lastEnded, now]);

    if (!open) return null;

    const close = () => setOpen(false);

    const renew = () => {
        close();
        if (location.pathname !== "/subscription") navigate("/subscription");
    };

    if (kind === "ending") {
        const timing = getSubscriptionTiming(subscription, now);
        const when = timing.remainingDays === 0
            ? "today"
            : timing.remainingDays === 1
                ? "tomorrow"
                : `in ${timing.remainingDays} days`;

        return (
            <Modal
                onClose={close}
                size="sm"
                icon={CalendarClock}
                title={`Your plan ends ${when}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={close}>Remind me next time</Button>
                        <Button icon={Crown} onClick={renew}>Renew now</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-body leading-relaxed">
                        {planLabel(subscription.plan)} runs until{" "}
                        <span className="font-semibold text-heading">{formatPlanDate(timing.end)}</span>.
                        Renew now to keep billing without interruption.
                    </p>

                    <div className="h-2 rounded-full bg-surface-hover overflow-hidden" aria-hidden="true">
                        <div
                            className={`h-full rounded-full ${timing.tone === "danger" ? "bg-danger" : "bg-warning"}`}
                            style={{ width: `${Math.max(3, timing.remainingPercent)}%` }}
                        />
                    </div>

                    <p className="flex items-start gap-2 rounded-xl bg-surface-muted border border-line px-3.5 py-3 text-xs text-muted">
                        <ShieldCheck className="h-4 w-4 text-success shrink-0" />
                        Renewing early loses nothing — the new period starts right after this one ends.
                    </p>
                </div>
            </Modal>
        );
    }

    // kind === "ended"
    const daysAgo = Math.max(0, Math.floor((now - new Date(lastEnded.endDate)) / DAY));

    return (
        <Modal
            onClose={close}
            size="sm"
            icon={Crown}
            title="Your plan has ended"
            footer={
                <>
                    <Button variant="secondary" onClick={close}>Later</Button>
                    <Button icon={Crown} onClick={renew}>Renew plan</Button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-body leading-relaxed">
                    Your plan ended on{" "}
                    <span className="font-semibold text-heading">{formatPlanDate(lastEnded.endDate)}</span>
                    {daysAgo > 0 && <> ({formatNumber(daysAgo)} day{daysAgo === 1 ? "" : "s"} ago)</>}.
                    Billing and inventory are paused until you renew.
                </p>

                <p className="flex items-start gap-2 rounded-xl bg-success/10 border border-success/25 px-3.5 py-3 text-sm text-heading">
                    <ShieldCheck className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>
                        <span className="font-semibold">Your data is safe.</span>{" "}
                        All your {term.itemsLower}, {term.categories.toLowerCase()}, {term.suppliers.toLowerCase()} and
                        past bills are kept and will be back the moment you renew.
                    </span>
                </p>
            </div>
        </Modal>
    );
}
