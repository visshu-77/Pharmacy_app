import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Receipt } from "lucide-react";

import SettingsHeading, { SettingsSection } from "./settingHeading";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { Spinner, EmptyState, ErrorState } from "../ui/State";
import { cycleLabel } from "./subscription";

import { getBillingDetails } from "../../services/userService";
import { useBusiness } from "../../context/BusinessContext";
import { planLabel } from "../../config/plans";

const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function Billing() {

    const { t } = useTranslation();
    const { formatMoney } = useBusiness();

    const [billing, setBilling] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getBillingDetails()
            .then(setBilling)
            .catch((err) => setError(err?.response?.data?.message || "Could not load billing details"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner />;

    const current = billing?.currentSubscription;
    const history = billing?.paymentHistory || [];

    return (
        <div className="space-y-6">
            <SettingsHeading heading={t("BillingInformation.title")} content={t("BillingInformation.content")} />

            {error && <ErrorState message={error} />}

            {current && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: t("BillingInformation.CurrentPlan"), value: planLabel(current.plan) },
                        { label: t("BillingInformation.CurrentPrice"), value: formatMoney(current.price) },
                        { label: t("BillingInformation.BillingCycle"), value: cycleLabel(current.duration) },
                        { label: "Valid until", value: formatDate(current.endDate) }
                    ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-line bg-surface p-4">
                            <p className="text-xs text-muted">{item.label}</p>
                            <p className="mt-1.5 font-semibold text-heading">{item.value}</p>
                        </div>
                    ))}
                </div>
            )}

            <SettingsSection title={t("BillingInformation.PaymentHistory")}>
                {history.length === 0 ? (
                    <EmptyState
                        icon={Receipt}
                        title="No payments yet"
                        message="Your plan payments and receipts will be listed here."
                        action={!current && <Button to="/subscription">See plans</Button>}
                        className="py-8"
                    />
                ) : (
                    <div className="-m-5 overflow-x-auto thin-scrollbar">
                        <table className="w-full min-w-[560px] text-sm">
                            <thead>
                                <tr className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                                    <th className="py-3 px-5">{t("BillingInformation.Plan")}</th>
                                    <th className="py-3 px-3">{t("BillingInformation.Duration")}</th>
                                    <th className="py-3 px-3 text-right">{t("BillingInformation.Amount")}</th>
                                    <th className="py-3 px-3">{t("BillingInformation.Status")}</th>
                                    <th className="py-3 px-5">{t("BillingInformation.Date")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {history.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-surface-hover">
                                        <td className="py-3 px-5 font-semibold text-heading">{planLabel(payment.plan)}</td>
                                        <td className="py-3 px-3 text-body">{cycleLabel(payment.duration)}</td>
                                        <td className="py-3 px-3 text-right font-semibold text-heading tabular">{formatMoney(payment.price)}</td>
                                        <td className="py-3 px-3">
                                            <Badge size="sm" dot tone={payment.paymentStatus === "paid" ? "success" : "warning"}>
                                                {payment.paymentStatus}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-5 text-muted tabular">{formatDate(payment.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SettingsSection>
        </div>
    );
}
