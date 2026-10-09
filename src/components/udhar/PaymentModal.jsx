import { useEffect, useMemo, useRef, useState } from "react";
import { Wallet, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Select } from "../ui/Field";
import { useBusiness } from "../../context/BusinessContext";

import { recordPayment, newIdempotencyKey } from "../../services/creditService";

const METHODS = ["Cash", "UPI", "Card"];

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

const todayValue = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;

    return new Date(now - offset).toISOString().slice(0, 10);
};

/** Take money back against the khata — part of it, or all of it. */
export default function PaymentModal({ show, customer, onClose, onSaved }) {

    const { formatMoney } = useBusiness();

    const outstanding = round2(customer?.outstanding || 0);

    const [step, setStep] = useState("edit");
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("Cash");
    const [date, setDate] = useState(todayValue());
    const [reference, setReference] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // Fixed for as long as the form is open, so a double tap is recognised
    // by the server as the same payment.
    const idempotencyKey = useRef(newIdempotencyKey());

    useEffect(() => {
        if (!show) return;

        setStep("edit");
        setAmount("");
        setMethod("Cash");
        setDate(todayValue());
        setReference("");
        setDescription("");
        setError("");
        idempotencyKey.current = newIdempotencyKey();
    }, [show, customer?._id]);

    const paying = round2(Number(amount) || 0);
    const remaining = useMemo(() => round2(outstanding - paying), [outstanding, paying]);

    if (!show) return null;

    const money = (value) => formatMoney(value, { decimals: 2 });

    const validate = () => {
        if (!(paying > 0)) return "Enter how much was paid";
        if (round2(paying) !== paying) return "Amount can have at most two decimals";
        if (paying > outstanding) return `That is more than the ${money(outstanding)} outstanding`;

        return "";
    };

    const review = () => {
        const problem = validate();

        if (problem) {
            setError(problem);
            return;
        }

        setError("");
        setStep("confirm");
    };

    const submit = async () => {
        try {
            setSaving(true);
            setError("");

            const data = await recordPayment({
                customerId: customer._id,
                // Settling in full is sent as a flag, so the server works out
                // the amount from the balance it can see right now.
                ...(paying === outstanding
                    ? { settleFull: true }
                    : { amount: paying }),
                paymentMethod: method,
                date: new Date(`${date}T12:00:00`).toISOString(),
                referenceNumber: reference.trim(),
                description: description.trim(),
                idempotencyKey: idempotencyKey.current
            });

            onSaved?.(data);

        } catch (err) {
            setError(err?.response?.data?.message || "Could not record this payment");
            setStep("edit");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            onClose={saving ? undefined : onClose}
            closeOnBackdrop={!saving}
            size="md"
            icon={Wallet}
            title={step === "confirm" ? "Confirm this payment" : "Collect payment"}
            subtitle={customer?.customerName}
            footer={
                step === "confirm" ? (
                    <>
                        <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep("edit")} disabled={saving}>
                            Back
                        </Button>
                        <Button variant="success" onClick={submit} loading={saving}>
                            Received {money(paying)}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button onClick={review} disabled={outstanding <= 0}>Review</Button>
                    </>
                )
            }
        >
            <div className="space-y-4">

                {/* Before / after */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-line bg-surface-muted px-4 py-3">
                        <p className="text-[11px] text-muted">Outstanding now</p>
                        <p className="mt-0.5 text-xl font-bold text-heading tabular">{money(outstanding)}</p>
                    </div>

                    <div
                        className={[
                            "rounded-xl border px-4 py-3",
                            remaining <= 0 && paying > 0
                                ? "border-success/30 bg-success/10"
                                : "border-line bg-surface-muted"
                        ].join(" ")}
                    >
                        <p className="text-[11px] text-muted">After this payment</p>
                        <p className="mt-0.5 text-xl font-bold text-heading tabular">
                            {money(Math.max(0, remaining))}
                        </p>
                    </div>
                </div>

                {outstanding <= 0 ? (
                    <p className="flex items-center gap-2 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-heading">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        This khata is already clear — nothing to collect.
                    </p>
                ) : step === "confirm" ? (
                    <dl className="divide-y divide-line rounded-xl border border-line text-sm">
                        {[
                            ["Customer", customer?.customerName],
                            ["Amount", money(paying)],
                            ["Paid by", method],
                            ["Date", new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { dateStyle: "medium" })],
                            reference.trim() && ["Reference", reference.trim()],
                            description.trim() && ["Remark", description.trim()]
                        ].filter(Boolean).map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                                <dt className="text-muted">{label}</dt>
                                <dd className="font-semibold text-heading text-right">{value}</dd>
                            </div>
                        ))}

                        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                            <dt className="text-muted">Balance after</dt>
                            <dd className="font-bold text-heading tabular">{money(Math.max(0, remaining))}</dd>
                        </div>
                    </dl>
                ) : (
                    <>
                        <div>
                            <Input
                                label="Amount received"
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                                error={paying > outstanding ? "More than the outstanding balance" : ""}
                                autoFocus
                            />

                            <button
                                type="button"
                                onClick={() => { setAmount(String(outstanding)); setError(""); }}
                                className="mt-2 text-xs font-semibold text-primary hover:underline"
                            >
                                Settle the full {money(outstanding)}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Select
                                label="Paid by"
                                options={METHODS}
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                            />
                            <Input
                                label="Date"
                                type="date"
                                value={date}
                                max={todayValue()}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="Reference"
                                placeholder="Optional — slip or UPI ref"
                                value={reference}
                                maxLength={40}
                                onChange={(e) => setReference(e.target.value)}
                            />
                            <Input
                                label="Remark"
                                placeholder="Optional"
                                value={description}
                                maxLength={250}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </>
                )}

                {error && (
                    <p className="flex items-center gap-1.5 text-sm text-danger" role="alert">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </p>
                )}
            </div>
        </Modal>
    );
}
