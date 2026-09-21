import { useEffect, useMemo, useState } from "react";
import {
    ChartNoAxesCombined,
    Download,
    IndianRupee,
    ReceiptText,
    Calculator,
    Package,
    TrendingUp,
    Trophy,
    Tags,
    ArrowLeftRight,
    RotateCcw,
    Filter
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Card, { CardHeader } from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Input, Select } from "../components/ui/Field";
import { Skeleton, EmptyState, ErrorState, SkeletonRows } from "../components/ui/State";
import { useToast } from "../components/ui/Toast";
import SalesTrendChart, { fillDailySeries } from "../components/charts/SalesTrendChart";

import {
    getReportSummary,
    getSalesOverview,
    getTopSellingProducts,
    getCategoryPerformance,
    getRecentTransactions,
    exportReport
} from "../services/reportService";
import { useBusiness } from "../context/BusinessContext";

const RANGES = [
    { value: "today", label: "Today" },
    { value: "thisWeek", label: "This week" },
    { value: "last30Days", label: "Last 30 days" },
    { value: "thisMonth", label: "This month" },
    { value: "lastMonth", label: "Last month" },
    { value: "thisYear", label: "This year" }
];

/** Mirrors the server's getDateRange so the chart can fill empty days. */
const rangeWindow = (range) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    switch (range) {
        case "today": return { from: new Date(y, m, d), to: now };
        case "thisWeek": return { from: new Date(y, m, d - ((now.getDay() + 6) % 7)), to: now };
        case "last30Days": return { from: new Date(y, m, d - 29), to: now };
        case "lastMonth": return { from: new Date(y, m - 1, 1), to: new Date(y, m, 0) };
        case "thisYear": return { from: new Date(y, 0, 1), to: now };
        case "thisMonth":
        default: return { from: new Date(y, m, 1), to: now };
    }
};

const EMPTY_TX_FILTERS = {
    customerName: "",
    productName: "",
    amount: "",
    status: "all",
    date: "",
    type: "all"
};

const TX_PAGE_SIZE = 10;

export default function Reports() {

    const toast = useToast();
    const { term, formatMoney, formatNumber } = useBusiness();

    const [range, setRange] = useState("thisMonth");

    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    const [sales, setSales] = useState([]);
    const [salesLoading, setSalesLoading] = useState(true);

    const [topBy, setTopBy] = useState("quantity");
    const [topProducts, setTopProducts] = useState([]);
    const [topLoading, setTopLoading] = useState(true);

    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [categoryError, setCategoryError] = useState("");

    const [txView, setTxView] = useState("billing");
    const [txFilters, setTxFilters] = useState(EMPTY_TX_FILTERS);
    const [transactions, setTransactions] = useState([]);
    const [txLoading, setTxLoading] = useState(true);
    const [txError, setTxError] = useState("");
    const [txPage, setTxPage] = useState(1);
    const [txTotalPages, setTxTotalPages] = useState(1);
    const [txTotal, setTxTotal] = useState(0);

    // ---------------- loaders ----------------

    useEffect(() => {
        setSummaryLoading(true);
        setSalesLoading(true);

        getReportSummary(range)
            .then(setSummary)
            .catch((err) => toast.error(err?.response?.data?.message || "Could not load summary"))
            .finally(() => setSummaryLoading(false));

        getSalesOverview(range)
            .then((data) => setSales(data.sales || []))
            .catch(() => setSales([]))
            .finally(() => setSalesLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [range]);

    useEffect(() => {
        setTopLoading(true);
        getTopSellingProducts(topBy)
            .then((data) => setTopProducts(data.products || []))
            .catch(() => setTopProducts([]))
            .finally(() => setTopLoading(false));
    }, [topBy]);

    useEffect(() => {
        getCategoryPerformance()
            .then((data) => setCategories(data.categories || []))
            .catch((err) => setCategoryError(err?.response?.data?.message || "Could not load category performance"))
            .finally(() => setCategoryLoading(false));

        loadTransactions({}, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const activeTxFilters = () =>
        Object.fromEntries(Object.entries(txFilters).filter(([, value]) => value && value !== "all"));

    const loadTransactions = async (filters, page) => {
        try {
            setTxLoading(true);
            setTxError("");
            const data = await getRecentTransactions({ ...filters, page, limit: TX_PAGE_SIZE });
            setTransactions(data.transactions || []);
            setTxPage(data.pagination?.currentPage || page);
            setTxTotalPages(data.pagination?.totalPages || 1);
            setTxTotal(data.pagination?.totalTransactions || 0);
        } catch (err) {
            setTxError(err?.response?.data?.message || "Could not load transactions");
        } finally {
            setTxLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await exportReport();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Export failed");
        }
    };

    // ---------------- derived ----------------

    const series = useMemo(() => fillDailySeries(sales, rangeWindow(range)), [sales, range]);
    const rangeLabel = RANGES.find((r) => r.value === range)?.label.toLowerCase();

    const shownTransactions = transactions.filter((tx) =>
        txView === "subscription" ? tx.transactionType === "subscription" : tx.transactionType === "order"
    );

    const maxCategorySales = Math.max(1, ...categories.map((c) => Number(c.totalSales || 0)));
    const topMetric = (p) => (topBy === "quantity" ? Number(p.quantitySold || 0) : Number(p.totalSales || 0));
    const maxTop = Math.max(1, ...topProducts.map(topMetric));

    return (
        <div className="space-y-6">
            <PageHeader
                icon={ChartNoAxesCombined}
                title="Reports"
                subtitle="Sales, best sellers and payments for your shop"
                actions={
                    <>
                        <Select
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            options={RANGES}
                            aria-label="Date range"
                            className="w-44"
                        />
                        <Button variant="secondary" icon={Download} onClick={handleExport}>Export CSV</Button>
                    </>
                }
            />

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={IndianRupee} label="Total sales" hint={rangeLabel} value={formatMoney(summary?.totalSales)} loading={summaryLoading} />
                <StatCard icon={ReceiptText} tone="info" label="Bills" hint={rangeLabel} value={formatNumber(summary?.totalOrders)} loading={summaryLoading} />
                <StatCard icon={Calculator} tone="success" label="Average bill" hint={rangeLabel} value={formatMoney(summary?.averageOrderValue, { decimals: 2 })} loading={summaryLoading} />
                <StatCard icon={Package} tone="warning" label={`Units sold`} hint={rangeLabel} value={formatNumber(summary?.productsSold)} loading={summaryLoading} />
            </div>

            {/* Chart */}
            <Card>
                <CardHeader
                    icon={TrendingUp}
                    title="Daily sales"
                    subtitle={`Paid bills, ${rangeLabel}`}
                />
                <div className="mt-5">
                    {salesLoading ? (
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                    ) : series.every((day) => day.totalSales === 0) ? (
                        <EmptyState icon={TrendingUp} title="No sales in this period" message="Try a wider date range." className="py-12" />
                    ) : (
                        <SalesTrendChart data={series} height={300} />
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Top sellers */}
                <Card padded={false}>
                    <div className="p-5">
                        <CardHeader
                            icon={Trophy}
                            title={`Top selling ${term.itemsLower}`}
                            subtitle={topBy === "quantity" ? "By units sold, all time" : "By revenue, all time"}
                            action={
                                <div className="inline-flex rounded-lg border border-line bg-surface-muted p-0.5" role="tablist">
                                    {[
                                        { id: "quantity", label: "Units" },
                                        { id: "price", label: "Revenue" }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            role="tab"
                                            aria-selected={topBy === tab.id}
                                            onClick={() => setTopBy(tab.id)}
                                            className={`px-3 h-8 rounded-md text-xs font-semibold transition-colors ${topBy === tab.id ? "bg-surface text-primary shadow-xs" : "text-muted hover:text-heading"}`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            }
                        />
                    </div>

                    {topLoading ? (
                        <SkeletonRows rows={5} columns={3} />
                    ) : topProducts.length === 0 ? (
                        <EmptyState icon={Trophy} title="No sales yet" message={`Best sellers will show up after your first bills.`} className="py-10" />
                    ) : (
                        <ol className="divide-y divide-line border-t border-line">
                            {topProducts.slice(0, 10).map((product, index) => (
                                <li key={product._id} className="flex items-center gap-4 px-5 py-3">
                                    <span className="w-5 text-xs font-semibold text-faint tabular text-right">{index + 1}</span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between gap-3">
                                            <p className="text-sm font-semibold text-heading truncate">{product.productName}</p>
                                            <p className="text-sm font-semibold text-heading tabular shrink-0">
                                                {topBy === "quantity" ? `${formatNumber(product.quantitySold)} sold` : formatMoney(product.totalSales)}
                                            </p>
                                        </div>
                                        <div className="mt-1.5 flex items-center gap-3">
                                            <div className="h-1.5 flex-1 rounded-full bg-surface-hover overflow-hidden">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(3, (topMetric(product) / maxTop) * 100)}%` }} />
                                            </div>
                                            <span className="text-[11px] text-muted tabular shrink-0 w-24 text-right">
                                                {topBy === "quantity" ? formatMoney(product.totalSales) : `${formatNumber(product.quantitySold)} sold`}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </Card>

                {/* Category performance */}
                <Card padded={false}>
                    <div className="p-5">
                        <CardHeader icon={Tags} title={`${term.category} performance`} subtitle="Revenue by group, all time" />
                    </div>

                    {categoryLoading ? (
                        <SkeletonRows rows={5} columns={3} />
                    ) : categoryError ? (
                        <div className="px-5 pb-5"><ErrorState message={categoryError} /></div>
                    ) : categories.length === 0 ? (
                        <EmptyState icon={Tags} title="No data yet" message={`Sales will be grouped by ${term.category.toLowerCase()} here.`} className="py-10" />
                    ) : (
                        <ul className="divide-y divide-line border-t border-line">
                            {[...categories]
                                .sort((a, b) => Number(b.totalSales || 0) - Number(a.totalSales || 0))
                                .map((category) => (
                                    <li key={category._id} className="px-5 py-3">
                                        <div className="flex items-baseline justify-between gap-3">
                                            <p className="text-sm font-semibold text-heading truncate">{category.categoryName}</p>
                                            <p className="text-sm font-semibold text-heading tabular">{formatMoney(category.totalSales)}</p>
                                        </div>
                                        <div className="mt-1.5 flex items-center gap-3">
                                            <div className="h-1.5 flex-1 rounded-full bg-surface-hover overflow-hidden">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(3, (Number(category.totalSales || 0) / maxCategorySales) * 100)}%` }} />
                                            </div>
                                            <span className="text-[11px] text-muted tabular shrink-0 w-24 text-right">
                                                {formatNumber(category.productsSold)} units
                                            </span>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    )}
                </Card>
            </div>

            {/* Transactions */}
            <Card padded={false}>
                <div className="p-5 border-b border-line">
                    <CardHeader
                        icon={ArrowLeftRight}
                        title="Transactions"
                        subtitle="Customer bills and your plan payments"
                        action={
                            <div className="inline-flex rounded-lg border border-line bg-surface-muted p-0.5" role="tablist">
                                {[
                                    { id: "billing", label: "Bills" },
                                    { id: "subscription", label: "Plan payments" }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={txView === tab.id}
                                        onClick={() => setTxView(tab.id)}
                                        className={`px-3 h-8 rounded-md text-xs font-semibold transition-colors ${txView === tab.id ? "bg-surface text-primary shadow-xs" : "text-muted hover:text-heading"}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        }
                    />
                </div>

                <form
                    className="p-5 border-b border-line grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
                    onSubmit={(e) => { e.preventDefault(); loadTransactions(activeTxFilters(), 1); }}
                >
                    <Input className="lg:col-span-2" placeholder="Customer name" value={txFilters.customerName} onChange={(e) => setTxFilters({ ...txFilters, customerName: e.target.value })} aria-label="Customer name" />
                    <Input className="lg:col-span-2" placeholder={`${term.item} or plan`} value={txFilters.productName} onChange={(e) => setTxFilters({ ...txFilters, productName: e.target.value })} aria-label={`${term.item} or plan`} />
                    <Input type="number" placeholder="Amount" value={txFilters.amount} onChange={(e) => setTxFilters({ ...txFilters, amount: e.target.value })} aria-label="Amount" />
                    <Input type="date" value={txFilters.date} onChange={(e) => setTxFilters({ ...txFilters, date: e.target.value })} aria-label="Date" />
                    <Select className="lg:col-span-2" value={txFilters.status} onChange={(e) => setTxFilters({ ...txFilters, status: e.target.value })} aria-label="Status"
                        options={[{ value: "all", label: "Any status" }, "Paid", "Pending", "Failed"]} />
                    <Select className="lg:col-span-2" value={txFilters.type} onChange={(e) => setTxFilters({ ...txFilters, type: e.target.value })} aria-label="Payment type"
                        options={[{ value: "all", label: "Any payment type" }, "Cash", "Card", "UPI", "Razorpay"]} />
                    <div className="lg:col-span-2 flex gap-2">
                        <Button type="submit" icon={Filter} className="flex-1 h-11">Apply</Button>
                        <Button variant="secondary" icon={RotateCcw} className="h-11" onClick={() => { setTxFilters(EMPTY_TX_FILTERS); loadTransactions({}, 1); }}>
                            Reset
                        </Button>
                    </div>
                </form>

                {txLoading ? (
                    <SkeletonRows rows={6} columns={6} />
                ) : txError ? (
                    <div className="p-5"><ErrorState message={txError} onRetry={() => loadTransactions(activeTxFilters(), txPage)} /></div>
                ) : shownTransactions.length === 0 ? (
                    <EmptyState icon={ArrowLeftRight} title="No transactions" message="Nothing matches these filters on this page." className="py-10" />
                ) : (
                    <div className="overflow-x-auto thin-scrollbar">
                        <table className="w-full min-w-[880px] text-sm">
                            <thead>
                                <tr className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                                    <th className="py-3 px-5">Reference</th>
                                    <th className="py-3 px-3">Customer</th>
                                    <th className="py-3 px-3">{txView === "billing" ? term.items : "Plan"}</th>
                                    <th className="py-3 px-3 text-right">Amount</th>
                                    <th className="py-3 px-3">Status</th>
                                    <th className="py-3 px-3">Date</th>
                                    <th className="py-3 px-5">Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {shownTransactions.map((tx) => {
                                    const status = tx.status?.toLowerCase();
                                    return (
                                        <tr key={`${tx.transactionType}-${tx.transactionId}`} className="hover:bg-surface-hover">
                                            <td className="py-3 px-5 font-mono text-xs text-heading">{tx.transactionId || "—"}</td>
                                            <td className="py-3 px-3 text-body">{tx.customerName || "—"}</td>
                                            <td className="py-3 px-3 text-body max-w-[240px] truncate">{tx.transactionName || "—"}</td>
                                            <td className="py-3 px-3 text-right font-semibold text-heading tabular">{formatMoney(tx.amount, { decimals: 2 })}</td>
                                            <td className="py-3 px-3">
                                                <Badge size="sm" dot tone={status === "paid" ? "success" : status === "failed" ? "danger" : "warning"}>
                                                    {tx.status || "—"}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-3 text-muted tabular">
                                                {tx.date ? new Date(tx.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                            </td>
                                            <td className="py-3 px-5"><Badge size="sm">{tx.type || "—"}</Badge></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {txTotal > 0 && !txLoading && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-line px-5 py-3">
                        <p className="text-xs text-muted tabular">
                            Page {txPage} of {txTotalPages} · {formatNumber(txTotal)} transactions
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary" disabled={txPage <= 1} onClick={() => loadTransactions(activeTxFilters(), txPage - 1)}>Previous</Button>
                            <Button size="sm" variant="secondary" disabled={txPage >= txTotalPages} onClick={() => loadTransactions(activeTxFilters(), txPage + 1)}>Next</Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
