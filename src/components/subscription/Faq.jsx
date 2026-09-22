import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
    {
        question: "Does StoreFlow work for my kind of shop?",
        answer:
            "Yes. Pick your business type — grocery, hardware, pharmacy, electronics, mobile, stationery, clothing, footwear, bakery, cosmetics, auto parts or general — and StoreFlow adjusts its fields, units and alerts. You can switch type any time in Settings without losing data."
    },
    {
        question: "Why is there only one plan?",
        answer: "So you never have to guess what you're missing. StoreFlow Pro includes every feature for every kind of shop — you only choose whether to pay monthly, every 6 months or yearly."
    },
    {
        question: "Can I switch between monthly and yearly?",
        answer: "Yes. Pick a different billing cycle when you renew; longer cycles cost less per month."
    },
    {
        question: "What happens when my plan expires?",
        answer: "Your data is kept safe. Billing, inventory and reports pause until you renew, then everything is exactly where you left it."
    },
    {
        question: "Can I bring my existing stock list?",
        answer: "Yes. Import products from a CSV file — name, category, stock, prices, barcode and more. Missing categories are created automatically."
    },
    {
        question: "Is my data safe?",
        answer: "Each shop's data is private to that account and every request is authenticated."
    }
];

export default function FAQ() {

    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="max-w-3xl mx-auto mt-20">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Frequently asked questions</h2>
            </div>

            <div className="space-y-3">
                {FAQS.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div
                            key={faq.question}
                            className={`rounded-xl border bg-surface transition-colors ${isOpen ? "border-primary/30 shadow-sm" : "border-line"}`}
                        >
                            <button
                                type="button"
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                aria-expanded={isOpen}
                                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                            >
                                <span className="text-sm font-semibold text-heading">{faq.question}</span>
                                <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180 text-primary" : ""}`} />
                            </button>

                            {isOpen && (
                                <p className="px-5 pb-5 -mt-1 text-sm text-muted leading-relaxed animate-fade-in">
                                    {faq.answer}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
