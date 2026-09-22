import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    NotebookPen,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    X,
    Loader2,
    Pencil,
    Trash2,
    Printer,
    Banknote,
    Smartphone,
    CreditCard,
    IndianRupee,
    Package,
    ReceiptText,
    Sigma
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Card, { CardHeader } from "../components/ui/Card";
import Button, { IconButton } from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import Modal, { ConfirmDialog } from "../components/ui/Modal";
import { Input } from "../components/ui/Field";
import { EmptyState, SkeletonRows } from "../components/ui/State";
import { useToast } from "../components/ui/Toast";

import { getDayNote, addNoteEntry, updateNoteEntry, deleteNoteEntry } from "../services/noteService";
import { searchProducts } from "../services/productService";
import { useBusiness } from "../context/BusinessContext";

const PAYMENTS = [
    { id: "Cash", icon: Banknote },
    { id: "UPI", icon: Smartphone },
    { id: "Card", icon: CreditCard }
];

const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const toInputDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function PaymentPicker({ value, onChange, size = "md" }) {
    return (
        <div className="inline-flex rounded-lg border border-line bg-surface-muted p-0.5" role="radiogroup" aria-label="Payment method">
            {PAYMENTS.map(({ id, icon: Icon }) => (
                <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={value === id}
                    onClick={() => onChange(id)}
                    className={[
                        "flex items-center gap-1.5 rounded-md font-semibold transition-colors",
                        size === "sm" ? "h-8 px-2.5 text-xs" : "h-10 px-3 text-sm",
                        value === id ? "bg-surface text-primary shadow-xs" : "text-muted hover:text-heading"
                    ].join(" ")}
                >
                    <Icon className="h-4 w-4" />
                    {id}
                </button>
            ))}
        </div>
    );
}

/**
 * Quick sales note: jot down counter sales without making a bill. Every line
 * is a real sale — stock comes out of the product immediately and the day's
 * total shows up in the dashboard and reports.
 */
export default function SalesNote() {

    const toast = useToast();
    const { term, formatMoney, formatNumber, getStockStatus, shopName, lowStockThreshold } = useBusiness();

    const [day, setDay] = useState(() => new Date());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // quick-add form
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState("1");
    const [price, setPrice] = useState("");
    const [payment, setPayment] = useState("Cash");
    const [adding, setAdding] = useState(false);

    const searchRef = useRef(null);
    const qtyRef = useRef(null);

    // edit / delete
    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({ quantity: "", price: "", paymentMethod: "Cash" });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    const isToday = sameDay(day, new Date());

    const load = useCallback(async (target) => {
        try {
            setLoading(true);
            setData(await getDayNote(target));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Could not load the note");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        load(day);
    }, [day, load]);

    // ---------------- product search ----------------
    useEffect(() => {
        const q = search.trim();
        if (!q || product) {
            setResults([]);
            setOpen(false);
            return undefined;
        }

        const timer = setTimeout(async () => {
            try {
                setSearching(true);
                const res = await searchProducts(q);
                setResults(res.products || []);
                setActive(0);
                setOpen(true);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [search, product]);

    const pick = (item) => {
        if (!item) return;
        if (Number(item.stock) <= 0) {
            toast.warning(`${item.productName} is out of stock`);
            return;
        }
        setProduct(item);
        setSearch(item.productName);
        setPrice(String(item.sellingPrice ?? ""));
        setQuantity("1");
        setOpen(false);
        setTimeout(() => qtyRef.current?.select(), 0);
    };

    const resetForm = () => {
        setProduct(null);
        setSearch("");
        setQuantity("1");
        setPrice("");
        setTimeout(() => searchRef.current?.focus(), 0);
    };

    const onSearchKey = (e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
        else if (e.key === "Enter") {
            e.preventDefault();
            const q = search.trim().toLowerCase();
            pick(results.find((p) => p.barcode?.toLowerCase() === q || p.sku?.toLowerCase() === q) || results[active]);
        } else if (e.key === "Escape") setOpen(false);
    };

    const qty = Number(quantity);
    const unitPrice = price === "" ? Number(product?.sellingPrice || 0) : Number(price);
    const lineTotal = product && qty > 0 ? qty * unitPrice : 0;
    const overStock = product && qty > Number(product.stock);

    const add = async (e) => {
        e?.preventDefault();

        if (!product) {
            toast.warning(`Pick a ${term.itemLower} first`);
            searchRef.current?.focus();
            return;
        }
        if (!(qty > 0)) {
            toast.warning("Enter a quantity");
            return;
        }
        if (overStock) {
            toast.warning(`Only ${product.stock} ${product.unit} in stock`);
            return;
        }

        try {
            setAdding(true);
            const res = await addNoteEntry({ productId: product._id, quantity: qty, price: unitPrice, paymentMethod: payment });

            setData((current) => current && {
                ...current,
                entries: [res.entry, ...current.entries]
            });
            load(day); // refresh the summary totals

            if (res.stock !== undefined && res.stock <= (product.lowStockThreshold ?? lowStockThreshold)) {
                toast.warning(`${product.productName}: only ${res.stock} ${product.unit} left`, { title: "Running low" });
            } else {
                toast.success(`${product.productName} × ${qty} noted`, { duration: 1500 });
            }

            resetForm();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Could not add");
        } finally {
            setAdding(false);
        }
    };

    // ---------------- edit / delete ----------------
    const openEdit = (entry) => {
        setEditing(entry);
        setEditForm({ quantity: String(entry.quantity), price: String(entry.price), paymentMethod: entry.paymentMethod });
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updateNoteEntry(editing._id, {
                quantity: Number(editForm.quantity),
                price: Number(editForm.price),
                paymentMethod: editForm.paymentMethod
            });
            toast.success("Entry updated · stock adjusted");
            setEditing(null);
            load(day);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Could not update");
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        try {
            setDeleteBusy(true);
            await deleteNoteEntry(deleting._id);
            toast.success(`Removed · ${deleting.quantity} ${deleting.unit} back in stock`);
            setDeleting(null);
            load(day);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Could not remove");
        } finally {
            setDeleteBusy(false);
        }
    };

    // ---------------- derived ----------------
    const summary = data?.summary;
    const entries = data?.entries || [];
    const totalUnits = useMemo(
        () => (summary?.byProduct || []).reduce((sum, row) => sum + Number(row.quantity || 0), 0),
        [summary]
    );

    const shiftDay = (delta) => {
        const next = new Date(day);
        next.setDate(next.getDate() + delta);
        if (next > new Date()) return;
        setDay(next);
    };

    const dayLabel = isToday
        ? "Today"
        : day.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

    return (
        <div className="space-y-6">
            <PageHeader
                icon={NotebookPen}
                title="Sales note"
                subtitle="Jot down quick sales without making a bill — stock updates instantly"
                actions={
                    <>
                        <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
                            <IconButton icon={ChevronLeft} label="Previous day" size="sm" onClick={() => shiftDay(-1)} />
                            <input
                                type="date"
                                value={toInputDate(day)}
                                max={toInputDate(new Date())}
                                onChange={(e) => e.target.value && setDay(new Date(`${e.target.value}T12:00:00`))}
                                className="h-8 px-2 bg-transparent text-sm font-semibold text-heading focus:outline-none"
                                aria-label="Note date"
                            />
                            <IconButton icon={ChevronRight} label="Next day" size="sm" disabled={isToday} onClick={() => shiftDay(1)} />
                        </div>
                        {!isToday && <Button variant="ghost" onClick={() => setDay(new Date())}>Today</Button>}
                        <Button variant="secondary" icon={Printer} onClick={() => window.print()} disabled={!entries.length}>
                            Print summary
                        </Button>
                    </>
                }
            />

            {/* ---------------- Quick add ---------------- */}
            {isToday ? (
                <Card className="no-print">
                    <form onSubmit={add} className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_110px_130px_auto_auto] gap-3 items-end">
                        <div className="relative">
                            <label className="block text-xs font-semibold text-muted mb-1.5">{term.item}</label>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                <input
                                    ref={searchRef}
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setProduct(null); }}
                                    onKeyDown={onSearchKey}
                                    onFocus={() => results.length && !product && setOpen(true)}
                                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                                    placeholder={`Scan or type ${term.itemLower} name…`}
                                    className="w-full h-11 pl-9 pr-9 rounded-lg border border-line bg-surface text-sm text-heading focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    autoComplete="off"
                                    autoFocus
                                    aria-label={`Search ${term.itemsLower}`}
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                    {searching ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-faint" />
                                    ) : search && (
                                        <button type="button" onClick={resetForm} className="grid place-items-center h-7 w-7 rounded-md text-faint hover:text-heading" aria-label="Clear">
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </span>
                            </div>

                            {product && (
                                <p className="mt-1.5 text-xs text-muted">
                                    <Badge size="sm" tone={getStockStatus(product).tone}>{product.stock} {product.unit} in stock</Badge>
                                    <span className="ml-2">MRP {formatMoney(product.mrp || product.sellingPrice, { decimals: 2 })}</span>
                                </p>
                            )}

                            {open && !product && search.trim() && (
                                <ul className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-y-auto thin-scrollbar rounded-xl border border-line bg-surface shadow-lg divide-y divide-line">
                                    {results.length === 0 && !searching ? (
                                        <li className="px-4 py-4 text-sm text-muted text-center">No {term.itemsLower} match</li>
                                    ) : results.map((item, index) => {
                                        const status = getStockStatus(item);
                                        return (
                                            <li key={item._id}>
                                                <button
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onMouseEnter={() => setActive(index)}
                                                    onClick={() => pick(item)}
                                                    disabled={status.key === "out"}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${index === active ? "bg-primary/5" : ""} disabled:opacity-50`}
                                                >
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-sm font-semibold text-heading truncate">{item.productName}</span>
                                                        <span className="block text-xs text-muted truncate">{[item.brand, item.variant].filter(Boolean).join(" · ") || "—"}</span>
                                                    </span>
                                                    <Badge size="sm" tone={status.tone}>{item.stock} {item.unit}</Badge>
                                                    <span className="w-20 text-right text-sm font-semibold text-heading tabular">{formatMoney(item.sellingPrice, { decimals: 2 })}</span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        <Input
                            ref={qtyRef}
                            label="Qty"
                            type="number"
                            min="0"
                            step="any"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            suffix={product?.unit}
                            error={overStock ? "Over stock" : undefined}
                            disabled={!product}
                        />

                        <Input
                            label="Price each"
                            type="number"
                            min="0"
                            step="0.01"
                            icon={IndianRupee}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            disabled={!product}
                        />

                        <div>
                            <p className="block text-xs font-semibold text-muted mb-1.5">Paid by</p>
                            <PaymentPicker value={payment} onChange={setPayment} />
                        </div>

                        <Button type="submit" size="lg" icon={Plus} loading={adding} disabled={!product || overStock} className="h-11">
                            {lineTotal ? `Add · ${formatMoney(lineTotal, { decimals: 2 })}` : "Add"}
                        </Button>
                    </form>
                    <p className="mt-3 text-[11px] text-faint">
                        Tip: scan a barcode or type and press Enter, set the qty, press Enter again. Payment choice stays for the next line.
                    </p>
                </Card>
            ) : (
                <Card className="no-print flex items-center justify-between gap-4 bg-surface-muted">
                    <p className="text-sm text-muted">
                        You're viewing a past day. New lines can only be added to today's note; you can still correct or remove these.
                    </p>
                    <Button variant="soft" onClick={() => setDay(new Date())}>Go to today</Button>
                </Card>
            )}

            {/* ---------------- End-of-day summary (printable) ---------------- */}
            <div id="invoice" className="space-y-6">
                <div className="hidden print:block">
                    <h1 className="text-xl font-bold">{shopName} — Sales note</h1>
                    <p className="text-sm">{day.toLocaleDateString("en-IN", { dateStyle: "full" })}</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={IndianRupee} label={`Noted sales · ${dayLabel.toLowerCase()}`} value={formatMoney(summary?.noteTotal, { decimals: 2 })} loading={loading} />
                    <StatCard icon={ReceiptText} tone="info" label="Lines noted" value={formatNumber(summary?.noteEntries)} hint={`${formatNumber(totalUnits)} units`} loading={loading} />
                    <StatCard icon={Package} tone="neutral" label="Billed sales (Billing page)" value={formatMoney(summary?.billedTotal, { decimals: 2 })} hint={`${formatNumber(summary?.billedCount)} bills`} loading={loading} />
                    <StatCard icon={Sigma} tone="success" label="Day total (note + bills)" value={formatMoney(summary?.dayTotal, { decimals: 2 })} loading={loading} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
                    {/* Entries */}
                    <Card padded={false}>
                        <div className="px-5 pt-5 pb-4">
                            <CardHeader
                                icon={NotebookPen}
                                title={`${dayLabel}'s note`}
                                subtitle={loading ? "Loading…" : `${formatNumber(entries.length)} line${entries.length === 1 ? "" : "s"}`}
                            />
                        </div>

                        {loading && !data ? (
                            <SkeletonRows rows={5} columns={4} />
                        ) : entries.length === 0 ? (
                            <EmptyState
                                icon={NotebookPen}
                                title={isToday ? "Nothing noted yet today" : "Nothing noted on this day"}
                                message={isToday ? `Add ${term.itemsLower} above as you sell them. Stock updates straight away.` : undefined}
                                className="border-t border-line"
                            />
                        ) : (
                            <div className="border-t border-line overflow-x-auto thin-scrollbar">
                                <table className="w-full min-w-[620px] text-sm">
                                    <thead>
                                        <tr className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                                            <th className="py-3 pl-5 pr-3">Time</th>
                                            <th className="py-3 px-3">{term.item}</th>
                                            <th className="py-3 px-3 text-right">Qty × price</th>
                                            <th className="py-3 px-3 text-right">Total</th>
                                            <th className="py-3 px-3">Paid</th>
                                            <th className="py-3 pl-3 pr-5 text-right no-print">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {entries.map((entry) => (
                                            <tr key={entry._id} className="hover:bg-surface-hover">
                                                <td className="py-3 pl-5 pr-3 text-muted tabular whitespace-nowrap">
                                                    {new Date(entry.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                                                </td>
                                                <td className="py-3 px-3 font-semibold text-heading">{entry.productName}</td>
                                                <td className="py-3 px-3 text-right text-body tabular whitespace-nowrap">
                                                    {formatNumber(entry.quantity)} {entry.unit} × {formatMoney(entry.price, { decimals: 2 })}
                                                </td>
                                                <td className="py-3 px-3 text-right font-bold text-heading tabular">{formatMoney(entry.total, { decimals: 2 })}</td>
                                                <td className="py-3 px-3"><Badge size="sm">{entry.paymentMethod}</Badge></td>
                                                <td className="py-3 pl-3 pr-5 no-print">
                                                    <div className="flex justify-end gap-1">
                                                        <IconButton icon={Pencil} label="Edit" size="sm" onClick={() => openEdit(entry)} />
                                                        <IconButton icon={Trash2} label="Remove" size="sm" className="hover:!bg-danger/10 hover:!text-danger" onClick={() => setDeleting(entry)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    {/* Day summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader title="By payment" subtitle="Noted sales only" />
                            <ul className="mt-4 space-y-2">
                                {PAYMENTS.map(({ id, icon: Icon }) => {
                                    const amount = summary?.byPayment?.[id] || 0;
                                    const share = summary?.noteTotal ? (amount / summary.noteTotal) * 100 : 0;
                                    return (
                                        <li key={id}>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 font-medium text-heading"><Icon className="h-4 w-4 text-muted" />{id}</span>
                                                <span className="font-semibold text-heading tabular">{formatMoney(amount, { decimals: 2 })}</span>
                                            </div>
                                            <div className="mt-1.5 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Card>

                        <Card padded={false}>
                            <div className="p-5 pb-3">
                                <CardHeader title={`By ${term.itemLower}`} subtitle="What went out today" />
                            </div>
                            {(summary?.byProduct || []).length === 0 ? (
                                <p className="px-5 pb-5 text-sm text-muted">No sales noted.</p>
                            ) : (
                                <ul className="divide-y divide-line border-t border-line">
                                    {summary.byProduct.map((row) => (
                                        <li key={row.productId} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                                            <span className="min-w-0">
                                                <span className="block font-medium text-heading truncate">{row.productName}</span>
                                                <span className="block text-xs text-muted tabular">{formatNumber(row.quantity)} {row.unit}</span>
                                            </span>
                                            <span className="font-semibold text-heading tabular">{formatMoney(row.total, { decimals: 2 })}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* ---------------- Edit ---------------- */}
            <Modal
                open={Boolean(editing)}
                onClose={() => !saving && setEditing(null)}
                size="sm"
                icon={Pencil}
                title={`Edit ${editing?.productName}`}
                subtitle="Stock is adjusted by the difference"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
                        <Button type="submit" form="note-edit-form" loading={saving}>Save</Button>
                    </>
                }
            >
                <form id="note-edit-form" onSubmit={saveEdit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Quantity" type="number" min="0" step="any" suffix={editing?.unit}
                            value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} required />
                        <Input label="Price each" type="number" min="0" step="0.01" icon={IndianRupee}
                            value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required />
                    </div>
                    <div>
                        <p className="block text-xs font-semibold text-muted mb-1.5">Paid by</p>
                        <PaymentPicker value={editForm.paymentMethod} onChange={(v) => setEditForm({ ...editForm, paymentMethod: v })} />
                    </div>
                    <p className="text-sm text-muted">
                        New total: <span className="font-bold text-heading tabular">{formatMoney((Number(editForm.quantity) || 0) * (Number(editForm.price) || 0), { decimals: 2 })}</span>
                    </p>
                </form>
            </Modal>

            <ConfirmDialog
                open={Boolean(deleting)}
                loading={deleteBusy}
                onCancel={() => setDeleting(null)}
                onConfirm={confirmDelete}
                confirmLabel="Remove"
                title={`Remove ${deleting?.productName}?`}
                message={`${deleting?.quantity} ${deleting?.unit} will be put back into stock and ${formatMoney(deleting?.total, { decimals: 2 })} removed from the day's sales.`}
            />
        </div>
    );
}
