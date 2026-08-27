import { ArrowRight } from "lucide-react";

export default function SubscriptionCTA({
    onGetStarted,
    onBackToDashboard
}) {
    return (
        <section className="max-w-5xl mx-auto mt-20">

            <div className="relative overflow-hidden rounded-2xl bg-blue-600 px-6 py-14 md:px-10 text-center dark:bg-darkColor dark:text-white dark:border dark:border-white">

                {/* Decorative circles */}

                <div className="absolute -right-16 -top-16 w-40 h-40 border border-white/10 rounded-full" />

                <div className="absolute -right-5 -top-5 w-24 h-24 border border-white/10 rounded-full" />

                <div className="absolute -left-20 -bottom-20 w-44 h-44 border border-white/10 rounded-full" />


                {/* Content */}

                <div className="relative z-10">

                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                        Ready to simplify your business management?
                    </h2>

                    <p className="max-w-xl mx-auto mt-4 text-sm md:text-base text-blue-100">
                        Choose a plan and start managing your products,
                        inventory and billing more efficiently.
                    </p>


                    {/* Buttons */}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">

                        <button
                            onClick={onGetStarted}
                            className="group bg-white text-blue-600 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-50 transition flex items-center gap-2"
                        >
                            Get Started

                            <ArrowRight
                                size={16}
                                className="group-hover:translate-x-1 transition"
                            />
                        </button>


                        <button
                            onClick={onBackToDashboard}
                            className="border border-white/40 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-white/10 transition"
                        >
                            Back to Dashboard
                        </button>

                    </div>

                </div>

            </div>

        </section>
    );
}