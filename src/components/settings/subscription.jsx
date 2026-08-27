import SettingsHeading from "./settingHeading";
import { useSubscription } from "../../context/SubscriptionContext";

import { useTranslation } from "react-i18next";

const getBillingCycle = (duration) => {
    
    if (duration === "monthly") {
        return "Monthly";
    }

    if (duration === "sixMonths") {
        return "6 Months";
    }

    if (duration === "yearly") {
        return "Annual";
    }

    return duration;
};

const formatDate = (date) => {
    if (!date) {
        return "-";
    }

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};

const getRemainingDays = (endDate) => {
    if (!endDate) {
        return 0;
    }

    const now = new Date();
    const end = new Date(endDate);

    const difference = end - now;

    const days = Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );

    return Math.max(days, 0);
};

const getUsagePercentage = (startDate, endDate) => {
    if (!startDate || !endDate) {
        return 0;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    const total = end - start;
    const elapsed = now - start;

    if (total <= 0) {
        return 100;
    }

    const percentage = (elapsed / total) * 100;

    return Math.min(
        Math.max(Math.round(percentage), 0),
        100
    );
};

export default function SubscriptionSettings() {
    const { t, i18n } = useTranslation();

    const {
        subscription,
        subscriptionLoading
    } = useSubscription();

    if (subscriptionLoading) {
        return (
            <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-500">
                    Loading Subscription...
                </p>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="bg-white border rounded-xl p-5 sm:p-6">

                <h2 className="text-lg font-bold">
                    No Active Subscription
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    You don't have an active subscription.
                </p>

            </div>
        );
    }

    const usagePercentage = getUsagePercentage(
        subscription.startDate,
        subscription.endDate
    );

    const remainingDays = getRemainingDays(
        subscription.endDate
    );

    return (
        <div className="w-full">

            <SettingsHeading
                heading={t("SubscriptionInformation.title")}
                content={t("SubscriptionInformation.content")}
            />

            {/* ================= CURRENT PLAN ================= */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white dark:from-black dark:to-black dark:text-white dark:border dark:border-white/30">

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

                    {/* Plan */}
                    <div className="min-w-0">

                        <p className="text-xs uppercase tracking-wide opacity-80">
                            ⚡{t("SubscriptionInformation.CurrentPlan")}
                        </p>

                        <h3 className="text-lg sm:text-xl font-bold mt-1 capitalize break-words">
                            {subscription.plan} Plan
                        </h3>

                    </div>

                    {/* Status */}
                    <span className="self-start px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold whitespace-nowrap">
                        {subscription.subscriptionStatus}
                    </span>

                </div>

            </div>


            {/* ================= BASIC PLAN INFO ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-5 sm:mt-6">

                <div className="bg-gray-50 sm:bg-transparent rounded-lg p-3 sm:p-0">
                    <p className="text-xs text-gray-500">
                        {t("SubscriptionInformation.BillingCycle")}
                    </p>

                    <p className="font-semibold mt-1 text-sm sm:text-base">
                        {getBillingCycle(subscription.duration)}
                    </p>
                </div>


                <div className="bg-gray-50 sm:bg-transparent rounded-lg p-3 sm:p-0">
                    <p className="text-xs text-gray-500">
                        {t("SubscriptionInformation.Price")}
                    </p>

                    <p className="font-semibold mt-1 text-sm sm:text-base">
                        ₹{Number(subscription.price).toLocaleString("en-IN")}
                    </p>
                </div>


                <div className="bg-gray-50 sm:bg-transparent rounded-lg p-3 sm:p-0">
                    <p className="text-xs text-gray-500">
                        {t("SubscriptionInformation.PaymentStatus")}
                    </p>

                    <p className="font-semibold mt-1 text-sm sm:text-base capitalize">
                        {subscription.paymentStatus}
                    </p>
                </div>

            </div>


            {/* ================= SUBSCRIPTION DETAILS ================= */}
            <div className="border border-gray-200 rounded-xl p-4 sm:p-5 mt-5">

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5 sm:gap-6">

                    {/* Start Date */}
                    <div>

                        <p className="text-xs text-gray-500">
                            {t("SubscriptionInformation.StartDate")}
                        </p>

                        <p className="font-semibold text-sm mt-1">
                            {formatDate(subscription.startDate)}
                        </p>

                    </div>


                    {/* Expiry Date */}
                    <div>

                        <p className="text-xs text-gray-500">
                            {t("SubscriptionInformation.ExpiryDate")}
                        </p>

                        <p className="font-semibold text-sm mt-1">
                            {formatDate(subscription.endDate)}
                        </p>

                    </div>


                    {/* Remaining Days */}
                    <div>

                        <p className="text-xs text-gray-500">
                            {t("SubscriptionInformation.DaysRemaining")}
                        </p>

                        <p className="font-semibold text-sm mt-1">
                            {remainingDays} days
                        </p>

                    </div>


                    {/* Usage */}
                    <div>

                        <p className="text-xs text-gray-500">
                            {t("SubscriptionInformation.Usage")}
                        </p>

                        <p className="font-semibold text-sm mt-1">
                            {usagePercentage}%
                        </p>

                    </div>

                </div>


                {/* ================= PROGRESS ================= */}
                <div className="mt-6">

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-gray-500 mb-2">

                        <span>
                            {t("SubscriptionInformation.SubscriptionPeriod")}
                        </span>

                        <span>
                            {usagePercentage}% {t("SubscriptionInformation.elapsed")}
                        </span>

                    </div>


                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">

                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500 dark:bg-darkColor dark:text-white dark:border dark:border-white/30"
                            style={{
                                width: `${usagePercentage}%`
                            }}
                        />

                    </div>

                </div>

            </div>

        </div>
    );
}
