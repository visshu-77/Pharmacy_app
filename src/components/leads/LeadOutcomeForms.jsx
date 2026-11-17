import { useEffect, useState } from "react";
import { CheckCircle2, WalletCards, XCircle } from "lucide-react";

import Button from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Field";
import Modal from "../ui/Modal";

const DEFAULT_LOST_REASONS = [
    "Budget Issue", "Competitor Selected", "Customer Not Interested", "No Response",
    "Price Too High", "Service Not Available", "Project Cancelled", "Other"
];
const today = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export function ConversionForm({ lead, saving, onClose, onSave }) {
    const [form, setForm] = useState({ finalDealAmount: "", conversionDate: today(), notes: "", responsibleEmployee: "" });
    useEffect(() => {
        setForm({
            finalDealAmount: lead?.expectedDealValue ?? "",
            conversionDate: today(),
            notes: "",
            responsibleEmployee: lead?.assignedEmployee || ""
        });
    }, [lead]);
    const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
    const submit = (event) => {
        event.preventDefault();
        onSave({
            finalDealAmount: Number(form.finalDealAmount),
            conversionDate: new Date(`${form.conversionDate}T00:00:00`).toISOString(),
            notes: form.notes,
            responsibleEmployee: form.responsibleEmployee
        });
    };

    return (
        <Modal open={Boolean(lead)} onClose={onClose} title="Convert lead" subtitle={`Record the deal for ${lead?.customerName || "selected lead"}.`} icon={CheckCircle2} size="md" footer={
            <>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" form="lead-conversion-form" loading={saving}>Convert lead</Button>
            </>
        }>
            <form id="lead-conversion-form" onSubmit={submit} className="space-y-4">
                <Input label="Final deal amount" type="number" min="0" step="0.01" value={form.finalDealAmount} onChange={set("finalDealAmount")} required />
                <Input label="Conversion date" type="date" value={form.conversionDate} onChange={set("conversionDate")} required />
                <Input label="Responsible employee" value={form.responsibleEmployee} onChange={set("responsibleEmployee")} maxLength={120} required />
                <Textarea label="Conversion notes" value={form.notes} onChange={set("notes")} maxLength={2000} rows={3} />
            </form>
        </Modal>
    );
}

export function CompletedLeadForm({ lead, saving, onClose, onSave }) {
    const [form, setForm] = useState({ finalQuotationAmount: "", finalAmount: "" });
    useEffect(() => {
        setForm({
            finalQuotationAmount: lead?.finalQuotationAmount ?? lead?.expectedDealValue ?? "",
            finalAmount: lead?.finalAmount ?? lead?.expectedDealValue ?? ""
        });
    }, [lead]);
    const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
    const submit = (event) => {
        event.preventDefault();
        onSave({
            finalQuotationAmount: Number(form.finalQuotationAmount),
            finalAmount: Number(form.finalAmount)
        });
    };

    return (
        <Modal open={Boolean(lead)} onClose={onClose} title="Complete lead" subtitle={`Enter the final quotation and agreed amount for ${lead?.customerName || "this lead"}. This does not mark the lead as Converted / Won or record income.`} icon={CheckCircle2} size="md" footer={
            <>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" form="lead-completed-form" loading={saving}>Save and complete</Button>
            </>
        }>
            <form id="lead-completed-form" onSubmit={submit} className="space-y-4">
                <Input label="Final quotation amount" type="number" min="0" max="10000000000" step="0.01" value={form.finalQuotationAmount} onChange={set("finalQuotationAmount")} required />
                <Input label="Final amount" type="number" min="0" max="10000000000" step="0.01" value={form.finalAmount} onChange={set("finalAmount")} required />
            </form>
        </Modal>
    );
}

export function LostLeadForm({ lead, lostReasons = DEFAULT_LOST_REASONS, saving, onClose, onSave }) {
    const [reason, setReason] = useState("");
    const [remarks, setRemarks] = useState("");
    useEffect(() => {
        setReason("");
        setRemarks("");
    }, [lead]);
    const submit = (event) => {
        event.preventDefault();
        onSave({ reason, remarks });
    };

    return (
        <Modal open={Boolean(lead)} onClose={onClose} title="Mark lead as lost" subtitle={`Record why ${lead?.customerName || "this lead"} did not convert.`} icon={XCircle} size="md" footer={
            <>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" form="lead-lost-form" variant="danger" loading={saving}>Mark as lost</Button>
            </>
        }>
            <form id="lead-lost-form" onSubmit={submit} className="space-y-4">
                <Select label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} options={lostReasons} placeholder="Select reason" required />
                <Textarea label="Additional remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} maxLength={2000} rows={4} />
            </form>
        </Modal>
    );
}

const PAYMENT_METHODS = ["Cash", "UPI", "Bank Transfer", "Credit Card", "Debit Card", "Other"];

export function RecordIncomeForm({ lead, conversion, recordedIncome = 0, saving, onClose, onSave }) {
    const remaining = Math.max(0, Number(conversion?.finalDealAmount || 0) - Number(recordedIncome || 0));
    const [form, setForm] = useState({ amount: "", transactionDate: today(), paymentMethod: "Cash" });
    useEffect(() => {
        setForm({ amount: "", transactionDate: today(), paymentMethod: "Cash" });
    }, [lead]);
    const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
    const submit = (event) => {
        event.preventDefault();
        const eventKey = window.crypto?.randomUUID
            ? window.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        onSave({
            amount: Number(form.amount),
            transactionDate: new Date(`${form.transactionDate}T00:00:00`).toISOString(),
            paymentMethod: form.paymentMethod,
            eventKey
        });
    };

    return (
        <Modal open={Boolean(lead)} onClose={onClose} title="Record confirmed income" subtitle={`Payment received for ${lead?.customerName || "converted lead"}. This creates an income transaction.`} icon={WalletCards} size="md" footer={
            <>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" form="lead-income-form" loading={saving}>Record payment</Button>
            </>
        }>
            <form id="lead-income-form" onSubmit={submit} className="space-y-4">
                <p className="rounded-lg bg-surface-muted p-3 text-sm text-body">
                    Remaining converted deal amount: <strong>{remaining.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</strong>.
                    Only money already received should be entered.
                </p>
                <Input label="Confirmed amount received" type="number" min="0.01" max={remaining} step="0.01" value={form.amount} onChange={set("amount")} required />
                <Input label="Payment date" type="date" value={form.transactionDate} onChange={set("transactionDate")} required />
                <Select label="Payment method" value={form.paymentMethod} onChange={set("paymentMethod")} options={PAYMENT_METHODS} required />
            </form>
        </Modal>
    );
}
