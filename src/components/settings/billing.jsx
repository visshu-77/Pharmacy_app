import { useEffect, useState } from "react"
import SettingsHeading from "./settingHeading"
import { getBillingDetails } from "../../services/userService"

export default function Billing() {
    const [billing, setBilling] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchBillingDetails()
    }, []);

    const fetchBillingDetails = async () => {
        try {
            const data = await getBillingDetails();
            setBilling(data);
        } catch (err) {
            console.log(err);
            setError(err?.response?.message?.data);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="bg-white">
                <SettingsHeading
                    heading="Billing & Payment"
                    content="Manage your subscription and payment history."
                />

                <div className="p-4 sm:p-6 text-center text-gray-500">
                    Loading billing details...
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">

            <SettingsHeading
                heading="Billing & Payments"
                content="Manage payment methods and view billing history."
            />

            <div className="mt-4 sm:mt-6">

                {/* Current Subscription */}
                {billing.currentSubscription ? (

                    <div className="border rounded-xl p-4 sm:p-5 bg-primary text-white">

                        {/* Plan + Price */}
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">

                            <div>
                                <p className="text-xs opacity-80">
                                    Current Plan
                                </p>

                                <h2 className="text-lg sm:text-xl font-bold capitalize">
                                    {billing.currentSubscription.plan} Plan
                                </h2>
                            </div>

                            <div className="text-left sm:text-right">

                                <p className="text-xs opacity-80">
                                    Current Price
                                </p>

                                <p className="text-lg sm:text-xl font-bold">
                                    ₹{billing.currentSubscription.price}
                                </p>

                            </div>

                        </div>

                        {/* Subscription Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 sm:mt-6">

                            <div>
                                <p className="text-xs opacity-80">
                                    Billing Cycle
                                </p>

                                <p className="text-sm font-semibold capitalize">
                                    {billing.currentSubscription.duration}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs opacity-80">
                                    Start Date
                                </p>

                                <p className="text-sm font-semibold">
                                    {new Date(
                                        billing.currentSubscription.startDate
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs opacity-80">
                                    Expiry Date
                                </p>

                                <p className="text-sm font-semibold">
                                    {new Date(
                                        billing.currentSubscription.endDate
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                        </div>

                    </div>

                ) : (

                    <div className="border rounded-xl p-5 sm:p-6 text-center text-gray-500">
                        No active subscription found.
                    </div>

                )}


                {/* Payment History */}
                <div className="mt-6">

                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        Payment History
                    </h3>


                    {/* ================= DESKTOP TABLE ================= */}
                    <div className="hidden sm:block border rounded-xl overflow-hidden">

                        {/* Header */}
                        <div className="grid grid-cols-5 gap-4 bg-gray-50 px-5 py-3 text-xs font-semibold text-gray-500">

                            <div>Plan</div>
                            <div>Duration</div>
                            <div>Amount</div>
                            <div>Status</div>
                            <div>Date</div>

                        </div>


                        {/* Rows */}
                        {billing?.paymentHistory?.length > 0 ? (

                            billing.paymentHistory.map((payment) => (

                                <div
                                    key={payment._id}
                                    className="grid grid-cols-5 gap-4 px-5 py-4 border-t text-sm"
                                >

                                    <div className="capitalize font-medium">
                                        {payment.plan}
                                    </div>

                                    <div className="capitalize">
                                        {payment.duration}
                                    </div>

                                    <div className="font-semibold">
                                        ₹{payment.price}
                                    </div>

                                    <div>
                                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                            {payment.paymentStatus}
                                        </span>
                                    </div>

                                    <div className="text-gray-500">
                                        {new Date(
                                            payment.createdAt
                                        ).toLocaleDateString()}
                                    </div>

                                </div>

                            ))

                        ) : (

                            <div className="px-5 py-8 text-center text-gray-500">
                                No payment history found.
                            </div>

                        )}

                    </div>


                    {/* ================= MOBILE CARDS ================= */}
                    <div className="sm:hidden space-y-3">

                        {billing?.paymentHistory?.length > 0 ? (

                            billing.paymentHistory.map((payment) => (

                                <div
                                    key={payment._id}
                                    className="border rounded-xl p-4 bg-white"
                                >

                                    {/* Top Row */}
                                    <div className="flex items-start justify-between gap-3">

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Plan
                                            </p>

                                            <p className="text-sm font-semibold text-gray-900 capitalize">
                                                {payment.plan}
                                            </p>
                                        </div>

                                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 whitespace-nowrap">
                                            {payment.paymentStatus}
                                        </span>

                                    </div>


                                    {/* Payment Details */}
                                    <div className="grid grid-cols-2 gap-4 mt-4">

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Duration
                                            </p>

                                            <p className="text-sm font-medium capitalize text-gray-900">
                                                {payment.duration}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Amount
                                            </p>

                                            <p className="text-sm font-semibold text-gray-900">
                                                ₹{payment.price}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Date
                                            </p>

                                            <p className="text-sm text-gray-700">
                                                {new Date(
                                                    payment.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                            ))

                        ) : (

                            <div className="border rounded-xl px-4 py-8 text-center text-gray-500">
                                No payment history found.
                            </div>

                        )}

                    </div>

                </div>

            </div>
        </div>
    )
}
