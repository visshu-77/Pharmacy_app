import { useEffect, useMemo, useRef, useState } from "react";
import {
    HandCoins, Search, Plus, Trash2, Loader2, AlertCircle,
    PackagePlus, PencilLine, ArrowLeft
} from "lucide-react";

import Modal from "../ui/Modal";
import Button, { IconButton } from "../ui/Button";
import Badge from "../ui/Badge";
import { Input } from "../ui/Field";
import { useBusiness } from "../../context/BusinessContext";

import { searchProducts } from "../../services/productService";
import { recordCreditSale, newIdempotencyKey } from "../../services/creditService";

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

const todayValue = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;

    return new Date(now - offset).toISOString().slice(0, 10);
};

/**
 * Give goods — or just an amount — on udhar.
 *
 * Two ways in: pick items out of the inventory, which takes the stock off the
 * shelf and writes a bill, or write a plain amount into the khata for
 * something that was never on the shelf (an old balance, a repair charge).
 */
export default function CreditSaleModal({ show, customer, onClose, onSaved }) {

    const { term, formatMoney, getStockStatus } = useBusiness();

    const [mode, setMode] = useState("items");          // items | custom
    const [step, setStep] = useState("edit");           // edit | confirm

    const [lines, setLines] = useState([]);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(todayValue());
    const [discount, setDiscount] = useState("");
    const [tax, setTax] = useState("");

    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // One key per opening of the form: a retried submit is recognised by the
    // server as the same sale instead of a second one.
    const idempotencyKey = useRef(newIdempotencyKey());
    const searchRef = useRef(null);

    useEffect(() => {
        if (!show) return;

        setMode("items");
        setStep("edit");
        setLines([]);
        setAmount("");
        setDescription("");
        setDate(todayValue());
        setDiscount("");
        setTax("");
        setSearch("");
        setResults([]);
        setError("");
        idempotencyKey.current = newIdempotencyKey();
    }, [show, customer?._id]);

    useEffect(() => {
        const query = search.trim();

        if (!query) {
            setResults([]);
            return undefined;
        }

        const timer = setTimeout(async () => {
            try {
                setSearching(true);
                const data = await searchProducts(query);
                setResults(data.products || []);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 220);

        return () => clearTimeout(timer);
    }, [search]);

    const totals = useMemo(() => {
        const subtotal = round2(
            lines.reduce((sum, line) => sum + Number(line.price || 0) * Number(line.quantity || 0), 0)
        );

        const off = Math.min(subtotal, Number(discount) || 0);
        const gst = Number(tax) || 0;

        return { subtotal, discount: round2(off), tax: round2(gst), grandTotal: round2(subtotal - off + gst) };
    }, [lines, discount, tax]);

    const customTotal = round2(Number(amount) || 0);
    const total = mode === "items" ? totals.grandTotal : customTotal;

    if (!show) return null;

    const addLine = (product) => {
        setSearch("");
        setResults([]);
        setError("");

        setLines((current) => {
            const existing = current.find((line) => line._id === product._id);

            if (existing) {
                return current.map((line) =>
                    line._id === product._id
                        ? { ...line, quantity: round2(Number(line.quantity) + 1) }
                        : line
                );
            }

            return [...current, {
                _id: product._id,
                productName: product.productName,
                unit: product.unit || "piece",
                stock: Number(product.stock || 0),
                price: Number(product.sellingPrice || 0),
                quantity: 1
            }];
        });

        searchRef.current?.focus();
    };

    const setLine = (id, field, value) =>
        setLines((current) =>
            current.map((line) => (line._id === id ? { ...line, [field]: value } : line))
        );

    const removeLine = (id) =>
        setLines((current) => current.filter((line) => line._id !== id));

    /** Anything the owner can fix before the request is even sent. */
    const validate = () => {
        if (mode === "custom") {
            if (!(customTotal > 0)) return "Enter an amount in rupees";
            if (round2(customTotal) !== customTotal) return "Amount can have at most two decimals";
            return "";
        }

        if (lines.length === 0) return `Add at least one ${term.itemLower}`;

        for (const line of lines) {
            if (!(Number(line.quantity) > 0)) {
                return `Quantity for ${line.productName} must be more than 0`;
            }

            if (Number(line.quantity) > line.stock) {
                return `${line.productName} has only ${line.stock} ${line.unit} in stock`;
            }

            if (!(Number(line.price) >= 0)) {
                return `Price for ${line.productName} cannot be negative`;
            }
        }

        if (totals.grandTotal <= 0) return "The total must be more than 0";

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

            const payload = {
                customerId: customer._id,
                date: new Date(`${date}T12:00:00`).toISOString(),
                description: description.trim(),
                idempotencyKey: idempotencyKey.current
            };

            const data = mode === "items"
                ? await recordCreditSale({
                    ...payload,
                    items: lines.map((line) => ({
                        productId: line._id,
                        quantity: Number(line.quantity),
                        price: Number(line.price)
                    })),
                    discount: totals.discount,
                    tax: totals.tax
                })
                : await recordCreditSale({ ...payload, amount: customTotal });

            onSaved?.(data);

        } catch (err) {
            // Stock can go while the form is open — show it and let them fix it.
            setError(err?.response?.data?.message || "Could not save this entry");
            setStep("edit");
        } finally {
            setSaving(false);
        }
    };

    const money = (value) => formatMoney(value, { decimals: 2 });

    return (
        <Modal
            onClose={saving ? undefined : onClose}
            closeOnBackdrop={!saving}
            size="lg"
            icon={HandCoins}
            title={step === "confirm" ? "Confirm this udhar" : "Give on udhar"}
            subtitle={customer?.customerName}
            footer={
                step === "confirm" ? (
                    <>
                        <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep("edit")} disabled={saving}>
                            Back
                        </Button>
                        <Button onClick={submit} loading={saving}>
                            Confirm {money(total)}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button onClick={review} disabled={mode === "items" ? lines.length === 0 : !amount}>
                            Review
                        </Button>
                    </>
                )
            }
        >
            {step === "confirm" ? (
                <div className="space-y-4">
                    <div className="rounded-xl border border-line bg-surface-muted p-4">
                        <p className="text-xs text-muted">Going into the khata of</p>
                        <p className="text-lg font-bold text-heading">{customer?.customerName}</p>
                        {customer?.phone && <p className="text-xs text-muted tabular">{customer.phone}</p>}
                    </div>

                    {mode === "items" ? (
                        <ul className="divide-y divide-line rounded-xl border border-line">
                            {lines.map((line) => (
                                <li key={line._id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                                    <span className="min-w-0">
                                        <span className="block font-medium text-heading truncate">{line.productName}</span>
                                        <span className="text-xs text-muted tabular">
                                            {line.quantity} {line.unit} × {money(line.price)}
                                        </span>
                                    </span>
                                    <span className="font-semibold text-heading tabular shrink-0">
                                        {money(round2(line.price * line.quantity))}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="rounded-xl border border-line px-4 py-3 text-sm">
                            <span className="text-muted">Amount written into the khata</span>
                            <p className="mt-1 text-2xl font-bold text-heading tabular">{money(customTotal)}</p>
                        </div>
                    )}

                    <dl className="space-y-1.5 text-sm">
                        {mode === "items" && (
                            <>
                                <div className="flex justify-between">
                                    <dt className="text-muted">Subtotal</dt>
                                    <dd className="tabular text-heading">{money(totals.subtotal)}</dd>
                                </div>
                                {totals.discount > 0 && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted">Discount</dt>
                                        <dd className="tabular text-success">− {money(totals.discount)}</dd>
                                    </div>
                                )}
                                {totals.tax > 0 && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted">Tax</dt>
                                        <dd className="tabular text-heading">{money(totals.tax)}</dd>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex justify-between border-t border-line pt-2">
                            <dt className="font-semibold text-heading">They will owe</dt>
                            <dd className="text-xl font-extrabold text-heading tabular">
                                {money(round2((customer?.outstanding || 0) + total))}
                            </dd>
                        </div>
                    </dl>

                    {mode === "items" && (
                        <p className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5 text-xs text-heading">
                            <PackagePlus className="h-4 w-4 shrink-0 mt-0.5" />
                            This takes the {term.itemsLower} off your stock. It is not a cash sale, so it
                            will not show in today's takings.
                        </p>
                    )}

                    {error && (
                        <p className="flex items-center gap-1.5 text-sm text-danger" role="alert">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </p>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Mode switch */}
                    <div className="grid grid-cols-2 gap-2" role="tablist">
                        {[
                            { id: "items", label: `Pick ${term.itemsLower}`, icon: PackagePlus },
                            { id: "custom", label: "Just an amount", icon: PencilLine }
                        ].map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                role="tab"
                                aria-selected={mode === option.id}
                                onClick={() => { setMode(option.id); setError(""); }}
                                className={[
                                    "flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-semibold transition-colors",
                                    mode === option.id
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-line text-muted hover:bg-surface-hover"
                                ].join(" ")}
                            >
                                <option.icon className="h-4 w-4" />
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {mode === "items" ? (
                        <>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={`Search ${term.itemsLower} to add…`}
                                    className="w-full h-11 pl-9 pr-9 rounded-lg border border-line bg-surface text-sm text-heading focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    aria-label={`Search ${term.itemsLower}`}
                                    autoComplete="off"
                                />
                                {searching && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-faint" />
                                )}
                            </div>

                            {search.trim() && (
                                <div className="rounded-xl border border-line overflow-hidden">
                                    {results.length === 0 && !searching ? (
                                        <p className="px-4 py-4 text-center text-sm text-muted">
                                            No {term.itemsLower} match "{search.trim()}"
                                        </p>
                                    ) : (
                                        <ul className="max-h-56 overflow-y-auto thin-scrollbar divide-y divide-line">
                                            {results.map((product) => {
                                                const status = getStockStatus(product);

                                                return (
                                                    <li key={product._id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => addLine(product)}
                                                            disabled={status.key === "out"}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <span className="min-w-0 flex-1">
                                                                <span className="block text-sm font-medium text-heading truncate">
                                                                    {product.productName}
                                                                </span>
                                                                <span className="text-xs text-muted">
                                                                    {formatMoney(product.sellingPrice, { decimals: 2 })}
                                                                </span>
                                                            </span>

                                                            <Badge tone={status.tone} size="sm">
                                                                {Number(product.stock)} {product.unit}
                                                            </Badge>

                                                            <span className="grid place-items-center h-7 w-7 rounded-lg bg-primary/10 text-primary shrink-0">
                                                                <Plus className="h-4 w-4" />
                                                            </span>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {lines.length > 0 && (
                                <ul className="divide-y divide-line rounded-xl border border-line">
                                    {lines.map((line) => {
                                        const short = Number(line.quantity) > line.stock;

                                        return (
                                            <li key={line._id} className="p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-heading truncate">
                                                            {line.productName}
                                                        </p>
                                                        <p className="text-[11px] text-muted tabular">
                                                            {line.stock} {line.unit} in stock
                                                        </p>
                                                    </div>

                                                    <IconButton
                                                        icon={Trash2}
                                                        label={`Remove ${line.productName}`}
                                                        size="sm"
                                                        className="hover:!bg-danger/10 hover:!text-danger"
                                                        onClick={() => removeLine(line._id)}
                                                    />
                                                </div>

                                                <div className="mt-2 grid grid-cols-3 gap-2 items-end">
                                                    <Input
                                                        label="Qty"
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        inputMode="decimal"
                                                        value={line.quantity}
                                                        error={short ? "More than stock" : ""}
                                                        onChange={(e) => setLine(line._id, "quantity", e.target.value)}
                                                    />
                                                    <Input
                                                        label="Price"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        inputMode="decimal"
                                                        value={line.price}
                                                        onChange={(e) => setLine(line._id, "price", e.target.value)}
                                                    />
                                                    <div className="text-right pb-3">
                                                        <p className="text-[11px] text-muted">Line total</p>
                                                        <p className="text-sm font-bold text-heading tabular">
                                                            {money(round2(Number(line.price || 0) * Number(line.quantity || 0)))}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}

                            {lines.length > 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Discount ₹"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                    />
                                    <Input
                                        label="Tax ₹"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={tax}
                                        onChange={(e) => setTax(e.target.value)}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <Input
                            label="Amount"
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            hint="For something that was never in your stock — an old balance, a repair charge."
                            autoFocus
                        />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Date"
                            type="date"
                            value={date}
                            max={todayValue()}
                            onChange={(e) => setDate(e.target.value)}
                        />
                        <Input
                            label="Remark"
                            placeholder="Optional"
                            value={description}
                            maxLength={250}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {total > 0 && (
                        <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
                            <span className="text-sm text-muted">Total going into the khata</span>
                            <span className="text-xl font-extrabold text-heading tabular">{money(total)}</span>
                        </div>
                    )}

                    {error && (
                        <p className="flex items-center gap-1.5 text-sm text-danger" role="alert">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </p>
                    )}
                </div>
            )}
        </Modal>
    );
}
