import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, ShieldCheck } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import PricingCard from "../components/subscription/PricingCard";
import FAQ from "../components/subscription/Faq";
import SubscriptionCTA from "../components/subscription/SubscriptionCTA";

import { useSubscription } from "../context/SubscriptionContext";
import { useBusiness } from "../context/BusinessContext";
import { PLAN, BILLING_CYCLES, savingFor, planLabel } from "../config/plans";
import { formatPlanDate } from "../utils/subscription";

export default function Subscription() {

    const navigate = useNavigate();
    const { subscription, lastEnded } = useSubscription();
    const { profile, term } = useBusiness();

    const [duration, setDuration] = useState("yearly");

    return (
        <div>
            <PageHeader
                icon={Crown}
                title="Plan & pricing"
                subtitle={subscription ? `You're on ${planLabel(subscription.plan)}` : "One plan, everything included"}
            />

            {!subscription && lastEnded && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-success/25 bg-success/10 p-4">
                    <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-heading">
                            Your plan ended on {formatPlanDate(lastEnded.endDate)} — your data is safe.
                        </p>
                        <p className="text-muted mt-0.5">
                            All your {term.itemsLower}, {term.categories.toLowerCase()}, {term.suppliers.toLowerCase()} and past bills are kept. Renew and pick up exactly where you left off.
                        </p>
                    </div>
                </div>
            )}

            <section className="text-center mt-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    One simple plan
                </span>
                <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
                    Everything your {profile.shortLabel.toLowerCase()} needs, one price
                </h2>
                <p className="max-w-xl mx-auto mt-3 text-muted">
                    No tiers, no locked features. Pick how often you'd like to pay.
                </p>
            </section>

            <div id="pricing" className="flex justify-center mt-8 scroll-mt-6">
                <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface p-1 shadow-card" role="tablist" aria-label="Billing cycle">
                    {BILLING_CYCLES.map((cycle) => {
                        const active = duration === cycle.id;
                        const saving = savingFor(cycle.id);
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

            <div className="max-w-4xl mx-auto mt-10">
                <PricingCard
                    plan={PLAN}
                    duration={duration}
                    current={subscription?.plan === PLAN.id && subscription?.duration === duration}
                    onSelect={() =>
                        navigate("/subscription/checkout", {
                            state: {
                                plan: PLAN.id,
                                planName: PLAN.name,
                                duration,
                                price: PLAN.prices[duration]
                            }
                        })
                    }
                />
            </div>

            <FAQ />
            <SubscriptionCTA
                onGetStarted={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                onBackToDashboard={() => navigate("/")}
            />
        </div>
    );
}
