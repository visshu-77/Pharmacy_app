const DAY = 24 * 60 * 60 * 1000;

/**
 * Everything the UI needs to describe how far through a plan the shop is.
 * Used by both the sidebar card and Settings → Subscription so they always
 * agree.
 *
 * Days are counted in whole calendar days, the way people read a calendar:
 * a plan ending tomorrow at any time shows "1 day left"; ending later today
 * shows "Ends today".
 */
export const getSubscriptionTiming = (subscription, now = new Date()) => {
    if (!subscription?.startDate || !subscription?.endDate) {
        return null;
    }

    const start = new Date(subscription.startDate);
    const end = new Date(subscription.endDate);

    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalDays = Math.max(1, Math.round((endDay - startDay) / DAY));
    const remainingDays = Math.max(0, Math.round((endDay - today) / DAY));
    const usedDays = Math.min(totalDays, totalDays - remainingDays);

    const expired = end <= now;

    // Bar drains as the plan is used: full on day one, empty at expiry.
    // Uses exact time so it moves smoothly within the day.
    const remainingPercent = expired
        ? 0
        : Math.min(100, Math.max(0, ((end - now) / (end - start)) * 100));

    const tone = expired || remainingDays <= 2
        ? "danger"
        : remainingDays <= 7
            ? "warning"
            : "success";

    let label;
    if (expired) label = "Expired";
    else if (remainingDays === 0) label = "Ends today";
    else if (remainingDays === 1) label = "1 day left";
    else label = `${remainingDays} days left`;

    return {
        start,
        end,
        totalDays,
        remainingDays,
        usedDays,
        remainingPercent,
        usedPercent: 100 - remainingPercent,
        expired,
        tone,
        label
    };
};

/** Milliseconds until the plan ends (clamped for setTimeout's 24.8-day max). */
export const msUntilEnd = (subscription, now = Date.now()) => {
    if (!subscription?.endDate) return null;
    const ms = new Date(subscription.endDate).getTime() - now;
    return Math.min(Math.max(ms, 0), 2 ** 31 - 1);
};

export const formatPlanDate = (date) =>
    date
        ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "—";
