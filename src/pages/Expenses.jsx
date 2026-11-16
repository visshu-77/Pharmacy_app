import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Activity,
    ArrowDownLeft,
    ArrowDownRight,
    CalendarDays,
    ChartNoAxesCombined,
    CircleDollarSign,
    Download,
    Eye,
    FileText,
    Pencil,
    Plus,
    Printer,
    Repeat2,
    Search,
    Tags,
    Trash2,
    Wallet
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import Button, { IconButton } from "../components/ui/Button";
import Card, { CardHeader } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Modal, { ConfirmDialog } from "../components/ui/Modal";
import { EmptyState, Spinner } from "../components/ui/State";
import { useToast } from "../components/ui/Toast";
import { useBusiness } from "../context/BusinessContext";
import TransactionForm from "../components/expenses/TransactionForm";
import RecurringForm from "../components/expenses/RecurringForm";
import {
    deleteExpenseCategory,
    deleteExpenseTransaction,
    deleteRecurringExpense,
    exportExpenseReport,
    getExpenseCategories,
    getExpenseDashboard,
    getExpenseReceipt,
    getExpenseReport,
    getExpenseTransactions,
    getRecurringExpenses,
    saveExpenseCategory,
    saveExpenseTransaction,
    saveRecurringExpense
} from "../services/expenseService";

const TYPES = [
    { value: "", label: "All types" },
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
    { value: "investment", label: "Investment" },
    { value: "refund", label: "Refund" },
    { value: "transfer", label: "Transfer" }
];
const PAYMENTS = [
    { value: "", label: "All payment methods" },
    ...["Cash", "UPI", "Bank Transfer", "Credit Card", "Debit Card", "Other"]
        .map((value) => ({ value, label: value }))
];
const SORTS = [
    { value: "latest", label: "Latest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "highest", label: "Highest amount" },
    { value: "lowest", label: "Lowest amount" }
];
const CHART_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#7c3aed", "#0891b2", "#db2777", "#64748b"];
const toDateInput = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const TODAY = toDateInput(new Date());
const MONTH_START = `${TODAY.slice(0, 8)}01`;

const dateLabel = (value, options = { day: "numeric", month: "short" }) =>
    new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", options);

const typeLabel = (type) => ({
    expense: "Expense",
    income: "Income",
    investment: "Investment",
    refund: "Refund",
    transfer: "Transfer"
}[type] || type);

function ChartTooltip({ active, payload, label, formatMoney }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-md">
            <p className="text-xs font-medium text-muted">{label}</p>
            {payload.map((entry) => (
                <p key={entry.dataKey} className="text-xs font-semibold text-heading tabular">
                    {entry.name}: {formatMoney(entry.value)}
                </p>
            ))}
        </div>
    );
}

function TransactionRows({ rows, formatMoney, onView, onEdit, onDelete }) {
    if (!rows.length) {
        return <EmptyState icon={FileText} title="No transactions found" message="Try a different filter or add a new transaction." className="py-8" />;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
                <thead>
                    <tr className="border-b border-line text-left text-xs text-muted">
                        <th className="px-3 py-3 font-semibold">Transaction</th>
                        <th className="px-3 py-3 font-semibold">Type</th>
                        <th className="px-3 py-3 font-semibold">Category</th>
                        <th className="px-3 py-3 font-semibold">Date</th>
                        <th className="px-3 py-3 text-right font-semibold">Amount</th>
                        <th className="px-3 py-3 text-right font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {rows.map((row) => (
                        <tr key={row._id} className="hover:bg-surface-hover/60">
                            <td className="px-3 py-3">
                                <p className="font-semibold text-heading">{row.title}</p>
                                <p className="text-xs text-muted">{row.paymentMethod}</p>
                            </td>
                            <td className="px-3 py-3">
                                <span className="rounded-full bg-surface-muted px-2 py-1 text-xs font-medium capitalize text-muted">
                                    {typeLabel(row.type)}
                                </span>
                            </td>
                            <td className="px-3 py-3 text-muted">{row.categoryId?.name || "—"}</td>
                            <td className="px-3 py-3 text-muted">{dateLabel(row.transactionDate, { day: "numeric", month: "short", year: "numeric" })}</td>
                            <td className="px-3 py-3 text-right font-semibold tabular text-heading">{formatMoney(row.amount, { decimals: 2 })}</td>
                            <td className="px-3 py-3">
                                <div className="flex justify-end gap-1">
                                    <IconButton icon={Eye} label="View transaction" size="sm" onClick={() => onView(row)} />
                                    <IconButton icon={Pencil} label="Edit transaction" size="sm" onClick={() => onEdit(row)} />
                                    <IconButton icon={Trash2} label="Delete transaction" size="sm" className="text-danger" onClick={() => onDelete(row)} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function Expenses() {
    const toast = useToast();
    const { formatMoney } = useBusiness();
    const [activeTab, setActiveTab] = useState("overview");
    const [dashboard, setDashboard] = useState(null);
    const [categories, setCategories] = useState([]);
    const [rules, setRules] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [transactionsTotal, setTransactionsTotal] = useState(0);
    const [transactionsPage, setTransactionsPage] = useState(1);
    const [transactionsHasMore, setTransactionsHasMore] = useState(false);
    const [filters, setFilters] = useState({ search: "", type: "", categoryId: "", paymentMethod: "", from: "", to: "", sort: "latest" });
    const [draftFilters, setDraftFilters] = useState(filters);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [loadingRules, setLoadingRules] = useState(false);
    const [saving, setSaving] = useState(false);
    const [transactionEditor, setTransactionEditor] = useState(null);
    const [ruleEditor, setRuleEditor] = useState(null);
    const [detail, setDetail] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [categoryEditor, setCategoryEditor] = useState(null);
    const [reportRange, setReportRange] = useState({ from: MONTH_START, to: TODAY });
    const [report, setReport] = useState(null);
    const [reportGranularity, setReportGranularity] = useState("day");
    const [loadingReport, setLoadingReport] = useState(false);
    const [categoryForm, setCategoryForm] = useState({ name: "", type: "expense" });
    const [savingCategory, setSavingCategory] = useState(false);

    const loadDashboard = useCallback(async () => {
        setLoadingDashboard(true);
        try {
            const [summary, categoryResult] = await Promise.all([
                getExpenseDashboard(),
                getExpenseCategories()
            ]);
            setDashboard(summary);
            setCategories(categoryResult.categories);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load expenses dashboard");
        } finally {
            setLoadingDashboard(false);
        }
    }, [toast]);

    const loadTransactions = useCallback(async () => {
        setLoadingTransactions(true);
        try {
            const result = await getExpenseTransactions({
                ...filters,
                page: transactionsPage,
                limit: 20
            });
            setTransactions(result.transactions);
            setTransactionsTotal(result.total);
            setTransactionsHasMore(result.hasMore);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load transactions");
        } finally {
            setLoadingTransactions(false);
        }
    }, [filters, transactionsPage, toast]);

    const loadRules = useCallback(async () => {
        setLoadingRules(true);
        try {
            const result = await getRecurringExpenses();
            setRules(result.rules);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load recurring transactions");
        } finally {
            setLoadingRules(false);
        }
    }, [toast]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        if (activeTab === "transactions") loadTransactions();
    }, [activeTab, loadTransactions]);

    useEffect(() => {
        if (activeTab === "recurring") loadRules();
    }, [activeTab, loadRules]);

    const refresh = async () => {
        await loadDashboard();
        if (activeTab === "transactions") await loadTransactions();
        if (activeTab === "recurring") await loadRules();
    };

    const handleSaveTransaction = async (payload, file) => {
        try {
            setSaving(true);
            await saveExpenseTransaction(payload, file, transactionEditor?.transaction?._id);
            toast.success(transactionEditor?.transaction ? "Transaction updated" : "Transaction added");
            setTransactionEditor(null);
            await refresh();
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not save transaction");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRule = async (payload) => {
        try {
            setSaving(true);
            await saveRecurringExpense(payload, ruleEditor?.rule?._id);
            toast.success(ruleEditor?.rule ? "Recurring transaction updated" : "Recurring transaction added");
            setRuleEditor(null);
            await loadRules();
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not save recurring transaction");
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        const target = confirmation;
        if (!target) return;
        try {
            if (target.kind === "transaction") {
                await deleteExpenseTransaction(target.item._id);
                toast.success("Transaction deleted");
            } else if (target.kind === "category") {
                await deleteExpenseCategory(target.item._id);
                toast.success("Category deleted");
            } else {
                await deleteRecurringExpense(target.item._id);
                toast.success("Recurring rule deleted; existing transactions were kept");
            }
            setConfirmation(null);
            await refresh();
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not delete");
        }
    };

    const saveCategory = async (event) => {
        event.preventDefault();
        try {
            setSavingCategory(true);
            await saveExpenseCategory(categoryForm, categoryEditor?._id);
            toast.success(categoryEditor ? "Category updated" : "Category added");
            setCategoryEditor(null);
            setCategoryForm({ name: "", type: "expense" });
            await loadDashboard();
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not save category");
        } finally {
            setSavingCategory(false);
        }
    };

    const viewReceipt = async (transactionId) => {
        const previewWindow = window.open("about:blank", "_blank");
        if (!previewWindow) {
            toast.warning("Allow pop-ups to view the receipt");
            return;
        }
        previewWindow.opener = null;
        try {
            const file = await getExpenseReceipt(transactionId);
            const url = URL.createObjectURL(file);
            previewWindow.location.href = url;
            window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (error) {
            previewWindow.close();
            toast.error(error.response?.data?.message || "Could not open receipt");
        }
    };

    const applyFilters = (event) => {
        event.preventDefault();
        setTransactionsPage(1);
        setFilters({ ...draftFilters });
    };

    const fetchReport = async (event) => {
        event?.preventDefault();
        try {
            setLoadingReport(true);
            const days = Math.floor(
                (new Date(`${reportRange.to}T00:00:00`) - new Date(`${reportRange.from}T00:00:00`)) / 86400000
            ) + 1;
            setReportGranularity(days > 35 ? "month" : "day");
            setReport(await getExpenseReport(reportRange.from, reportRange.to));
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load report");
        } finally {
            setLoadingReport(false);
        }
    };

    const setReportPreset = (preset) => {
        const end = new Date(`${TODAY}T00:00:00`);
        const start = new Date(end);
        let granularity = "day";
        if (preset === "today") {
            // Same day for both ends.
        } else if (preset === "week") {
            start.setDate(start.getDate() - 6);
        } else if (preset === "month") {
            start.setDate(1);
        } else {
            start.setMonth(start.getMonth() - 11, 1);
            start.setDate(1);
            granularity = "month";
        }
        const nextRange = {
            from: toDateInput(start),
            to: toDateInput(end)
        };
        setReportRange(nextRange);
        setReportGranularity(granularity);
        setLoadingReport(true);
        getExpenseReport(nextRange.from, nextRange.to)
            .then(setReport)
            .catch((error) => toast.error(error.response?.data?.message || "Could not load report"))
            .finally(() => setLoadingReport(false));
    };

    const downloadReport = async () => {
        try {
            const file = await exportExpenseReport(reportRange.from, reportRange.to);
            const url = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = url;
            link.download = `expense-report-${reportRange.from}-to-${reportRange.to}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not export report");
        }
    };

    const changeRecurringActive = async (rule) => {
        try {
            await saveRecurringExpense({ active: !rule.active }, rule._id);
            await loadRules();
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not update recurring transaction");
        }
    };

    const pieData = useMemo(() => dashboard?.categoryBreakdown || [], [dashboard]);
    const tabs = [
        { id: "overview", label: "Overview", icon: ChartNoAxesCombined },
        { id: "transactions", label: "Transactions", icon: FileText },
        { id: "reports", label: "Reports", icon: CalendarDays },
        { id: "recurring", label: "Recurring", icon: Repeat2 },
        { id: "categories", label: "Categories", icon: Tags }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                icon={Wallet}
                title="Expense & Investment"
                subtitle="Track daily business costs, income, and investments."
                actions={
                    <Button icon={Plus} onClick={() => setTransactionEditor({ transaction: null })}>
                        Add transaction
                    </Button>
                }
            />

            <div className="flex flex-wrap gap-2 no-print" role="tablist" aria-label="Expense management sections">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <Button
                        key={id}
                        variant={activeTab === id ? "soft" : "ghost"}
                        size="sm"
                        role="tab"
                        aria-selected={activeTab === id}
                        onClick={() => setActiveTab(id)}
                        icon={Icon}
                    >
                        {label}
                    </Button>
                ))}
            </div>

            {activeTab === "overview" && (
                <div className="space-y-6">
                    {loadingDashboard ? <Spinner /> : (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                <StatCard icon={ArrowDownRight} tone="danger" label="Expenses today" value={formatMoney(dashboard?.totals.expensesToday || 0)} />
                                <StatCard icon={CalendarDays} tone="warning" label="Expenses this month" value={formatMoney(dashboard?.totals.expensesThisMonth || 0)} />
                                <StatCard icon={Activity} tone="primary" label="Total investments" value={formatMoney(dashboard?.totals.totalInvestments || 0)} />
                                <StatCard icon={ArrowDownLeft} tone="success" label="Total income" value={formatMoney(dashboard?.totals.totalIncome || 0)} />
                                <StatCard icon={CircleDollarSign} tone="info" label="Total balance" value={formatMoney(dashboard?.totals.totalBalance || 0)} hint="Income − expenses − investments" />
                                <StatCard icon={FileText} tone="neutral" label="Total transactions" value={String(dashboard?.totals.totalTransactions || 0)} />
                            </div>

                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                <Card>
                                    <CardHeader title="Daily cash flow" subtitle="Expenses, income, and investments · last 30 days" />
                                    <div className="mt-4 h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={dashboard?.daily || []} margin={{ left: 4, right: 12, top: 8 }}>
                                                <CartesianGrid vertical={false} stroke="rgb(var(--color-line))" />
                                                <XAxis dataKey="date" tickLine={false} axisLine={false} interval={5} tick={{ fontSize: 10, fill: "rgb(var(--color-muted))" }} tickFormatter={(value) => dateLabel(value)} />
                                                <YAxis tickLine={false} axisLine={false} width={55} tick={{ fontSize: 10, fill: "rgb(var(--color-muted))" }} />
                                                <Tooltip content={<ChartTooltip formatMoney={formatMoney} />} />
                                                <Legend />
                                                <Area type="monotone" dataKey="expenses" name="Expenses (net)" stroke="#dc2626" fill="#dc2626" fillOpacity={0.08} />
                                                <Area type="monotone" dataKey="income" name="Income" stroke="#16a34a" fill="#16a34a" fillOpacity={0.08} />
                                                <Area type="monotone" dataKey="investments" name="Investments" stroke="#2563eb" fill="#2563eb" fillOpacity={0.06} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                <Card>
                                    <CardHeader title="Monthly income vs expenses" subtitle="Net operating expenses and investments · last 12 months" />
                                    <div className="mt-4 h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={dashboard?.monthly || []} margin={{ left: 4, right: 12, top: 8 }}>
                                                <CartesianGrid vertical={false} stroke="rgb(var(--color-line))" />
                                                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "rgb(var(--color-muted))" }} tickFormatter={(value) => new Date(`${value}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })} />
                                                <YAxis tickLine={false} axisLine={false} width={55} tick={{ fontSize: 10, fill: "rgb(var(--color-muted))" }} />
                                                <Tooltip content={<ChartTooltip formatMoney={formatMoney} />} />
                                                <Legend />
                                                <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="expenses" name="Expenses (net)" fill="#dc2626" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="investments" name="Investments" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                                <Card>
                                    <CardHeader title="Expense categories" subtitle="This month · refunds reduce the category amount" />
                                    {pieData.length ? (
                                        <div className="mt-4 h-[260px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={pieData} dataKey="amount" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                                                        {pieData.map((entry, index) => <Cell key={entry.categoryId || entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => formatMoney(value)} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : <p className="py-12 text-center text-sm text-muted">No expenses this month yet.</p>}
                                </Card>
                                <Card className="xl:col-span-2">
                                    <CardHeader title="Recent transactions" subtitle="Latest entries across all types" action={<Button size="sm" variant="ghost" onClick={() => setActiveTab("transactions")}>View all</Button>} />
                                    <div className="mt-3 divide-y divide-line">
                                        {(dashboard?.recent || []).map((transaction) => (
                                            <button
                                                key={transaction._id}
                                                type="button"
                                                className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-surface-hover"
                                                onClick={() => setDetail(transaction)}
                                            >
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-semibold text-heading">{transaction.title}</span>
                                                    <span className="text-xs text-muted">{typeLabel(transaction.type)} · {transaction.categoryId?.name || "No category"} · {dateLabel(transaction.transactionDate)}</span>
                                                </span>
                                                <span className="shrink-0 text-sm font-semibold text-heading tabular">{formatMoney(transaction.amount, { decimals: 2 })}</span>
                                            </button>
                                        ))}
                                        {!dashboard?.recent?.length && <p className="py-10 text-center text-sm text-muted">Your transactions will appear here.</p>}
                                    </div>
                                    <div className="mt-4 border-t border-line pt-4">
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Top spending categories</p>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            {(dashboard?.topCategories || []).map((category, index) => (
                                                <div key={category.categoryId || category.name} className="flex items-center justify-between gap-3 rounded-lg bg-surface-muted px-3 py-2 text-sm">
                                                    <span className="flex min-w-0 items-center gap-2 truncate text-muted">
                                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                                        {category.name}
                                                    </span>
                                                    <span className="shrink-0 font-semibold text-heading tabular">{formatMoney(category.amount)}</span>
                                                </div>
                                            ))}
                                            {!dashboard?.topCategories?.length && <p className="text-sm text-muted">No spending categories yet.</p>}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === "transactions" && (
                <div className="space-y-4">
                    <Card className="no-print">
                        <form onSubmit={applyFilters} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <Input label="Search title" icon={Search} value={draftFilters.search} onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })} placeholder="Search transactions" />
                            <Select label="Type" value={draftFilters.type} onChange={(event) => setDraftFilters({ ...draftFilters, type: event.target.value })} options={TYPES} />
                            <Select label="Category" value={draftFilters.categoryId} onChange={(event) => setDraftFilters({ ...draftFilters, categoryId: event.target.value })} placeholder="All categories" options={categories.map((category) => ({ value: category._id, label: category.name }))} />
                            <Select label="Payment method" value={draftFilters.paymentMethod} onChange={(event) => setDraftFilters({ ...draftFilters, paymentMethod: event.target.value })} options={PAYMENTS} />
                            <Input label="From" type="date" value={draftFilters.from} onChange={(event) => setDraftFilters({ ...draftFilters, from: event.target.value })} />
                            <Input label="To" type="date" value={draftFilters.to} onChange={(event) => setDraftFilters({ ...draftFilters, to: event.target.value })} />
                            <Select label="Sort by" value={draftFilters.sort} onChange={(event) => setDraftFilters({ ...draftFilters, sort: event.target.value })} options={SORTS} />
                            <Button type="submit" icon={Search}>Apply filters</Button>
                        </form>
                    </Card>
                    <Card padded={false}>
                        <div className="flex items-center justify-between gap-3 px-5 py-4">
                            <h2 className="font-semibold text-heading">Transaction history</h2>
                            <span className="text-xs text-muted">{transactionsTotal} total</span>
                        </div>
                        {loadingTransactions ? <Spinner /> : (
                            <TransactionRows
                                rows={transactions}
                                formatMoney={formatMoney}
                                onView={setDetail}
                                onEdit={(transaction) => setTransactionEditor({ transaction })}
                                onDelete={(transaction) => setConfirmation({ kind: "transaction", item: transaction })}
                            />
                        )}
                        <div className="flex items-center justify-between border-t border-line px-5 py-3 no-print">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={transactionsPage <= 1}
                                onClick={() => setTransactionsPage((page) => page - 1)}
                            >
                                Previous
                            </Button>
                            <span className="text-xs text-muted">Page {transactionsPage}</span>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={!transactionsHasMore}
                                onClick={() => setTransactionsPage((page) => page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === "reports" && (
                <div className="space-y-4">
                    <Card className="no-print">
                        <div className="mb-4 flex flex-wrap gap-2">
                            {[
                                ["today", "Daily"],
                                ["week", "Weekly"],
                                ["month", "Monthly"],
                                ["year", "Compare 12 months"]
                            ].map(([preset, label]) => (
                                <Button key={preset} type="button" size="sm" variant="secondary" onClick={() => setReportPreset(preset)}>
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <form onSubmit={fetchReport} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
                            <Input label="From" type="date" value={reportRange.from} onChange={(event) => setReportRange({ ...reportRange, from: event.target.value })} required />
                            <Input label="To" type="date" value={reportRange.to} onChange={(event) => setReportRange({ ...reportRange, to: event.target.value })} required />
                            <div className="flex flex-wrap gap-2">
                                <Button type="submit" icon={Search} loading={loadingReport}>Run report</Button>
                                <Button variant="secondary" icon={Download} onClick={downloadReport}>CSV</Button>
                                <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
                            </div>
                        </form>
                    </Card>
                    {loadingReport ? <Spinner /> : report ? (
                        <div id="expense-report" className="space-y-4">
                            <Card>
                                <CardHeader title="Financial report" subtitle={`${dateLabel(report.from, { day: "numeric", month: "long", year: "numeric" })} – ${dateLabel(report.to, { day: "numeric", month: "long", year: "numeric" })}`} />
                                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
                                    {[
                                        ["Expenses (net)", report.totals.expenses],
                                        ["Income", report.totals.income],
                                        ["Investments", report.totals.investments],
                                        ["Net cash flow", report.totals.netCashFlow],
                                        ["Transactions", report.totals.transactions]
                                    ].map(([label, value]) => (
                                        <div key={label} className="rounded-xl bg-surface-muted p-3">
                                            <p className="text-xs text-muted">{label}</p>
                                            <p className="mt-1 font-bold text-heading tabular">{label === "Transactions" ? value : formatMoney(value)}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                <Card>
                                    <CardHeader title={reportGranularity === "month" ? "Monthly comparison" : "Daily report"} subtitle="Income, net expenses, and investments" />
                                    <div className="mt-4 h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={reportGranularity === "month" ? report.monthly : report.daily}>
                                                <CartesianGrid vertical={false} stroke="rgb(var(--color-line))" />
                                                <XAxis
                                                    dataKey={reportGranularity === "month" ? "month" : "date"}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    interval="preserveStartEnd"
                                                    tick={{ fontSize: 10 }}
                                                    tickFormatter={(value) => reportGranularity === "month"
                                                        ? new Date(`${value}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
                                                        : dateLabel(value)}
                                                />
                                                <YAxis tickLine={false} axisLine={false} width={55} tick={{ fontSize: 10 }} />
                                                <Tooltip content={<ChartTooltip formatMoney={formatMoney} />} />
                                                <Legend />
                                                <Bar dataKey="income" name="Income" fill="#16a34a" />
                                                <Bar dataKey="expenses" name="Expenses" fill="#dc2626" />
                                                <Bar dataKey="investments" name="Investments" fill="#2563eb" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                                <Card>
                                    <CardHeader title="Category spending" subtitle="Refunds reduce category totals" />
                                    {report.categories.length ? (
                                        <div className="mt-4 space-y-3">
                                            {report.categories.map((category) => (
                                                <div key={category.name} className="flex items-center justify-between gap-3 border-b border-line pb-2 text-sm">
                                                    <span className="text-muted">{category.name}</span>
                                                    <span className="font-semibold text-heading tabular">{formatMoney(category.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="py-12 text-center text-sm text-muted">No expenses in this date range.</p>}
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <EmptyState icon={CalendarDays} title="Create a report" message="Choose a date range to view daily, weekly, or monthly totals." />
                    )}
                </div>
            )}

            {activeTab === "categories" && (
                <Card>
                    <CardHeader
                        title="Expense categories"
                        subtitle="Default and custom categories are kept separate for each account."
                        action={<Button icon={Plus} size="sm" onClick={() => { setCategoryForm({ name: "", type: "expense" }); setCategoryEditor({}); }}>Add category</Button>}
                    />
                    <div className="mt-4 space-y-5">
                        {["expense", "income", "investment"].map((type) => (
                            <section key={type}>
                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{typeLabel(type)} categories</h3>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {categories.filter((category) => category.type === type).map((category) => (
                                        <div key={category._id} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2.5">
                                            <span className="min-w-0 truncate text-sm font-medium text-heading">
                                                {category.name}
                                                {category.isDefault && <span className="ml-2 text-[10px] font-normal text-faint">Default</span>}
                                            </span>
                                            <span className="flex shrink-0 gap-1">
                                                <IconButton icon={Pencil} size="sm" label={`Edit ${category.name}`} onClick={() => { setCategoryEditor(category); setCategoryForm({ name: category.name, type: category.type }); }} />
                                                {!category.isDefault && <IconButton icon={Trash2} size="sm" label={`Delete ${category.name}`} className="text-danger" onClick={() => setConfirmation({ kind: "category", item: category })} />}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </Card>
            )}

            {activeTab === "recurring" && (
                <Card padded={false}>
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-heading">Recurring transactions</h2>
                            <p className="mt-0.5 text-xs text-muted">Scheduled entries are generated automatically; each scheduled date is recorded once.</p>
                        </div>
                        <Button icon={Plus} size="sm" onClick={() => setRuleEditor({ rule: null })}>Add schedule</Button>
                    </div>
                    {loadingRules ? <Spinner /> : rules.length ? (
                        <div className="divide-y divide-line">
                            {rules.map((rule) => (
                                <div key={rule._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-heading">{rule.title}</p>
                                        <p className="text-xs text-muted">
                                            {typeLabel(rule.type)} · {rule.categoryId?.name} · {rule.frequency} · {formatMoney(rule.amount, { decimals: 2 })}
                                        </p>
                                        <p className="text-xs text-faint">Next date: {dateLabel(rule.nextRunDate, { day: "numeric", month: "short", year: "numeric" })}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button type="button" className={`rounded-full px-2.5 py-1 text-xs font-semibold ${rule.active ? "bg-success/10 text-success" : "bg-surface-muted text-muted"}`} onClick={() => changeRecurringActive(rule)}>
                                            {rule.active ? "Active" : "Paused"}
                                        </button>
                                        <IconButton icon={Pencil} label="Edit recurring transaction" onClick={() => setRuleEditor({ rule })} />
                                        <IconButton icon={Trash2} label="Delete recurring transaction" className="text-danger" onClick={() => setConfirmation({ kind: "recurring", item: rule })} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <EmptyState icon={Repeat2} title="No recurring transactions" message="Schedule regular expenses, income, or investments here." className="py-10" />}
                </Card>
            )}

            <TransactionForm
                key={transactionEditor?.transaction?._id || (transactionEditor ? "new-transaction" : "closed-transaction")}
                open={Boolean(transactionEditor)}
                transaction={transactionEditor?.transaction}
                categories={categories}
                onClose={() => setTransactionEditor(null)}
                onSave={handleSaveTransaction}
                loading={saving}
            />
            <RecurringForm
                key={ruleEditor?.rule?._id || (ruleEditor ? "new-recurring" : "closed-recurring")}
                open={Boolean(ruleEditor)}
                rule={ruleEditor?.rule}
                categories={categories}
                onClose={() => setRuleEditor(null)}
                onSave={handleSaveRule}
                loading={saving}
            />

            <Modal
                open={Boolean(categoryEditor)}
                onClose={() => setCategoryEditor(null)}
                title={categoryEditor?._id ? "Edit category" : "Add category"}
                icon={Tags}
                size="sm"
            >
                <form onSubmit={saveCategory} className="space-y-4">
                    <Input label="Category name" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} maxLength={60} required />
                    <Select label="Category type" value={categoryForm.type} onChange={(event) => setCategoryForm({ ...categoryForm, type: event.target.value })} options={[
                        { value: "expense", label: "Expense" },
                        { value: "income", label: "Income" },
                        { value: "investment", label: "Investment" }
                    ]} />
                    <div className="flex justify-end gap-2 border-t border-line pt-4">
                        <Button variant="secondary" onClick={() => setCategoryEditor(null)}>Cancel</Button>
                        <Button type="submit" loading={savingCategory}>Save category</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                open={Boolean(detail)}
                onClose={() => setDetail(null)}
                title={detail?.title || "Transaction details"}
                subtitle={detail ? typeLabel(detail.type) : undefined}
                icon={FileText}
                size="md"
            >
                {detail && (
                    <>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            <div><dt className="text-xs text-muted">Amount</dt><dd className="mt-0.5 font-semibold text-heading">{formatMoney(detail.amount, { decimals: 2 })}</dd></div>
                            <div><dt className="text-xs text-muted">Category</dt><dd className="mt-0.5 font-semibold text-heading">{detail.categoryId?.name || "—"}</dd></div>
                            <div><dt className="text-xs text-muted">Date</dt><dd className="mt-0.5 font-semibold text-heading">{dateLabel(detail.transactionDate, { day: "numeric", month: "long", year: "numeric" })}</dd></div>
                            <div><dt className="text-xs text-muted">Payment method</dt><dd className="mt-0.5 font-semibold text-heading">{detail.paymentMethod}</dd></div>
                            <div className="col-span-2"><dt className="text-xs text-muted">Notes</dt><dd className="mt-0.5 whitespace-pre-wrap text-body">{detail.description || "—"}</dd></div>
                        </dl>
                        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-line pt-4">
                            {detail.receipt?.fileName && <Button variant="secondary" icon={Eye} onClick={() => viewReceipt(detail._id)}>View receipt</Button>}
                            <Button variant="secondary" icon={Pencil} onClick={() => { setTransactionEditor({ transaction: detail }); setDetail(null); }}>Edit</Button>
                            <Button variant="ghost" onClick={() => setDetail(null)}>Close</Button>
                        </div>
                    </>
                )}
            </Modal>

            <ConfirmDialog
                open={Boolean(confirmation)}
                onCancel={() => setConfirmation(null)}
                onConfirm={confirmDelete}
                title={
                    confirmation?.kind === "transaction" ? "Delete transaction?" :
                        confirmation?.kind === "category" ? "Delete category?" : "Delete recurring rule?"
                }
                message={
                    confirmation?.kind === "transaction"
                        ? "This transaction will be permanently deleted."
                        : confirmation?.kind === "category"
                            ? "This category can only be deleted if it is not used by a transaction or recurring rule."
                            : "The schedule will be removed. Transactions already generated will be kept."
                }
                confirmLabel="Delete"
            />
        </div>
    );
}
