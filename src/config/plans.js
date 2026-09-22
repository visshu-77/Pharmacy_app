/**
 * StoreFlow's single plan. Prices must match Backend/config/subscriptionPlans.js
 * — the server charges its own copy, this one is only for display.
 */
export const PLAN = {
    id: "pro",
    name: "StoreFlow Pro",
    description: "Everything your shop needs — billing, stock, reports and more.",
    prices: {
        monthly: 999,
        sixMonths: 4999,
        yearly: 9999
    },
    features: [
        "Unlimited products & categories",
        "Counter billing with barcode search",
        "GST-ready invoices, print & WhatsApp",
        "Low stock & expiry alerts",
        "Supplier directory",
        "CSV import & export",
        "Sales reports & analytics",
        "Top sellers & category performance",
        "AI business assistant",
        "Multi-user access",
        "Priority support"
    ]
};

export const BILLING_CYCLES = [
    { id: "monthly", label: "Monthly", period: "/ month", months: 1 },
    { id: "sixMonths", label: "6 months", period: "/ 6 months", months: 6 },
    { id: "yearly", label: "Yearly", period: "/ year", months: 12 }
];

/** Percentage saved versus paying monthly for the same period. */
export const savingFor = (cycleId) => {
    const cycle = BILLING_CYCLES.find((c) => c.id === cycleId);
    const full = PLAN.prices.monthly * (cycle?.months || 1);
    return Math.round(((full - PLAN.prices[cycleId]) / full) * 100);
};

// Names for plans sold before StoreFlow moved to a single plan.
const LEGACY_NAMES = {
    normal: "Normal (legacy)",
    premium: "Premium (legacy)",
    business: "Business (legacy)"
};

/** Display name for any plan id a subscription may carry. */
export const planLabel = (id) =>
    id === PLAN.id ? PLAN.name : LEGACY_NAMES[id] || id || "—";
