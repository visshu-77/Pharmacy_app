import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
    ReceiptText,
    Trash2,
    Minus,
    Plus,
    User,
    Phone,
    Banknote,
    Smartphone,
    CreditCard,
    ShoppingCart,
    Percent,
    IndianRupee,
    CheckCircle2,
    AlertTriangle
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { EmptyState } from "../components/ui/State";
import { useToast } from "../components/ui/Toast";

import ProductSearch from "../components/Billing/ProductSearch";
import Invoice from "../components/Invoice/Invoice";

import { createOrder } from "../services/orderService";
import { useCart } from "../context/CartContext";
import { useBusiness } from "../context/BusinessContext";

const PAYMENT_METHODS = [
    { id: "Cash", label: "Cash", icon: Banknote },
    { id: "UPI", label: "UPI", icon: Smartphone },
    { id: "Card", label: "Card", icon: CreditCard }
];

const round2 = (value) => Math.round(value * 100) / 100;

export default function Billing() {

    const toast = useToast();
    const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity, setQuantity } = useCart();
    const { user, term, shopName, formatMoney, showField, fields } = useBusiness();

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    const [discountValue, setDiscountValue] = useState("");
    const [discountMode, setDiscountMode] = useState("amount"); // "amount" | "percent"
    const [applyGst, setApplyGst] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [cashReceived, setCashReceived] = useState("");

    const [loading, setLoading] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);

    const upiId = user?.upiId;

    const totals = useMemo(() => {
        const subtotal = round2(
            cart.reduce((sum, item) => sum + Number(item.sellingPrice || 0) * Number(item.quantity), 0)
        );

        const raw = Number(discountValue) || 0;
        const discount = round2(
            Math.min(subtotal, discountMode === "percent" ? (subtotal * Math.min(raw, 100)) / 100 : raw)
        );

        // GST added on top, per item, from each item's own rate — pro-rated
        // after the bill-level discount.
        const ratio = subtotal > 0 ? (subtotal - discount) / subtotal : 0;
        const tax = applyGst
            ? round2(
                cart.reduce(
                    (sum, item) =>
                        sum + Number(item.sellingPrice || 0) * Number(item.quantity) * ratio * (Number(item.taxRate || 0) / 100),
                    0
                )
            )
            : 0;

        const grandTotal = round2(subtotal - discount + tax);
        const units = cart.reduce((sum, item) => sum + Number(item.quantity), 0);

        return { subtotal, discount, tax, grandTotal, units };
    }, [cart, discountValue, discountMode, applyGst]);

    const change = paymentMethod === "Cash" && Number(cashReceived) > 0
        ? round2(Number(cashReceived) - totals.grandTotal)
        : null;

    const hasTaxedItems = cart.some((item) => Number(item.taxRate) > 0);

    const upiUrl = upiId
        ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shopName)}&am=${totals.grandTotal.toFixed(2)}&cu=INR`
        : "";

    const handleCreateOrder = async () => {
        if (!cart.length) {
            toast.warning("Add at least one item to the bill");
            return;
        }

        if (customerPhone && !/^\d{10}$/.test(customerPhone)) {
            toast.warning("Mobile number should be 10 digits, or leave it blank");
            return;
        }

        if (change !== null && change < 0) {
            toast.warning(`Cash received is ${formatMoney(-change, { decimals: 2 })} short`);
            return;
        }

        try {
            setLoading(true);

            const result = await createOrder({
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                items: cart.map((item) => ({ productId: item._id, quantity: Number(item.quantity) })),
                discount: totals.discount,
                tax: totals.tax,
                paymentMethod
            });

            setCreatedOrder(result.order);
            clearCart();
            setCustomerName("");
            setCustomerPhone("");
            setDiscountValue("");
            setCashReceived("");
            toast.success(`Bill ${result.order.invoiceNumber} saved`, { title: "Sale complete" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not save the bill");
        } finally {
            setLoading(false);
        }
    };

    if (createdOrder) {
        return (
            <div className="space-y-6">
                <PageHeader icon={CheckCircle2} title="Sale complete" subtitle={`Invoice ${createdOrder.invoiceNumber}`} />
                <Invoice order={createdOrder} onNewBill={() => setCreatedOrder(null)} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                icon={ReceiptText}
                title="New bill"
                subtitle="Scan or search to add items, then take payment"
                actions={
                    cart.length > 0 && (
                        <Button variant="ghost" icon={Trash2} onClick={clearCart}>
                            Clear bill
                        </Button>
                    )
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">

                {/* ---------------- Left: items ---------------- */}
                <div className="space-y-4 min-w-0">
                    <ProductSearch />

                    <Card padded={false}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                            <h2 className="font-semibold text-heading">
                                Items <span className="text-muted font-normal">({cart.length})</span>
                            </h2>
                            <span className="text-xs text-muted tabular">{totals.units} units</span>
                        </div>

                        {cart.length === 0 ? (
                            <EmptyState
                                icon={ShoppingCart}
                                title="Bill is empty"
                                message={`Scan a barcode or search above to add ${term.itemsLower}. Press / to jump to search.`}
                            />
                        ) : (
                            <ul className="divide-y divide-line">
                                {cart.map((item, index) => {
                                    const lineTotal = Number(item.sellingPrice || 0) * Number(item.quantity);
                                    const atMax = Number(item.quantity) >= Number(item.stock);
                                    return (
                                        <li key={item._id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 px-5 py-3.5">
                                            <span className="hidden sm:grid place-items-center h-7 w-7 shrink-0 rounded-md bg-surface-hover text-xs font-semibold text-muted tabular">
                                                {index + 1}
                                            </span>

                                            <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                                                <p className="font-semibold text-heading truncate">{item.productName}</p>
                                                <p className="text-xs text-muted tabular">
                                                    {formatMoney(item.sellingPrice, { decimals: 2 })} / {item.unit || "unit"}
                                                    {applyGst && Number(item.taxRate) > 0 && ` · GST ${item.taxRate}%`}
                                                    {atMax && <span className="text-warning font-medium"> · max stock</span>}
                                                </p>
                                            </div>

                                            <div className="inline-flex items-center rounded-lg border border-line bg-surface">
                                                <button
                                                    type="button"
                                                    onClick={() => decreaseQuantity(item._id)}
                                                    disabled={Number(item.quantity) <= 1}
                                                    className="grid place-items-center h-9 w-9 text-muted hover:text-heading disabled:opacity-40"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="any"
                                                    value={item.quantity}
                                                    onChange={(e) => setQuantity(item._id, e.target.value)}
                                                    className="w-14 h-9 bg-transparent text-center text-sm font-semibold text-heading tabular focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                    aria-label={`Quantity of ${item.productName}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => increaseQuantity(item._id)}
                                                    disabled={atMax}
                                                    className="grid place-items-center h-9 w-9 text-muted hover:text-heading disabled:opacity-40"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            <span className="w-28 text-right font-bold text-heading tabular ml-auto sm:ml-0">
                                                {formatMoney(lineTotal, { decimals: 2 })}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item._id)}
                                                className="grid place-items-center h-9 w-9 shrink-0 rounded-lg text-faint hover:bg-danger/10 hover:text-danger transition-colors"
                                                aria-label={`Remove ${item.productName}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>

                    <Card>
                        <h2 className="font-semibold text-heading">Customer <span className="text-xs font-normal text-muted">— optional</span></h2>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Name"
                                icon={User}
                                placeholder="Walk-in customer"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                            <Input
                                label="Mobile"
                                icon={Phone}
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="For WhatsApp invoice"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                            />
                        </div>
                    </Card>
                </div>

                {/* ---------------- Right: summary + payment ---------------- */}
                <div className="xl:sticky xl:top-4 space-y-4">
                    <Card>
                        <h2 className="font-semibold text-heading">Summary</h2>

                        <dl className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted">Subtotal</dt>
                                <dd className="font-semibold text-heading tabular">{formatMoney(totals.subtotal, { decimals: 2 })}</dd>
                            </div>

                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-muted">Discount</dt>
                                    <div className="flex items-center gap-2">
                                        <div className="inline-flex rounded-lg border border-line p-0.5 bg-surface-muted">
                                            {[
                                                { id: "amount", icon: IndianRupee, label: "Amount" },
                                                { id: "percent", icon: Percent, label: "Percent" }
                                            ].map(({ id, icon: Icon, label }) => (
                                                <button
                                                    key={id}
                                                    type="button"
                                                    onClick={() => setDiscountMode(id)}
                                                    className={`grid place-items-center h-7 w-7 rounded-md transition-colors ${discountMode === id ? "bg-surface text-primary shadow-xs" : "text-faint hover:text-heading"}`}
                                                    aria-label={`Discount as ${label}`}
                                                    aria-pressed={discountMode === id}
                                                >
                                                    <Icon className="h-3.5 w-3.5" />
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            value={discountValue}
                                            onChange={(e) => setDiscountValue(e.target.value)}
                                            placeholder="0"
                                            className="w-24 h-9 rounded-lg border border-line bg-surface px-2.5 text-right text-sm font-semibold text-heading tabular focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            aria-label="Discount"
                                        />
                                    </div>
                                </div>
                                {totals.discount > 0 && (
                                    <p className="mt-1 text-right text-xs font-semibold text-success tabular">
                                        − {formatMoney(totals.discount, { decimals: 2 })}
                                    </p>
                                )}
                            </div>

                            {showField(fields.TAX) && (
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-muted cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applyGst}
                                            onChange={(e) => setApplyGst(e.target.checked)}
                                            className="h-4 w-4"
                                            disabled={!hasTaxedItems}
                                        />
                                        Add GST
                                        {!hasTaxedItems && cart.length > 0 && <span className="text-[11px] text-faint">(no rates set)</span>}
                                    </label>
                                    <dd className="font-semibold text-heading tabular">
                                        {totals.tax > 0 ? `+ ${formatMoney(totals.tax, { decimals: 2 })}` : "—"}
                                    </dd>
                                </div>
                            )}

                            <div className="flex items-baseline justify-between pt-4 border-t border-line">
                                <dt className="font-semibold text-heading">Total</dt>
                                <dd className="text-3xl font-extrabold tracking-tight text-heading tabular">
                                    {formatMoney(totals.grandTotal, { decimals: 2 })}
                                </dd>
                            </div>
                        </dl>
                    </Card>

                    <Card>
                        <h2 className="font-semibold text-heading">Payment</h2>

                        <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
                            {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => {
                                const selected = paymentMethod === id;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        role="radio"
                                        aria-checked={selected}
                                        onClick={() => setPaymentMethod(id)}
                                        className={[
                                            "flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-xs font-semibold transition-all",
                                            selected
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-line text-muted hover:border-line-strong hover:text-heading"
                                        ].join(" ")}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4">
                            {paymentMethod === "Cash" && (
                                <div className="space-y-3">
                                    <Input
                                        label="Cash received"
                                        type="number"
                                        min="0"
                                        icon={IndianRupee}
                                        placeholder={totals.grandTotal ? totals.grandTotal.toFixed(2) : "0.00"}
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value)}
                                    />
                                    {change !== null && (
                                        <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${change >= 0 ? "bg-success/10" : "bg-danger/10"}`}>
                                            <span className={`text-sm font-medium ${change >= 0 ? "text-success" : "text-danger"}`}>
                                                {change >= 0 ? "Return change" : "Short by"}
                                            </span>
                                            <span className={`text-lg font-bold tabular ${change >= 0 ? "text-success" : "text-danger"}`}>
                                                {formatMoney(Math.abs(change), { decimals: 2 })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {paymentMethod === "UPI" && (
                                upiId ? (
                                    <div className="flex flex-col items-center rounded-xl border border-line bg-white p-4">
                                        <QRCodeSVG value={upiUrl} size={184} />
                                        <p className="mt-3 text-lg font-bold text-slate-900 tabular">
                                            {formatMoney(totals.grandTotal, { decimals: 2 })}
                                        </p>
                                        <p className="text-xs text-slate-500">{upiId}</p>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
                                        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-heading">Add your UPI ID to show a QR</p>
                                            <p className="text-muted mt-0.5">
                                                Set it once in{" "}
                                                <Link to="/settings" className="font-semibold text-primary hover:underline">Settings → Business</Link>.
                                                You can still record this sale as UPI.
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}

                            {paymentMethod === "Card" && (
                                <p className="rounded-xl bg-surface-muted border border-line px-4 py-3 text-sm text-muted">
                                    Take the payment on your card machine, then save the bill.
                                </p>
                            )}
                        </div>

                        <Button
                            size="lg"
                            fullWidth
                            className="mt-5 h-14 text-base"
                            icon={CheckCircle2}
                            loading={loading}
                            disabled={!cart.length}
                            onClick={handleCreateOrder}
                        >
                            {cart.length ? `Save bill · ${formatMoney(totals.grandTotal, { decimals: 2 })}` : "Save bill"}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
