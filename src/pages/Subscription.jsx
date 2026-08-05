import { useState } from "react";
import PricingCard from "../components/subscription/PricingCard";
import ComparePlan from "../components/subscription/ComparePlan";
import FAQ from "../components/subscription/Faq";
import SubscriptionCTA from "../components/subscription/SubscriptionCTA";
import { useNavigate } from "react-router-dom";

const plans = [
    {
        id: "normal",
        name: "Normal",
        description: "Essential tools for small businesses",

        prices: {
            monthly: 499,
            sixMonths: 2499,
            yearly: 4999,
        },

        features: [
            "Product Management",
            "Category Management",
            "Inventory Management",
            "Basic Billing",
            "Customer Management",
            "Invoice Generation",
        ],
    },

    {
        id: "premium",
        name: "Premium",
        description: "Advanced tools for growing businesses",

        prices: {
            monthly: 999,
            sixMonths: 4999,
            yearly: 9999,
        },

        features: [
            "Everything in Normal",
            "Advanced Billing",
            "Advanced Invoice Management",
            "Sales Reports",
            "Analytics Dashboard",
            "Order Management",
            "Export Reports",
        ],
    },

    {
        id: "business",
        name: "Business",
        description: "Complete solution for larger businesses",

        prices: {
            monthly: 1999,
            sixMonths: 9999,
            yearly: 19999,
        },

        features: [
            "Everything in Premium",
            "Multi-user Access",
            "Advanced Analytics",
            "Advanced Reports",
            "Business Insights",
            "Priority Support",
            "Advanced Business Management",
        ],
    },
];


export default function Subscription() {
    const [duration, setDuration] = useState("monthly");
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#F7F9FC]">

            <main className="max-w-6xl mx-auto px-6 py-16">
                <section className="text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wide">
                        • Simple & Transparent Pricing
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-5">
                        Choose the right plan
                        <br />
                        for your business
                    </h1>
                    <p className="max-w-xl mx-auto mt-5 text-gray-500">
                        Manage products, inventory, billing and orders
                        with a plan that fits your business.
                    </p>
                </section>

                <div id="pricing" className="flex justify-center mt-8">

                    <div className="bg-white border rounded-xl p-1 flex items-center shadow-sm">

                        <button
                            onClick={() => setDuration("monthly")}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${duration === "monthly"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            Monthly
                        </button>


                        <button
                            onClick={() => setDuration("sixMonths")}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${duration === "sixMonths"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            6 Months
                        </button>

                        <span className="text-xs text-green-600 font-medium mr-2">
                            Save 10%
                        </span>


                        <button
                            onClick={() => setDuration("yearly")}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${duration === "yearly"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            12 Months
                        </button>

                        <span className="text-xs text-green-600 font-medium mr-2">
                            Save 20%
                        </span>

                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mt-10">

                    {plans.map((plan) => (

                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            duration={duration}
                            onSelect={(selectedPlan) => {
                                navigate("/subscription/checkout", {
                                    state: {
                                        plan: selectedPlan.id,
                                        planName: selectedPlan.name,
                                        duration: duration,
                                        price: selectedPlan.prices[duration]
                                    }
                                });
                            }}
                        />

                    ))}

                </div>

                <ComparePlan />

                <FAQ />

                <SubscriptionCTA
                    onGetStarted={() => {
                        document
                            .getElementById("pricing")
                            ?.scrollIntoView({
                                behavior: "smooth"
                            });
                    }}
                    onBackToDashboard={() => {
                        navigate("/");
                    }}
                />

            </main>

        </div>
    );
}