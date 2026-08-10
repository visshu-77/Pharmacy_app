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

                <div className="p-6 text-center text-gray-500">
                    Loading billing details...
                </div>
            </div>
        )
    }

    return (
        <div>
            <SettingsHeading
                heading="Billing & Payments"
                content="Manage payment methods and view billing history."
            />

            <div>
                {billing.currentSubscription ? (
                    <div className="border rounded-xl p-5 bg-primary text-white">
                        <div className="flex justify-between">

                            <div>
                                <p className="text-xs">
                                    Current Plan
                                </p>

                                <h2 className="text-xl font-bold capitalize">
                                    {billing.currentSubscription.plan} Plan
                                </h2>
                            </div>

                            <div className="text-right">
                                <p className="text-xs ">
                                    Current Price
                                </p>

                                <p className="text-xl font-bold">
                                    ₹{billing.currentSubscription.price}
                                </p>
                            </div>

                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6">

                            <div>
                                <p className="text-xs">
                                    Billing Cycle
                                </p>

                                <p className="text-sm font-semibold capitalize">
                                    {billing.currentSubscription.duration}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs ">
                                    Start Date
                                </p>

                                <p className="text-sm font-semibold">
                                    {new Date(
                                        billing.currentSubscription.startDate
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs ">
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
                    <div className="border rounded-xl p-6 text-center text-gray-500">
                        No active subscription found.
                    </div>
                )}

                <div className="px-6 pb-6 mt-6">

                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        Payment History
                    </h3>

                    <div className="border rounded-xl overflow-hidden">

                        <div className="grid grid-cols-5 gap-4 bg-gray-50 px-5 py-3 text-xs font-semibold text-gray-500">
                            <div>Plan</div>
                            <div>Duration</div>
                            <div>Amount</div>
                            <div>Status</div>
                            <div>Date</div>
                        </div>

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
                </div>
            </div>
        </div>
    )
}