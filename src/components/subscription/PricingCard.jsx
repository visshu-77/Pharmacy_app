import { Check, Sparkles } from "lucide-react";

import Button from "../ui/Button";
import { BILLING_CYCLES } from "../../config/plans";

/** The single StoreFlow plan: price for the chosen cycle plus what's included. */
export default function PricingCard({ plan, duration, onSelect, current = false }) {

    const cycle = BILLING_CYCLES.find((c) => c.id === duration) || BILLING_CYCLES[0];
    const price = plan.prices[duration];
    const perMonth = Math.round(price / cycle.months);

    return (
        <div className="relative rounded-3xl border border-primary bg-surface shadow-lg ring-1 ring-primary/30 overflow-hidden">
            <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">

                {/* Price */}
                <div className="p-8 bg-primary/5 border-b md:border-b-0 md:border-r border-line flex flex-col">
                    <span className="self-start inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                        <Sparkles className="h-3 w-3" />
                        All features included
                    </span>

                    <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-heading">{plan.name}</h3>
                    <p className="text-sm text-muted mt-1">{plan.description}</p>

                    <div className="mt-8">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-5xl font-extrabold tracking-tight text-heading tabular">
                                ₹{price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-sm text-muted">{cycle.period}</span>
                        </div>
                        {cycle.months > 1 && (
                            <p className="text-sm text-muted mt-1 tabular">≈ ₹{perMonth.toLocaleString("en-IN")} per month</p>
                        )}
                    </div>

                    <div className="mt-auto pt-8">
                        <Button fullWidth size="lg" className="h-12" disabled={current} onClick={() => onSelect(plan)}>
                            {current ? "Your current plan" : `Get ${plan.name}`}
                        </Button>
                    </div>
                </div>

                {/* Features */}
                <div className="p-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-faint">What's included</p>
                    <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-3.5">
                        {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2.5 text-sm text-body">
                                <span className="grid place-items-center h-5 w-5 shrink-0 rounded-full bg-primary/10 text-primary mt-px">
                                    <Check className="h-3 w-3" />
                                </span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
