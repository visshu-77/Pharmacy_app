import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "Can I change my plan later?",
        answer:
            "Yes — you can upgrade or downgrade your plan at any time from your account settings. Changes will be applied according to your subscription."
    },
    {
        question: "What happens when my subscription expires?",
        answer:
            "When your subscription expires, premium features will no longer be available until you renew your subscription."
    },
    {
        question: "Can I switch from monthly to yearly billing?",
        answer:
            "Yes. You can switch your billing cycle from monthly to yearly whenever you want."
    },
    {
        question: "Is my data safe?",
        answer:
            "Yes. Your business data is securely stored and protected using appropriate security measures."
    },
    {
        question: "Can I cancel my subscription?",
        answer:
            "Yes. You can cancel your subscription from your account settings. Your current plan will remain available until the end of the billing period."
    }
];

export default function FAQ() {

    const [openIndex, setOpenIndex] = useState(0);

    const handleToggle = (index) => {
        setOpenIndex(
            openIndex === index ? null : index
        );
    };

    return (
        <section className="max-w-3xl mx-auto mt-20">

            {/* Heading */}

            <div className="text-center mb-8">

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Frequently Asked Questions
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                    Quick answers to common questions about our plans
                </p>

            </div>


            {/* FAQ List */}

            <div className="space-y-3">

                {faqs.map((faq, index) => {

                    const isOpen = openIndex === index;

                    return (

                        <div
                            key={index}
                            className={`
                                bg-white border rounded-xl
                                overflow-hidden
                                transition-all duration-200
                                ${
                                    isOpen
                                        ? "border-blue-200 shadow-sm"
                                        : "border-gray-200"
                                }
                            `}
                        >

                            {/* Question */}

                            <button
                                onClick={() => handleToggle(index)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >

                                <span className="text-sm font-semibold text-gray-800">
                                    {faq.question}
                                </span>

                                <span
                                    className={`
                                        flex items-center justify-center
                                        w-6 h-6 rounded-full
                                        transition
                                        ${
                                            isOpen
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-500"
                                        }
                                    `}
                                >

                                    <ChevronDown
                                        size={14}
                                        className={`
                                            transition-transform duration-200
                                            ${
                                                isOpen
                                                    ? "rotate-180"
                                                    : ""
                                            }
                                        `}
                                    />

                                </span>

                            </button>


                            {/* Answer */}

                            {isOpen && (

                                <div className="px-4 pb-4">

                                    <div className="border-t pt-4">

                                        <p className="text-sm text-gray-500 leading-6">
                                            {faq.answer}
                                        </p>

                                    </div>

                                </div>

                            )}

                        </div>

                    );

                })}

            </div>

        </section>
    );
}