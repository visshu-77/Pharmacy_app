import { useMemo, useState } from "react";
import { ReceiptText } from "lucide-react";

import Button from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Field";
import Modal from "../ui/Modal";

const TYPES = [
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
    { value: "investment", label: "Investment" },
    { value: "refund", label: "Refund" },
    { value: "transfer", label: "Transfer" }
];
const PAYMENTS = ["Cash", "UPI", "Bank Transfer", "Credit Card", "Debit Card", "Other"];
const today = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const getDateValue = (value) => value
    ? new Date(value).toISOString().slice(0, 10)
    : today();

export default function TransactionForm({ open, onClose, categories, transaction, onSave, loading }) {
    const [title, setTitle] = useState(transaction?.title || "");
    const [type, setType] = useState(transaction?.type || "expense");
    const [amount, setAmount] = useState(transaction?.amount ?? "");
    const [categoryId, setCategoryId] = useState(
        typeof transaction?.categoryId === "object"
            ? transaction.categoryId?._id || ""
            : transaction?.categoryId || ""
    );
    const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod || "Cash");
    const [transactionDate, setTransactionDate] = useState(getDateValue(transaction?.transactionDate));
    const [description, setDescription] = useState(transaction?.description || "");
    const [receipt, setReceipt] = useState(null);
    const categoryType = type === "refund" ? "expense" : type;
    const matchingCategories = useMemo(
        () => categories.filter((category) => category.type === categoryType),
        [categories, categoryType]
    );

    const handleTypeChange = (event) => {
        const nextType = event.target.value;
        const nextCategoryType = nextType === "refund" ? "expense" : nextType;
        setType(nextType);
        if (nextType === "transfer") {
            setCategoryId("");
        } else if (!matchingCategories.some((category) => category._id === categoryId && category.type === nextCategoryType)) {
            setCategoryId("");
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSave({
            title: title.trim(),
            type,
            amount: Number(amount),
            categoryId: type === "transfer" ? "" : categoryId,
            paymentMethod,
            transactionDate,
            description: description.trim()
        }, receipt);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={transaction ? "Edit transaction" : "Add transaction"}
            subtitle="Record income, expenses, investments, refunds, or transfers."
            icon={ReceiptText}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Transaction title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        maxLength={120}
                        placeholder="e.g. Office electricity bill"
                        required
                    />
                    <Input
                        label="Amount"
                        type="number"
                        min="0.01"
                        max="100000000"
                        step="0.01"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        suffix="₹"
                        required
                    />
                    <Select label="Transaction type" value={type} onChange={handleTypeChange} options={TYPES} />
                    <Select
                        label="Category"
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                        disabled={type === "transfer"}
                        required={type !== "transfer"}
                        placeholder={type === "transfer" ? "Not required for transfers" : "Choose a category"}
                        options={matchingCategories.map((category) => ({
                            value: category._id,
                            label: category.name
                        }))}
                    />
                    <Select
                        label="Payment method"
                        value={paymentMethod}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                        options={PAYMENTS}
                    />
                    <Input
                        label="Transaction date"
                        type="date"
                        value={transactionDate}
                        onChange={(event) => setTransactionDate(event.target.value)}
                        required
                    />
                </div>
                <Textarea
                    label="Description / notes"
                    rows={3}
                    maxLength={2000}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Optional details"
                />
                <Input
                    label="Bill or receipt (optional)"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(event) => setReceipt(event.target.files?.[0] || null)}
                    hint="PDF, JPEG, PNG, or WebP up to 5 MB."
                />
                {transaction?.receipt?.fileName && (
                    <p className="text-xs text-muted">
                        Current receipt: {transaction.receipt.fileName}. Upload another file to replace it.
                    </p>
                )}
                <div className="flex justify-end gap-2 border-t border-line pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={loading}>
                        {transaction ? "Save changes" : "Add transaction"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
