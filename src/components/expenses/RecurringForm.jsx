import { useMemo, useState } from "react";
import { Repeat2 } from "lucide-react";

import Button from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Field";
import Modal from "../ui/Modal";

const PAYMENTS = ["Cash", "UPI", "Bank Transfer", "Credit Card", "Debit Card", "Other"];
const FREQUENCIES = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" }
];
const TYPES = [
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
    { value: "investment", label: "Investment" }
];
const today = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function RecurringForm({ open, onClose, categories, rule, onSave, loading }) {
    const [title, setTitle] = useState(rule?.title || "");
    const [type, setType] = useState(rule?.type || "expense");
    const [amount, setAmount] = useState(rule?.amount ?? "");
    const [categoryId, setCategoryId] = useState(rule?.categoryId?._id || rule?.categoryId || "");
    const [paymentMethod, setPaymentMethod] = useState(rule?.paymentMethod || "Cash");
    const [frequency, setFrequency] = useState(rule?.frequency || "monthly");
    const [startDate, setStartDate] = useState(rule?.startDate?.slice(0, 10) || today());
    const [endDate, setEndDate] = useState(rule?.endDate?.slice(0, 10) || "");
    const [description, setDescription] = useState(rule?.description || "");
    const matchingCategories = useMemo(
        () => categories.filter((category) => category.type === type),
        [categories, type]
    );

    const handleTypeChange = (event) => {
        const nextType = event.target.value;
        if (!matchingCategories.some((category) => category._id === categoryId && category.type === nextType)) {
            setCategoryId("");
        }
        setType(nextType);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSave({
            title: title.trim(),
            type,
            amount: Number(amount),
            categoryId,
            paymentMethod,
            frequency,
            startDate,
            endDate: endDate || null,
            description: description.trim()
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={rule ? "Edit recurring transaction" : "Add recurring transaction"}
            subtitle="Entries are created automatically when each scheduled date arrives."
            icon={Repeat2}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="Transaction title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
                    <Input label="Amount" type="number" min="0.01" max="100000000" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} suffix="₹" required />
                    <Select label="Type" value={type} onChange={handleTypeChange} options={TYPES} />
                    <Select
                        label="Category"
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                        options={matchingCategories.map((category) => ({ value: category._id, label: category.name }))}
                        placeholder="Choose a category"
                        required
                    />
                    <Select label="Payment method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} options={PAYMENTS} />
                    <Select label="Frequency" value={frequency} onChange={(event) => setFrequency(event.target.value)} options={FREQUENCIES} />
                    <Input label="Start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
                    <Input label="End date (optional)" type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                </div>
                <Textarea label="Notes" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={2} />
                <div className="flex justify-end gap-2 border-t border-line pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={loading}>{rule ? "Save changes" : "Create schedule"}</Button>
                </div>
            </form>
        </Modal>
    );
}
