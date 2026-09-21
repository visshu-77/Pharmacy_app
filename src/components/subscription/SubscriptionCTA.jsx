import { ArrowRight } from "lucide-react";

export default function SubscriptionCTA({ onGetStarted, onBackToDashboard }) {
    return (
        <section className="mt-20">
            <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#1e3a8a_0%,#2563eb_55%,#4f46e5_100%)] px-6 py-14 md:px-12 text-center shadow-lg">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" aria-hidden="true" />

                <div className="relative">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                        Ready to run your shop the easy way?
                    </h2>
                    <p className="max-w-xl mx-auto mt-3 text-sm md:text-base text-white/75">
                        Faster billing, fewer stock-outs and clear numbers at the end of every day.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onGetStarted}
                            className="group inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-primary text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                            Choose a plan
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            type="button"
                            onClick={onBackToDashboard}
                            className="inline-flex items-center h-12 px-6 rounded-xl border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                        >
                            Back to dashboard
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
