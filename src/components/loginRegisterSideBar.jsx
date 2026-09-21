import { Boxes, ReceiptText, BellRing, ChartNoAxesCombined } from "lucide-react";

import Logo from "./brand/Logo";
import BRAND from "../config/brand";
import { BUSINESS_TYPES } from "../config/businessTypes";

const FEATURES = [
    {
        icon: ReceiptText,
        heading: "Fast counter billing",
        content: "GST-ready invoices in seconds, cash, card or UPI"
    },
    {
        icon: Boxes,
        heading: "Inventory that fits your shop",
        content: "Sell by piece, kg, litre, metre, strip or pair"
    },
    {
        icon: BellRing,
        heading: "Smart stock alerts",
        content: "Low stock and expiry warnings before they cost you"
    },
    {
        icon: ChartNoAxesCombined,
        heading: "Reports that make sense",
        content: "Daily sales, margins and best sellers at a glance"
    }
];

/**
 * Brand panel shown beside the login and registration forms.
 */
export default function LoginRegisterSidebar() {
    return (
        <div className="relative h-full min-h-screen w-full overflow-hidden bg-[linear-gradient(150deg,#1e3a8a_0%,#2563eb_48%,#3b82f6_78%,#60a5fa_100%)] text-white flex flex-col px-10 py-10">

            {/* decorative glow */}
            <div
                className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl"
                aria-hidden="true"
            />

            <Logo tone="light" size="lg" className="relative" />

            <div className="relative mt-14">
                <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
                    One app for
                    <br />
                    every kind of shop.
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-white/75 max-w-sm">
                    {BRAND.description}
                </p>
            </div>

            <ul className="relative mt-10 space-y-3">
                {FEATURES.map(({ icon: Icon, heading, content }) => (
                    <li
                        key={heading}
                        className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-sm"
                    >
                        <span className="grid place-items-center h-8 w-8 shrink-0 rounded-lg bg-white/20">
                            <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                        </span>

                        <div>
                            <p className="text-sm font-semibold text-white">
                                {heading}
                            </p>
                            <p className="text-xs text-white/70 mt-0.5">
                                {content}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="relative mt-auto pt-10">
                <p className="text-[11px] uppercase tracking-widest text-white/60 font-semibold">
                    Built for
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                    {BUSINESS_TYPES.filter((type) => type.id !== "general").map(
                        ({ id, shortLabel, icon: Icon }) => (
                            <span
                                key={id}
                                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90"
                            >
                                <Icon className="h-3 w-3" aria-hidden="true" />
                                {shortLabel}
                            </span>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
