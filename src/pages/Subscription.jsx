import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import PricingCard from "../components/subscription/PricingCard";
import ComparePlan from "../components/subscription/ComparePlan";
import FAQ from "../components/subscription/Faq";
import SubscriptionCTA from "../components/subscription/SubscriptionCTA";

import { useSubscription } from "../context/SubscriptionContext";
import { useBusiness } from "../context/BusinessContext";

const plans = [
    {
        id: "normal",
        name: "Normal",
        description: "Everything a small shop needs to bill and track stock",
        prices: { monthly: 499, sixMonths: 2499, yearly: 4999 },
        features: [
            "Product Management",
            "Category Management",
            "Inventory Management",
            "Basic Billing",
            "Customer Management",
            "Invoice Generation"
        ]
    },
    {
        id: "premium",
        name: "Premium",
        description: "Reports and analytics for growing shops",
        prices: { monthly: 999, sixMonths: 4999, yearly: 9999 },
        features: [
            "Everything in Normal",
            "Advanced Billing",
            "Advanced Invoice Management",
            "Sales Reports",
            "Analytics Dashboard",
            "Order Management",
            "Export Reports"
        ]
    },
    {
        id: "business",
        name: "Business",
        description: "For busy stores and multi-counter setups",
        prices: { monthly: 1999, sixMonths: 9999, yearly: 19999 },
        features: [
            "Everything in Premium",
            "Multi-user Access",
            "Advanced Analytics",
            "Advanced Reports",
            "Business Insights",
            "Priority Support",
            "Advanced Business Management"
        ]
    }
];

const CYCLES = [
    { id: "monthly", label: "Monthly", months: 1 },
    { id: "sixMonths", label: "6 months", months: 6 },
    { id: "yearly", label: "Yearly", months: 12 }
];

/** Real saving versus paying monthly, computed from the Normal plan's prices. */
const savingFor = (cycle) => {
    const base = plans[0].prices;
    const full = base.monthly * cycle.months;
    return Math.round(((full - base[cycle.id]) / full) * 100);
};

export default function Subscription() {

    const navigate = useNavigate();
    const { subscription } = useSubscription();
    const { profile } = useBusiness();

    const [duration, setDuration] = useState("yearly");

    return (
        <div>
            <PageHeader
                icon={Crown}
                title="Plans & pricing"
                subtitle={subscription ? `You're on the ${subscription.plan} plan` : "Choose a plan to get started"}
            />

            <section className="text-center mt-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Simple, transparent pricing
                </span>
                <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
                    One app for your {profile.shortLabel.toLowerCase()} — and any shop
                </h2>
                <p className="max-w-xl mx-auto mt-3 text-muted">
                    Billing, inventory and reports in every plan. Upgrade when you need more.
                </p>
            </section>

            <div id="pricing" className="flex justify-center mt-8 scroll-mt-6">
                <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface p-1 shadow-card" role="tablist" aria-label="Billing cycle">
                    {CYCLES.map((cycle) => {
                        const active = duration === cycle.id;
                        const saving = savingFor(cycle);
                        return (
                            <button
                                key={cycle.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setDuration(cycle.id)}
                                className={`flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold transition-colors ${active ? "bg-primary text-white shadow-sm" : "text-muted hover:text-heading"}`}
                            >
                                {cycle.label}
                                {saving > 0 && (
                                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-success/10 text-success"}`}>
                                        −{saving}%
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
                {plans.map((plan) => (
                    <PricingCard
                        key={plan.id}
                        plan={plan}
                        duration={duration}
                        current={subscription?.plan === plan.id && subscription?.duration === duration}
                        onSelect={(selectedPlan) =>
                            navigate("/subscription/checkout", {
                                state: {
                                    plan: selectedPlan.id,
                                    planName: selectedPlan.name,
                                    duration,
                                    price: selectedPlan.prices[duration]
                                }
                            })
                        }
                    />
                ))}
            </div>

            <ComparePlan />
            <FAQ />
            <SubscriptionCTA
                onGetStarted={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                onBackToDashboard={() => navigate("/")}
            />
        </div>
    );
}
