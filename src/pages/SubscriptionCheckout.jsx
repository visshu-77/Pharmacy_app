import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Crown, ShieldCheck, Lock, CreditCard, Smartphone, Landmark, Wallet } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { EmptyState } from "../components/ui/State";
import { useToast } from "../components/ui/Toast";

import { createPaymentOrder, verifyPayment } from "../services/subscriptionService";
import { useSubscription } from "../context/SubscriptionContext";
import { useBusiness } from "../context/BusinessContext";
import BRAND from "../config/brand";

const CYCLE_LABEL = { monthly: "Monthly", sixMonths: "6 months", yearly: "12 months" };

export default function SubscriptionCheckout() {

    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();

    const { fetchSubscription } = useSubscription();
    const { user, shopName } = useBusiness();

    const [loading, setLoading] = useState(false);

    const { plan, planName, duration, price } = location.state || {};

    const handlePayment = async () => {
        if (!window.Razorpay) {
            toast.error("Payment gateway failed to load. Check your connection and refresh.");
            return;
        }

        try {
            setLoading(true);

            const result = await createPaymentOrder({ plan, duration });

            const razorpay = new window.Razorpay({
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: result.order.amount,
                currency: result.order.currency,
                name: BRAND.name,
                description: `${planName} · ${CYCLE_LABEL[duration] || duration}`,
                order_id: result.order.id,
                prefill: {
                    name: user?.ownerName || "",
                    email: user?.email || "",
                    contact: user?.mobileNumber ? String(user.mobileNumber) : ""
                },
                notes: { shop: shopName },
                theme: { color: "#2563EB" },
                modal: { ondismiss: () => setLoading(false) },
                handler: async (response) => {
                    try {
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan,
                            duration
                        });
                        await fetchSubscription();
                        toast.success(`${planName} is now active`, { title: "Payment successful" });
                        navigate("/", { replace: true });
                    } catch {
                        toast.error("Payment was received but could not be verified. Please contact support with your payment ID.", { duration: 0 });
                    } finally {
                        setLoading(false);
                    }
                }
            });

            razorpay.open();
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not start payment");
            setLoading(false);
        }
    };

    if (!location.state) {
        return (
            <Card className="max-w-lg mx-auto mt-10">
                <EmptyState
                    icon={Crown}
                    title="No plan selected"
                    message="Pick a plan to continue to checkout."
                    action={<Button to="/subscription">See plans</Button>}
                />
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                icon={Crown}
                title="Checkout"
                subtitle="Review your plan and pay securely"
                actions={<Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)}>Back</Button>}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 max-w-5xl">
                <Card>
                    <h2 className="font-semibold text-heading">Order summary</h2>

                    <div className="mt-5 flex items-start gap-4 rounded-xl border border-line bg-surface-muted p-4">
                        <span className="grid place-items-center h-12 w-12 shrink-0 rounded-xl bg-primary/10 text-primary">
                            <Crown className="h-6 w-6" />
                        </span>
                        <div className="flex-1">
                            <p className="font-bold text-heading text-lg">{planName}</p>
                            <p className="text-sm text-muted">{CYCLE_LABEL[duration] || duration} · for {shopName}</p>
                        </div>
                    </div>

                    <dl className="mt-6 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted">Billing period</dt>
                            <dd className="font-medium text-heading">{CYCLE_LABEL[duration] || duration}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted">Account</dt>
                            <dd className="font-medium text-heading truncate ml-4">{user?.email}</dd>
                        </div>
                        <div className="flex justify-between items-baseline pt-4 border-t border-line">
                            <dt className="font-semibold text-heading">Total due today</dt>
                            <dd className="text-3xl font-extrabold tracking-tight text-heading tabular">
                                ₹{Number(price).toLocaleString("en-IN")}
                            </dd>
                        </div>
                    </dl>
                </Card>

                <Card className="h-fit">
                    <h2 className="font-semibold text-heading">Pay with Razorpay</h2>
                    <p className="text-sm text-muted mt-1">Choose UPI, card, net banking or wallet in the next step.</p>

                    <div className="mt-5 grid grid-cols-4 gap-2">
                        {[
                            { icon: Smartphone, label: "UPI" },
                            { icon: CreditCard, label: "Card" },
                            { icon: Landmark, label: "Bank" },
                            { icon: Wallet, label: "Wallet" }
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex flex-col items-center gap-1 rounded-lg border border-line py-2.5 text-[11px] font-medium text-muted">
                                <Icon className="h-4 w-4" />
                                {label}
                            </div>
                        ))}
                    </div>

                    <Button fullWidth size="lg" className="mt-6 h-12" icon={Lock} loading={loading} onClick={handlePayment}>
                        Pay ₹{Number(price).toLocaleString("en-IN")}
                    </Button>

                    <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
                        <ShieldCheck className="h-3.5 w-3.5 text-success" />
                        Secured by Razorpay
                    </p>
                </Card>
            </div>
        </div>
    );
}
