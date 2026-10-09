import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    BookUser, ArrowLeft, HandCoins, Wallet, FileText, Pencil,
    IndianRupee, TrendingUp, TrendingDown, Undo2, Download, BellRing
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Button, { IconButton } from "../components/ui/Button";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import { EmptyState, ErrorState, SkeletonRows, Spinner } from "../components/ui/State";
import { useToast } from "../components/ui/Toast";
import { Input, Select } from "../components/ui/Field";
import Pagination from "../components/pagination";

import CustomerModal from "../components/udhar/CustomerModal";
import CreditSaleModal from "../components/udhar/CreditSaleModal";
import PaymentModal from "../components/udhar/PaymentModal";
import CancelEntryModal from "../components/udhar/CancelEntryModal";
import LedgerStatement from "../components/udhar/LedgerStatement";
import ReminderModal from "../components/udhar/ReminderModal";

import {
    getCreditCustomer,
    getLedger,
    reverseTransaction,
    updateCreditCustomer,
    exportStatementCsv
} from "../services/creditService";
import { useBusiness } from "../context/BusinessContext";

const PAGE_SIZE = 25;

const TYPE_LABEL = {
    CREDIT_SALE: { text: "Udhar given", tone: "warning" },
    PAYMENT: { text: "Payment", tone: "success" },
    ADJUSTMENT: { text: "Adjustment", tone: "info" }
};

const TYPE_FILTERS = [
    { value: "", label: "All entries" },
    { value: "CREDIT_SALE", label: "Udhar given" },
    { value: "PAYMENT", label: "Payments" },
    { value: "ADJUSTMENT", label: "Adjustments" }
];

const METHOD_FILTERS = [
    { value: "", label: "Any method" },
    { value: "Cash", label: "Cash" },
    { value: "UPI", label: "UPI" },
    { value: "Card", label: "Card" }
];

const formatDay = (value) =>
    new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/** One customer's khata: the running ledger, and everything you can do to it. */
export default function UdharCustomer() {

    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { formatMoney, formatNumber } = useBusiness();

    const [customer, setCustomer] = useState(null);
    const [statement, setStatement] = useState(null);

    const [loading, setLoading] = useState(true);
    const [ledgerLoading, setLedgerLoading] = useState(false);
    const [error, setError] = useState("");

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [type, setType] = useState("");
    const [method, setMethod] = useState("");
    const [page, setPage] = useState(1);
    const [exporting, setExporting] = useState(false);
    const [showReminder, setShowReminder] = useState(false);

    const [showSale, setShowSale] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [showStatement, setShowStatement] = useState(false);
    const [cancelling, setCancelling] = useState(null);
    const [cancelBusy, setCancelBusy] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ customerName: "", phone: "", address: "", note: "" });
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const loadCustomer = useCallback(async () => {
        try {
            setError("");

            const data = await getCreditCustomer(id);

            setCustomer(data.customer);

        } catch (err) {
            if (err?.response?.status === 404) {
                setError("This customer is not in your khata.");
            } else {
                setError(err?.response?.data?.message || "Could not load this customer");
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    const loadLedger = useCallback(async () => {
        try {
            setLedgerLoading(true);

            const data = await getLedger({
                customerId: id,
                ...(from ? { from } : {}),
                // `to` is exclusive on the server, so include the chosen day.
                ...(to ? { to: new Date(new Date(`${to}T00:00:00`).getTime() + 86400000).toISOString() } : {}),
                ...(type ? { type } : {}),
                ...(method ? { paymentMethod: method } : {}),
                page,
                limit: PAGE_SIZE,
                order: "asc"
            });

            setStatement(data);

        } catch (err) {
            if (err?.response?.status !== 404) {
                toast.error(err?.response?.data?.message || "Could not load the ledger");
            }
        } finally {
            setLedgerLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, from, to, type, method, page]);

    useEffect(() => {
        loadCustomer();
    }, [loadCustomer]);

    useEffect(() => {
        if (!error) loadLedger();
    }, [loadLedger, error]);

    /** After any write: the balance and the ledger both move. */
    const refresh = async () => {
        await Promise.all([loadCustomer(), loadLedger()]);
    };

    const onSaleSaved = async (data) => {
        setShowSale(false);
        await refresh();

        toast.success(
            `${formatMoney(data.transaction.amount, { decimals: 2 })} added to ${customer.customerName}'s khata`,
            { title: data.duplicate ? "Already recorded" : "Udhar given" }
        );
    };

    const onPaymentSaved = async (data) => {
        setShowPayment(false);
        await refresh();

        if (data.duplicate) {
            toast.info("That payment was already recorded");
            return;
        }

        toast.success(
            data.settled
                ? `${customer.customerName}'s khata is now clear`
                : `${formatMoney(data.balanceAfter, { decimals: 2 })} still outstanding`,
            { title: `${formatMoney(data.transaction.amount, { decimals: 2 })} received` }
        );
    };

    const confirmCancel = async (reason) => {
        try {
            setCancelBusy(true);

            const data = await reverseTransaction(cancelling._id, reason);

            setCancelling(null);
            await refresh();

            toast.success(
                data.stockRestored
                    ? "Entry cancelled and the stock put back"
                    : "Entry cancelled",
                { title: "Done" }
            );

        } catch (err) {
            toast.error(err?.response?.data?.message || "Could not cancel this entry");
        } finally {
            setCancelBusy(false);
        }
    };

    const downloadCsv = async () => {
        if (exporting) return;

        try {
            setExporting(true);

            // The file is built by the server from the saved ledger, so it
            // always matches what the statement shows.
            const { rows, truncated } = await exportStatementCsv({
                customerId: id,
                from: from || undefined,
                to: to ? new Date(new Date(`${to}T00:00:00`).getTime() + 86400000).toISOString() : undefined,
                customerName: customer.customerName
            });

            toast.success(
                truncated
                    ? `${rows} entries exported — narrow the dates to get the rest`
                    : `${rows} entries exported`,
                { title: "Statement downloaded" }
            );

        } catch (err) {
            // A blob response hides the JSON message, so read it back out.
            let message = "Could not export the statement";

            try {
                const text = await err?.response?.data?.text?.();
                if (text) message = JSON.parse(text).message || message;
            } catch {
                message = err?.response?.data?.message || message;
            }

            toast.error(message);
        } finally {
            setExporting(false);
        }
    };

    const openForm = () => {
        setFormError("");
        setFormData({
            customerName: customer.customerName || "",
            phone: customer.phone || "",
            address: customer.address || "",
            note: customer.note || ""
        });
        setShowForm(true);
    };

    const submitForm = async (event) => {
        event.preventDefault();

        if (saving) return;

        try {
            setSaving(true);
            setFormError("");

            await updateCreditCustomer(id, formData);
            await loadCustomer();

            setShowForm(false);
            toast.success("Customer updated");

        } catch (err) {
            setFormError(err?.response?.data?.message || "Could not save this customer");
        } finally {
            setSaving(false);
        }
    };

    const money = (value) => formatMoney(value, { decimals: 2 });

    /** A running balance can go below zero when a customer is in credit. */
    const balance = (value) =>
        Number(value) < 0 ? `− ${money(Math.abs(value))}` : money(value);

    if (loading) {
        return <Spinner label="Opening the khata…" className="min-h-[60vh]" />;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader icon={BookUser} title="Udhar Khata" />
                <ErrorState message={error} onRetry={loadCustomer} />
                <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate("/udhar")}>
                    Back to the khata
                </Button>
            </div>
        );
    }

    // The printable sheet replaces the page, like the invoice after a sale.
    if (showStatement && statement) {
        return (
            <div className="space-y-6">
                <PageHeader
                    breadcrumbs={false}
                    className="no-print"
                    icon={FileText}
                    title="Customer statement"
                    subtitle={customer.customerName}
                />

                <LedgerStatement
                    customer={customer}
                    statement={statement}
                    period={{ from, to }}
                    onClose={() => setShowStatement(false)}
                />
            </div>
        );
    }

    const outstanding = customer.outstanding || 0;

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumbs={false}
                icon={BookUser}
                title={customer.customerName}
                subtitle={
                    [customer.phone, customer.address].filter(Boolean).join(" · ") ||
                    "No contact details saved"
                }
                actions={
                    <>
                        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate("/udhar")}>
                            All customers
                        </Button>
                        <Button variant="secondary" icon={FileText} onClick={() => setShowStatement(true)}>
                            Statement
                        </Button>
                        <Button
                            variant="secondary"
                            icon={BellRing}
                            onClick={() => setShowReminder(true)}
                            disabled={outstanding <= 0}
                        >
                            Remind
                        </Button>
                        <Button variant="secondary" icon={HandCoins} onClick={() => setShowSale(true)}>
                            Give udhar
                        </Button>
                        <Button variant="success" icon={Wallet} onClick={() => setShowPayment(true)} disabled={outstanding <= 0}>
                            Collect payment
                        </Button>
                    </>
                }
            />

            {/* Balance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    icon={IndianRupee}
                    label="Outstanding"
                    value={money(Math.abs(outstanding))}
                    hint={
                        outstanding > 0 ? "They owe you this"
                            : outstanding < 0 ? "Paid in advance"
                                : "All settled"
                    }
                    tone={outstanding > 0 ? "danger" : outstanding < 0 ? "info" : "success"}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Total udhar given"
                    value={money(customer.charged || 0)}
                    hint={`${formatNumber(customer.entryCount || 0)} entries in all`}
                    tone="warning"
                />
                <StatCard
                    icon={TrendingDown}
                    label="Paid & credited"
                    value={money(customer.paid || 0)}
                    hint={
                        customer.lastActivityAt
                            ? `Repayments and cancelled entries · last ${formatDay(customer.lastActivityAt)}`
                            : "No entries yet"
                    }
                    tone="success"
                />
            </div>

            {customer.note && (
                <Card className="flex items-start gap-3">
                    <Pencil className="h-4 w-4 shrink-0 mt-0.5 text-faint" aria-hidden="true" />
                    <p className="text-sm text-body">{customer.note}</p>
                    <IconButton icon={Pencil} label="Edit customer" size="sm" className="ml-auto" onClick={openForm} />
                </Card>
            )}

            {/* Ledger */}
            <Card padded={false}>
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-wrap items-end gap-3">
                        <Input
                            label="From"
                            type="date"
                            value={from}
                            max={to || undefined}
                            onChange={(event) => { setFrom(event.target.value); setPage(1); }}
                            className="w-full sm:w-40"
                        />
                        <Input
                            label="To"
                            type="date"
                            value={to}
                            min={from || undefined}
                            onChange={(event) => { setTo(event.target.value); setPage(1); }}
                            className="w-full sm:w-40"
                        />

                        <Select
                            label="Type"
                            options={TYPE_FILTERS}
                            value={type}
                            onChange={(event) => { setType(event.target.value); setPage(1); }}
                            className="w-full sm:w-44"
                        />

                        <Select
                            label="Paid by"
                            options={METHOD_FILTERS}
                            value={method}
                            onChange={(event) => { setMethod(event.target.value); setPage(1); }}
                            className="w-full sm:w-36"
                        />

                        {(from || to || type || method) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mb-0.5"
                                onClick={() => {
                                    setFrom(""); setTo(""); setType(""); setMethod(""); setPage(1);
                                }}
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:mb-0.5">
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={Download}
                            loading={exporting}
                            onClick={downloadCsv}
                        >
                            CSV
                        </Button>
                        <IconButton icon={Pencil} label="Edit customer" onClick={openForm} />
                    </div>
                </div>

                {statement && (from || to) && (
                    <p className="border-t border-line bg-surface-muted px-4 py-2 text-xs text-muted">
                        Opening balance for this period:{" "}
                        <span className="font-semibold text-heading tabular">
                            {money(statement.openingBalance)}
                        </span>
                    </p>
                )}

                <div className="border-t border-line">
                    {ledgerLoading && !statement ? (
                        <SkeletonRows rows={5} columns={5} />
                    ) : !statement || statement.transactions.length === 0 ? (
                        <EmptyState
                            icon={BookUser}
                            title={from || to ? "Nothing in these dates" : "No entries yet"}
                            message={
                                from || to
                                    ? "Try a wider date range."
                                    : "Record the first udhar for this customer and it will show up here."
                            }
                            action={
                                !from && !to && (
                                    <Button icon={HandCoins} onClick={() => setShowSale(true)}>Give udhar</Button>
                                )
                            }
                        />
                    ) : (
                        <>
                            {/* Desktop ledger */}
                            <div className="hidden md:block overflow-x-auto thin-scrollbar">
                                <table className="w-full min-w-[820px] text-sm">
                                    <thead>
                                        <tr className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                                            <th className="py-3 pl-4 pr-3">Date</th>
                                            <th className="py-3 px-3">Details</th>
                                            <th className="py-3 px-3 text-right">Udhar</th>
                                            <th className="py-3 px-3 text-right">Paid</th>
                                            <th className="py-3 px-3 text-right">Balance</th>
                                            <th className="py-3 pl-3 pr-4" />
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-line">
                                        {statement.transactions.map((row) => {
                                            const label = TYPE_LABEL[row.type] || TYPE_LABEL.ADJUSTMENT;

                                            return (
                                                <tr
                                                    key={row._id}
                                                    className={row.isReversed ? "opacity-55" : "hover:bg-surface-hover"}
                                                >
                                                    <td className="py-3 pl-4 pr-3 whitespace-nowrap text-body">
                                                        {formatDay(row.date)}
                                                    </td>

                                                    <td className="py-3 px-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Badge tone={label.tone} size="sm">{label.text}</Badge>

                                                            {row.isReversed && (
                                                                <Badge tone="neutral" size="sm">Cancelled</Badge>
                                                            )}

                                                            {row.reversalOf && (
                                                                <Badge tone="neutral" size="sm">Reversal</Badge>
                                                            )}

                                                            {row.paymentMethod && (
                                                                <span className="text-xs text-muted">{row.paymentMethod}</span>
                                                            )}
                                                        </div>

                                                        {(row.description || row.reason) && (
                                                            <p className="mt-1 text-xs text-muted">
                                                                {row.description || row.reason}
                                                            </p>
                                                        )}

                                                        {row.items?.length > 0 && (
                                                            <p className="mt-0.5 text-xs text-faint truncate max-w-md">
                                                                {row.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="py-3 px-3 text-right tabular text-heading">
                                                        {row.direction === "increase" ? money(row.amount) : "—"}
                                                    </td>

                                                    <td className="py-3 px-3 text-right tabular text-success">
                                                        {row.direction === "decrease" ? money(row.amount) : "—"}
                                                    </td>

                                                    <td className="py-3 px-3 text-right font-semibold tabular text-heading">
                                                        {money(row.runningBalance)}
                                                    </td>

                                                    <td className="py-3 pl-3 pr-4 text-right">
                                                        {!row.isReversed && !row.reversalOf && (
                                                            <IconButton
                                                                icon={Undo2}
                                                                label="Cancel this entry"
                                                                size="sm"
                                                                className="hover:!bg-danger/10 hover:!text-danger"
                                                                onClick={() => setCancelling(row)}
                                                            />
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile ledger */}
                            <ul className="md:hidden divide-y divide-line">
                                {statement.transactions.map((row) => {
                                    const label = TYPE_LABEL[row.type] || TYPE_LABEL.ADJUSTMENT;

                                    return (
                                        <li key={row._id} className={`p-4 ${row.isReversed ? "opacity-55" : ""}`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge tone={label.tone} size="sm">{label.text}</Badge>
                                                        {row.isReversed && <Badge tone="neutral" size="sm">Cancelled</Badge>}
                                                    </div>

                                                    <p className="mt-1 text-xs text-muted">
                                                        {formatDay(row.date)}
                                                        {row.paymentMethod ? ` · ${row.paymentMethod}` : ""}
                                                    </p>

                                                    {(row.description || row.reason) && (
                                                        <p className="mt-1 text-xs text-muted">
                                                            {row.description || row.reason}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <p
                                                        className={[
                                                            "font-bold tabular",
                                                            row.direction === "increase" ? "text-heading" : "text-success"
                                                        ].join(" ")}
                                                    >
                                                        {row.direction === "increase" ? "+" : "−"} {money(row.amount)}
                                                    </p>
                                                    <p className="text-[11px] text-muted tabular">
                                                        bal {balance(row.runningBalance)}
                                                    </p>
                                                </div>
                                            </div>

                                            {!row.isReversed && !row.reversalOf && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={Undo2}
                                                    className="mt-2 !px-2"
                                                    onClick={() => setCancelling(row)}
                                                >
                                                    Cancel entry
                                                </Button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                </div>

                {statement && statement.transactions.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted tabular">
                            {formatNumber(statement.pagination.total)} entries ·{" "}
                            {statement.summary.closingBalance < 0 ? "in advance" : "closing balance"}{" "}
                            <span className="font-semibold text-heading">
                                {money(Math.abs(statement.summary.closingBalance))}
                            </span>
                        </p>

                        <Pagination
                            currentPage={statement.pagination.page}
                            totalPages={statement.pagination.pages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </Card>

            {/* Quick actions on small screens */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
                <Button icon={HandCoins} fullWidth onClick={() => setShowSale(true)}>Give udhar</Button>
                <Button
                    variant="success"
                    icon={Wallet}
                    fullWidth
                    disabled={outstanding <= 0}
                    onClick={() => setShowPayment(true)}
                >
                    Collect
                </Button>
            </div>

            <CreditSaleModal
                show={showSale}
                customer={customer}
                onClose={() => setShowSale(false)}
                onSaved={onSaleSaved}
            />

            <PaymentModal
                show={showPayment}
                customer={customer}
                onClose={() => setShowPayment(false)}
                onSaved={onPaymentSaved}
            />

            <CancelEntryModal
                show={Boolean(cancelling)}
                entry={cancelling}
                loading={cancelBusy}
                onClose={() => setCancelling(null)}
                onConfirm={confirmCancel}
            />

            <ReminderModal
                show={showReminder}
                customer={customer}
                onClose={() => setShowReminder(false)}
            />

            <CustomerModal
                show={showForm}
                editing={customer}
                formData={formData}
                onChange={(event) =>
                    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
                }
                onSubmit={submitForm}
                onClose={() => setShowForm(false)}
                error={formError}
                loading={saving}
            />
        </div>
    );
}
