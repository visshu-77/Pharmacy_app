import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    BookUser, Plus, Search, IndianRupee, AlertTriangle,
    ChevronRight, Phone, Pencil, TrendingUp, TrendingDown, BellRing, History
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Button, { IconButton } from "../components/ui/Button";
import Card, { CardHeader } from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import { EmptyState, ErrorState, SkeletonRows } from "../components/ui/State";
import { useToast } from "../components/ui/Toast";
import Pagination from "../components/pagination";

import CustomerModal from "../components/udhar/CustomerModal";
import ReminderModal from "../components/udhar/ReminderModal";

import {
    getCreditCustomers,
    createCreditCustomer,
    updateCreditCustomer,
    getUdharSummary
} from "../services/creditService";
import { useBusiness } from "../context/BusinessContext";

const PAGE_SIZE = 10;

const EMPTY_FORM = { customerName: "", phone: "", address: "", note: "" };

const FILTERS = [
    { id: "all", label: "Everyone" },
    { id: "due", label: "Owes money" },
    { id: "clear", label: "Settled" }
];

/** Period for the "given / collected" figures, worked out in the browser. */
const PERIODS = [
    { id: "thisMonth", label: "This month" },
    { id: "last30", label: "Last 30 days" },
    { id: "allTime", label: "All time" }
];

const periodRange = (id) => {
    const now = new Date();

    if (id === "allTime") return {};

    const start = id === "thisMonth"
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

    return { from: start.toISOString() };
};

const TYPE_TONE = {
    CREDIT_SALE: "warning",
    PAYMENT: "success",
    ADJUSTMENT: "info"
};

const TYPE_TEXT = {
    CREDIT_SALE: "Udhar",
    PAYMENT: "Payment",
    ADJUSTMENT: "Adjustment"
};

const initials = (name = "") =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";

const lastSeen = (value) => {
    if (!value) return "No entries yet";

    const days = Math.floor((Date.now() - new Date(value)) / 86400000);

    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;

    return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/** Udhar khata — everyone who owes the shop, and what they owe. */
export default function Udhar() {

    const toast = useToast();
    const { formatMoney, formatNumber } = useBusiness();

    const [customers, setCustomers] = useState([]);
    const [totals, setTotals] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);

    const [period, setPeriod] = useState("thisMonth");
    const [overview, setOverview] = useState(null);
    const [overviewLoading, setOverviewLoading] = useState(true);

    const [reminderFor, setReminderFor] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const searchRef = useRef(null);

    const closeCustomerForm = useCallback(() => setShowForm(false), []);

    // The list is paged by the server, so typing waits a moment.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounced(search.trim());
            setPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const load = useCallback(async () => {
        try {
            setError("");

            const data = await getCreditCustomers({
                search: debounced,
                filter,
                page,
                limit: PAGE_SIZE
            });

            setCustomers(data.customers || []);
            setTotals(data.totals || null);
            setPagination(data.pagination || { page: 1, pages: 1, total: 0 });

        } catch (err) {
            setError(err?.response?.data?.message || "Could not load the khata");
        } finally {
            setLoading(false);
        }
    }, [debounced, filter, page]);

    const loadOverview = useCallback(async () => {
        try {
            const data = await getUdharSummary(periodRange(period));

            setOverview(data);

        } catch {
            // The list below is the page's real content; a failed overview
            // should not blank it out.
            setOverview(null);
        } finally {
            setOverviewLoading(false);
        }
    }, [period]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        loadOverview();
    }, [loadOverview]);

    // ---------------------------------------------------------- add / edit

    const openForm = (customer = null) => {
        setEditing(customer);
        setFormError("");
        setFormData(
            customer
                ? {
                    customerName: customer.customerName || "",
                    phone: customer.phone || "",
                    address: customer.address || "",
                    note: customer.note || ""
                }
                : EMPTY_FORM
        );
        setShowForm(true);
    };

    const submitForm = async (event) => {
        event.preventDefault();

        if (saving) return;

        try {
            setSaving(true);
            setFormError("");

            if (editing) {
                await updateCreditCustomer(editing._id, formData);
            } else {
                await createCreditCustomer(formData);
            }

            await Promise.all([load(), loadOverview()]);
            setShowForm(false);
            toast.success(`${formData.customerName.trim()} ${editing ? "updated" : "added to the khata"}`);

        } catch (err) {
            setFormError(err?.response?.data?.message || "Could not save this customer");
        } finally {
            setSaving(false);
        }
    };

    const money = (value) => formatMoney(value, { decimals: 2 });

    return (
        <div className="space-y-6">
            <PageHeader
                icon={BookUser}
                title="Udhar Khata"
                subtitle={
                    loading
                        ? "Loading…"
                        : totals
                            ? `${formatNumber(totals.dueCustomers)} of ${formatNumber(totals.customers)} customers owe you money`
                            : "Who owes you, and how much"
                }
                actions={<Button icon={Plus} onClick={() => openForm()}>Add customer</Button>}
            />

            {/* Totals — the first two are "right now", the last two the period */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-heading">Overview</h2>

                <div className="flex rounded-lg border border-line p-0.5" role="tablist" aria-label="Period">
                    {PERIODS.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            role="tab"
                            aria-selected={period === option.id}
                            onClick={() => setPeriod(option.id)}
                            className={[
                                "h-8 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap",
                                period === option.id ? "bg-primary text-white" : "text-muted hover:bg-surface-hover"
                            ].join(" ")}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    icon={IndianRupee}
                    label="Total outstanding"
                    value={money(totals?.outstanding || 0)}
                    hint="Money out on udhar, right now"
                    tone="warning"
                    loading={loading}
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Customers who owe"
                    value={formatNumber(totals?.dueCustomers || 0)}
                    hint={
                        totals?.advance
                            ? `${money(totals.advance)} paid in advance`
                            : `of ${formatNumber(totals?.customers || 0)} in the khata`
                    }
                    tone="danger"
                    loading={loading}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Udhar given"
                    value={money(overview?.summary?.creditGiven || 0)}
                    hint={PERIODS.find((option) => option.id === period)?.label}
                    tone="info"
                    loading={overviewLoading}
                />
                <StatCard
                    icon={TrendingDown}
                    label="Collected"
                    value={money(overview?.summary?.paymentsCollected || 0)}
                    hint={PERIODS.find((option) => option.id === period)?.label}
                    tone="success"
                    loading={overviewLoading}
                />
            </div>

            {/* Who owes most, and what happened lately */}
            {(overview?.topDebtors?.length > 0 || overview?.recent?.length > 0) && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {overview.topDebtors.length > 0 && (
                        <Card padded={false}>
                            <CardHeader
                                className="p-4"
                                icon={AlertTriangle}
                                title="Biggest balances"
                                subtitle="Who to follow up with first"
                            />

                            <ul className="divide-y divide-line border-t border-line">
                                {overview.topDebtors.map((debtor) => (
                                    <li key={debtor._id} className="flex items-center gap-3 px-4 py-2.5">
                                        <Link
                                            to={`/udhar/${debtor._id}`}
                                            className="min-w-0 flex-1 group"
                                        >
                                            <span className="block text-sm font-semibold text-heading truncate group-hover:text-primary">
                                                {debtor.customerName}
                                            </span>
                                            <span className="block text-xs text-muted tabular">
                                                {debtor.phone || "No number"} · {lastSeen(debtor.lastActivityAt)}
                                            </span>
                                        </Link>

                                        <span className="font-bold text-danger tabular shrink-0">
                                            {money(debtor.outstanding)}
                                        </span>

                                        <IconButton
                                            icon={BellRing}
                                            label={`Remind ${debtor.customerName}`}
                                            size="sm"
                                            onClick={() => setReminderFor(debtor)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {overview.recent.length > 0 && (
                        <Card padded={false}>
                            <CardHeader
                                className="p-4"
                                icon={History}
                                title="Recent entries"
                                subtitle={PERIODS.find((option) => option.id === period)?.label}
                            />

                            <ul className="divide-y divide-line border-t border-line">
                                {overview.recent.map((entry) => (
                                    <li key={entry._id} className="flex items-center gap-3 px-4 py-2.5">
                                        <Badge tone={TYPE_TONE[entry.type] || "neutral"} size="sm">
                                            {TYPE_TEXT[entry.type] || entry.type}
                                        </Badge>

                                        <Link
                                            to={`/udhar/${entry.customerId}`}
                                            className="min-w-0 flex-1 text-sm text-heading truncate hover:text-primary"
                                        >
                                            {entry.customerName || "Removed customer"}
                                        </Link>

                                        <span
                                            className={[
                                                "text-sm font-semibold tabular shrink-0",
                                                entry.isReversed ? "text-faint line-through"
                                                    : entry.direction === "decrease" ? "text-success" : "text-heading"
                                            ].join(" ")}
                                        >
                                            {entry.direction === "decrease" ? "−" : "+"} {money(entry.amount)}
                                        </span>

                                        <span className="hidden sm:block w-20 text-right text-xs text-muted shrink-0">
                                            {lastSeen(entry.date)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>
            )}

            <Card padded={false}>
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                        <input
                            ref={searchRef}
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name or mobile number…"
                            className="w-full h-11 pl-9 pr-3 rounded-lg border border-line bg-surface text-sm text-heading focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            aria-label="Search customers"
                        />
                    </div>

                    <div className="flex rounded-lg border border-line p-0.5" role="tablist">
                        {FILTERS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                role="tab"
                                aria-selected={filter === option.id}
                                onClick={() => { setFilter(option.id); setPage(1); }}
                                className={[
                                    "h-9 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap",
                                    filter === option.id
                                        ? "bg-primary text-white"
                                        : "text-muted hover:bg-surface-hover"
                                ].join(" ")}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t border-line">
                    {loading ? (
                        <SkeletonRows rows={5} columns={4} />
                    ) : error ? (
                        <div className="p-4">
                            <ErrorState message={error} onRetry={load} />
                        </div>
                    ) : customers.length === 0 ? (
                        <EmptyState
                            icon={BookUser}
                            title={debounced || filter !== "all" ? "No matches" : "The khata is empty"}
                            message={
                                debounced || filter !== "all"
                                    ? "Try a different search, or switch the filter."
                                    : "Add the customers you give goods to on credit, and keep the notebook here instead."
                            }
                            action={
                                !debounced && filter === "all" && (
                                    <Button icon={Plus} onClick={() => openForm()}>Add customer</Button>
                                )
                            }
                        />
                    ) : (
                        <>
                            {/* Desktop */}
                            <div className="hidden md:block overflow-x-auto thin-scrollbar">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead>
                                        <tr className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                                            <th className="py-3 pl-4 pr-3">Customer</th>
                                            <th className="py-3 px-3">Last entry</th>
                                            <th className="py-3 px-3 text-center">Entries</th>
                                            <th className="py-3 px-3 text-right">Outstanding</th>
                                            <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-line">
                                        {customers.map((customer) => (
                                            <tr key={customer._id} className="hover:bg-surface-hover">
                                                <td className="py-3 pl-4 pr-3">
                                                    <Link to={`/udhar/${customer._id}`} className="flex items-center gap-3 group">
                                                        <span className="grid place-items-center h-9 w-9 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                            {initials(customer.customerName)}
                                                        </span>
                                                        <span className="min-w-0">
                                                            <span className="block font-semibold text-heading truncate group-hover:text-primary">
                                                                {customer.customerName}
                                                            </span>
                                                            <span className="block text-xs text-muted tabular">
                                                                {customer.phone || "No number"}
                                                            </span>
                                                        </span>
                                                    </Link>
                                                </td>

                                                <td className="py-3 px-3 text-body">{lastSeen(customer.lastActivityAt)}</td>

                                                <td className="py-3 px-3 text-center text-body tabular">
                                                    {formatNumber(customer.entryCount || 0)}
                                                </td>

                                                <td className="py-3 px-3 text-right">
                                                    {customer.outstanding > 0 ? (
                                                        <span className="font-bold text-danger tabular">
                                                            {money(customer.outstanding)}
                                                        </span>
                                                    ) : customer.outstanding < 0 ? (
                                                        <Badge tone="info" size="sm">
                                                            {money(Math.abs(customer.outstanding))} advance
                                                        </Badge>
                                                    ) : (
                                                        <Badge tone="success" size="sm">Settled</Badge>
                                                    )}
                                                </td>

                                                <td className="py-3 pl-3 pr-4">
                                                    <div className="flex justify-end gap-1">
                                                        <IconButton
                                                            icon={Pencil}
                                                            label={`Edit ${customer.customerName}`}
                                                            size="sm"
                                                            onClick={() => openForm(customer)}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            iconRight={ChevronRight}
                                                            to={`/udhar/${customer._id}`}
                                                        >
                                                            Khata
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile */}
                            <ul className="md:hidden divide-y divide-line">
                                {customers.map((customer) => (
                                    <li key={customer._id}>
                                        <Link to={`/udhar/${customer._id}`} className="flex items-center gap-3 p-4 active:bg-surface-hover">
                                            <span className="grid place-items-center h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                {initials(customer.customerName)}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-heading truncate">{customer.customerName}</p>
                                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                                                    {customer.phone && (
                                                        <>
                                                            <Phone className="h-3 w-3" />
                                                            <span className="tabular">{customer.phone}</span>
                                                            <span aria-hidden="true">·</span>
                                                        </>
                                                    )}
                                                    {lastSeen(customer.lastActivityAt)}
                                                </p>
                                            </div>

                                            <div className="text-right shrink-0">
                                                {customer.outstanding > 0 ? (
                                                    <p className="font-bold text-danger tabular">{money(customer.outstanding)}</p>
                                                ) : customer.outstanding < 0 ? (
                                                    <p className="text-xs font-semibold text-info tabular">
                                                        {money(Math.abs(customer.outstanding))} adv.
                                                    </p>
                                                ) : (
                                                    <Badge tone="success" size="sm">Settled</Badge>
                                                )}
                                                <p className="mt-0.5 text-[11px] text-faint">
                                                    {formatNumber(customer.entryCount || 0)} entries
                                                </p>
                                            </div>

                                            <ChevronRight className="h-4 w-4 text-faint shrink-0" aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                {!loading && !error && customers.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted tabular">
                            Showing {(pagination.page - 1) * PAGE_SIZE + 1}–
                            {Math.min(pagination.page * PAGE_SIZE, pagination.total)} of {formatNumber(pagination.total)}
                        </p>

                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.pages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </Card>

            <ReminderModal
                show={Boolean(reminderFor)}
                customer={reminderFor}
                onClose={() => setReminderFor(null)}
            />

            <CustomerModal
                show={showForm}
                editing={editing}
                formData={formData}
                onChange={(event) =>
                    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
                }
                onSubmit={submitForm}
                onClose={closeCustomerForm}
                error={formError}
                loading={saving}
            />
        </div>
    );
}
