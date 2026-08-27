import { Check } from "lucide-react";

export default function PricingCard({
    plan,
    duration,
    onSelect
}) {

    const price = plan.prices[duration];

    const isPremium = plan.id === "premium";

    return (

        <div
            className={`
                relative bg-white rounded-xl p-6 border
                transition duration-300 dark:bg-darkColor dark:text-white
                ${
                    isPremium
                        ? "border-blue-600 shadow-lg"
                        : "border-gray-200 shadow-sm"
                }
            `}
        >

            {/* Most Popular */}
            {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">

                    <span className="bg-blue-600 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase">
                        Most Popular
                    </span>

                </div>
            )}


            {/* Plan */}
            <div>

                <p className="text-xs font-semibold uppercase text-gray-400 dark:text-white">
                    {plan.name}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                    {plan.description}
                </p>

            </div>


            {/* Price */}
            <div className="mt-8">

                <div className="text-3xl font-bold text-gray-900 dark:bg-darkColor dark:text-white">
                    ₹{price.toLocaleString("en-IN")}
                </div>

                <p className="text-xs text-gray-400 mt-1">
                    {duration === "monthly"
                        ? "/month"
                        : duration === "sixMonths"
                            ? "/6 months"
                            : "/12 months"
                    }
                </p>

            </div>


            {/* Divider */}
            <div className="border-t my-6" />


            {/* Features */}
            <div className="space-y-3">

                {plan.features.map((feature, index) => (

                    <div
                        key={index}
                        className="flex items-start gap-2"
                    >

                        <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">

                            <Check
                                size={11}
                                className="text-blue-600"
                            />

                        </div>

                        <span className="text-xs text-gray-600 dark:bg-darkColor dark:text-white">
                            {feature}
                        </span>

                    </div>

                ))}

            </div>


            {/* Button */}
            <button
                onClick={() => onSelect(plan)}
                className={`
                    w-full mt-8 py-2.5 rounded-lg text-sm font-semibold transition dark:bg-darkColor dark:text-white
                    ${
                        isPremium
                            ? "bg-blue-600 text-white hover:bg-blue-700 dark:border dark:border-white"
                            : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                    }
                `}
            >

                {plan.id === "normal"
                    ? "Get Started"
                    : plan.id === "premium"
                        ? "Choose Premium"
                        : "Choose Business"
                }

            </button>

        </div>
    );
}