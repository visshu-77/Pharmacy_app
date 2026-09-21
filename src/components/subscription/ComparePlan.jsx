import { Check, Minus } from "lucide-react";

const FEATURES = [
    { name: "Product management", normal: true, premium: true, business: true },
    { name: "Category management", normal: true, premium: true, business: true },
    { name: "Inventory & stock alerts", normal: true, premium: true, business: true },
    { name: "Billing", normal: true, premium: true, business: true },
    { name: "Invoice generation", normal: true, premium: true, business: true },
    { name: "Customer management", normal: true, premium: true, business: true },
    { name: "Order management", normal: false, premium: true, business: true },
    { name: "Reports", normal: false, premium: true, business: true },
    { name: "Analytics", normal: false, premium: true, business: true },
    { name: "Export reports", normal: false, premium: true, business: true },
    { name: "Multi-user access", normal: false, premium: false, business: true },
    { name: "Priority support", normal: false, premium: false, business: true }
];

const PLANS = [
    { id: "normal", label: "Normal" },
    { id: "premium", label: "Premium", featured: true },
    { id: "business", label: "Business" }
];

export default function ComparePlans() {
    return (
        <section className="mt-20">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Compare plans</h2>
                <p className="text-sm text-muted mt-2">Every plan works for every kind of shop.</p>
            </div>

            <div className="overflow-x-auto thin-scrollbar rounded-2xl border border-line bg-surface shadow-card">
                <table className="w-full min-w-[640px] text-sm">
                    <thead>
                        <tr className="border-b border-line">
                            <th className="text-left px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted">Feature</th>
                            {PLANS.map((plan) => (
                                <th
                                    key={plan.id}
                                    className={`px-5 py-4 text-center font-semibold ${plan.featured ? "text-primary bg-primary/5" : "text-heading"}`}
                                >
                                    {plan.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {FEATURES.map((feature) => (
                            <tr key={feature.name} className="hover:bg-surface-hover">
                                <td className="px-5 py-3.5 text-body">{feature.name}</td>
                                {PLANS.map((plan) => (
                                    <td key={plan.id} className={`px-5 py-3.5 text-center ${plan.featured ? "bg-primary/5" : ""}`}>
                                        {feature[plan.id] ? (
                                            <Check className="h-4 w-4 text-primary mx-auto" aria-label="Included" />
                                        ) : (
                                            <Minus className="h-4 w-4 text-faint mx-auto" aria-label="Not included" />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
