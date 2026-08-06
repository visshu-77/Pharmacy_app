import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createSubscription, createPaymentOrder,verifyPayment } from "../services/subscriptionService";

import { useSubscription } from "../context/SubscriptionContext";

export default function SubscriptionCheckout() {

    const location = useLocation();
    const navigate = useNavigate();

    const { fetchSubscription } = useSubscription();

    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [loading, setLoading] = useState(false);

    const {
        plan,
        planName,
        duration,
        price
    } = location.state || {};

    const handleSubscription = async () => {
        try {
            setLoading(true);

            const subscriptionData = {
                plan,
                duration,
                price,
                paymentMethod
            };

            const result = await createSubscription(
                subscriptionData
            )

            alert("subscription activated successfully");
            navigate("/");

        } catch (err) {
            console.log(err);
            const message = err.response?.data?.message ||
                "Failed to create subscription";

            alert(message);
        } finally {
            setLoading(false);
        }
    }

    const handlePayment = async () => {
        try {
            setLoading(true);
            const result = await createPaymentOrder({
                plan,
                duration
            });

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: result.order.amount,
                currency: result.order.currency,
                name: "Your Software Name",
                description: `${planName} - ${duration}`,
                order_id: result.order.id,
                handler: async function (response) {
                    try {
                        const verifyData = {
                            razorpay_order_id:
                                response.razorpay_order_id,
                            razorpay_payment_id:
                                response.razorpay_payment_id,
                            razorpay_signature:
                                response.razorpay_signature,
                            plan,
                            duration
                        };
                        const result =
                            await verifyPayment(verifyData);
                        await fetchSubscription();
                        alert(
                            "Payment successful! Subscription activated."
                        );
                        navigate("/");
                    } catch (error) {
                        console.log(
                            "Verification error:",
                            error
                        );
                        alert(
                            "Payment was received but verification failed."
                        );
                    }
                },
                prefill: {
                    name: "",
                    email: ""
                },
                theme: {
                    color: "#2563EB"
                }
            };
            const razorpay =
                new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.log(
                "Payment error:",
                error
            );
            alert(
                error.response?.data?.message ||
                "Unable to start payment"
            );
        } finally {
            setLoading(false);
        }
    };
    if (!location.state) {
        return (
            <div className="min-h-screen flex items-center justify-center">

                <div className="text-center">

                    <h2 className="text-xl font-bold">
                        No subscription selected
                    </h2>

                    <button
                        onClick={() => navigate("/subscription")}
                        className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
                    >
                        Choose a Plan
                    </button>

                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F9FC] p-6">

            <div className="max-w-3xl mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-500 mb-6"
                >
                    ← Back
                </button>

                <h1 className="text-3xl font-bold">
                    Confirm Your Subscription
                </h1>

                <div className="bg-white border rounded-xl p-6 mt-6">

                    <p className="text-sm text-gray-400 uppercase">
                        Selected Plan
                    </p>

                    <h2 className="text-2xl font-bold mt-2">
                        {planName}
                    </h2>

                    <div className="border-t my-5" />

                    <div className="flex justify-between">
                        <span>Billing Period</span>

                        <span className="font-semibold">
                            {duration === "monthly"
                                ? "Monthly"
                                : duration === "sixMonths"
                                    ? "6 Months"
                                    : "12 Months"
                            }
                        </span>
                    </div>

                    <div className="flex justify-between mt-4">

                        <span>Total</span>

                        <span className="text-xl font-bold">
                            ₹{Number(price).toLocaleString("en-IN")}
                        </span>

                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                    >
                        {loading
                            ? "Opening Payment..."
                            : `Pay ₹${Number(price).toLocaleString("en-IN")}`
                        }
                    </button>

                </div>

                <div className="mt-6">

                    <h3 className="font-semibold text-gray-900 mb-3">
                        Payment Method
                    </h3>

                    <div className="grid grid-cols-3 gap-3">

                        <button
                            onClick={() => setPaymentMethod("UPI")}
                            className={`border rounded-lg p-3 text-sm ${paymentMethod === "UPI"
                                ? "border-blue-600 bg-blue-50 text-blue-600"
                                : "border-gray-200"
                                }`}
                        >
                            UPI
                        </button>

                        <button
                            onClick={() => setPaymentMethod("Card")}
                            className={`border rounded-lg p-3 text-sm ${paymentMethod === "Card"
                                ? "border-blue-600 bg-blue-50 text-blue-600"
                                : "border-gray-200"
                                }`}
                        >
                            Card
                        </button>

                        <button
                            onClick={() => setPaymentMethod("Cash")}
                            className={`border rounded-lg p-3 text-sm ${paymentMethod === "Cash"
                                ? "border-blue-600 bg-blue-50 text-blue-600"
                                : "border-gray-200"
                                }`}
                        >
                            Cash
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}