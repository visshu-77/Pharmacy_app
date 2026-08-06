import SettingsHeading from "./settingHeading";
import { useSubscription } from "../../context/SubscriptionContext";

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

    const {
        subscription,
        subscriptionLoading
    } = useSubscription();

    if (subscriptionLoading) {
        return (
            <div className="p-6">
                <p className="text-sm text-gray-500">Loading Subscription...</p>
            </div>
        )
    }

    if (!subscription) {
        return (
            <div className="bg-white border rounded-xl p-6">
                <h2 className="text-lg font-bold">
                    No Active Subscription
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    You don't have an active subscription.
                </p>
            </div>
        );
    }

    return (
        <div>

            <SettingsHeading
                heading="Subscription"
                content="Your current plan and billing details."
            />

            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs uppercase tracking-wide opacity-80">
                            ⚡ Current Plan
                        </p>
                        <h3 className="text-xl font-bold mt-1 capitalize">
                            {subscription.plan} Plan
                        </h3>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold">
                        {subscription.subscriptionStatus}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-6">
                <div>
                    <p className="text-xs opacity-70">
                        Billing Cycle
                    </p>
                    <p className="font-semibold mt-1">
                        {getBillingCycle(subscription.duration)}
                    </p>
                </div>
                <div>
                    <p className="text-xs opacity-70">
                        Price
                    </p>
                    <p className="font-semibold mt-1">
                        ₹{Number(subscription.price).toLocaleString("en-IN")}
                    </p>
                </div>
                <div>
                    <p className="text-xs opacity-70">
                        Payment Status
                    </p>
                    <p className="font-semibold mt-1 capitalize">
                        {subscription.paymentStatus}
                    </p>
                </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 mt-5">
                <div className="grid grid-cols-4 gap-6">
                    <div>
                        <p className="text-xs text-gray-500">
                            📅 Start Date
                        </p>
                        <p className="font-semibold text-sm mt-1">
                            {formatDate(subscription.startDate)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">
                            📅 Expiry Date
                        </p>
                        <p className="font-semibold text-sm mt-1">
                            {formatDate(subscription.endDate)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">
                            ◉ Days Remaining
                        </p>
                        <p className="font-semibold text-sm mt-1">
                            {getRemainingDays(subscription.endDate)} days
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">
                            ↗ Usage
                        </p>
                        <p className="font-semibold text-sm mt-1">
                            {getUsagePercentage(
                                subscription.startDate,
                                subscription.endDate
                            )}%
                        </p>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>
                            Subscription period
                        </span>
                        <span>
                            {getUsagePercentage(
                                subscription.startDate,
                                subscription.endDate
                            )}% elapsed
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                                width: `${getUsagePercentage(
                                    subscription.startDate,
                                    subscription.endDate
                                )}%`
                            }}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
}