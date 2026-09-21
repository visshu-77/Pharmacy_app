import { Check, Sparkles } from "lucide-react";

import Button from "../ui/Button";

const PERIOD = {
    monthly: "/ month",
    sixMonths: "/ 6 months",
    yearly: "/ year"
};

const MONTHS = { monthly: 1, sixMonths: 6, yearly: 12 };

export default function PricingCard({ plan, duration, onSelect, current = false }) {

    const price = plan.prices[duration];
    const featured = plan.id === "premium";
    const perMonth = Math.round(price / MONTHS[duration]);

    return (
        <div
            className={[
                "relative flex flex-col rounded-2xl border bg-surface p-6 transition-all duration-200",
                featured
                    ? "border-primary shadow-lg ring-1 ring-primary/30 md:-translate-y-2"
                    : "border-line shadow-card hover:shadow-md"
            ].join(" ")}
        >
            {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                </span>
            )}

            <div>
                <h3 className="text-lg font-bold text-heading">{plan.name}</h3>
                <p className="text-sm text-muted mt-1">{plan.description}</p>
            </div>

            <div className="mt-6">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold tracking-tight text-heading tabular">
                        ₹{price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-muted">{PERIOD[duration]}</span>
                </div>
                {duration !== "monthly" && (
                    <p className="text-xs text-muted mt-1 tabular">≈ ₹{perMonth.toLocaleString("en-IN")} per month</p>
                )}
            </div>

            <Button
                fullWidth
                size="lg"
                variant={featured ? "primary" : "secondary"}
                className="mt-6"
                disabled={current}
                onClick={() => onSelect(plan)}
            >
                {current ? "Current plan" : `Choose ${plan.name}`}
            </Button>

            <ul className="mt-6 pt-6 border-t border-line space-y-3 flex-1">
                {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-body">
                        <span className="grid place-items-center h-5 w-5 shrink-0 rounded-full bg-primary/10 text-primary">
                            <Check className="h-3 w-3" />
                        </span>
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
}
