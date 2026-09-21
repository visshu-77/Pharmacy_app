import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    IndianRupee,
    ReceiptText,
    TrendingUp,
    Wallet,
    PackageMinus,
    PackageX,
    CalendarClock,
    CalendarX2,
    Package,
    Tags,
    Truck,
    Plus,
    ScanBarcode,
    ArrowRight,
    Trophy,
    CheckCircle2
} from "lucide-react";

import Card, { CardHeader } from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import { Breadcrumbs } from "../components/ui/PageHeader";
import { Skeleton, EmptyState } from "../components/ui/State";
import SalesTrendChart, { fillDailySeries } from "../components/charts/SalesTrendChart";

import { getDashboardSummary } from "../services/dashboardService";
import { getTopSellingProducts, getSalesOverview } from "../services/reportService";
import { useBusiness } from "../context/BusinessContext";

const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
};

export default function Dashboard() {

    const {
        profile,
        term,
        shopName,
        ownerName,
        formatMoney,
        formatNumber,
        lowStockThreshold
    } = useBusiness();

    const [summary, setSummary] = useState({});
    const [summaryLoading, setSummaryLoading] = useState(true);

    const [topProducts, setTopProducts] = useState([]);
    const [topLoading, setTopLoading] = useState(true);

    const [sales, setSales] = useState([]);
    const [salesLoading, setSalesLoading] = useState(true);

    useEffect(() => {
        getDashboardSummary()
            .then((data) => setSummary(data.summary || {}))
            .catch((err) => console.log("Dashboard summary:", err))
            .finally(() => setSummaryLoading(false));

        getTopSellingProducts("quantity")
            .then((data) => setTopProducts(data.products || []))
            .catch((err) => console.log("Top products:", err))
            .finally(() => setTopLoading(false));

        getSalesOverview("last14Days")
            .then((data) => setSales(data.sales || []))
            .catch((err) => console.log("Sales overview:", err))
            .finally(() => setSalesLoading(false));
    }, []);

    const series = useMemo(() => {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 13);
        return fillDailySeries(sales, { from, to });
    }, [sales]);

    const fortnightTotal = series.reduce((sum, day) => sum + day.totalSales, 0);

    const alerts = [
        {
            key: "low",
            icon: PackageMinus,
            label: "Low stock",
            hint: `At or below ${lowStockThreshold} units`,
            value: summary.lowStock || 0,
            tone: "warning"
        },
        {
            key: "out",
            icon: PackageX,
            label: "Out of stock",
            hint: "Can't be billed right now",
            value: summary.outOfStock || 0,
            tone: "danger"
        },
        ...(profile.tracksExpiry
            ? [
                {
                    key: "soon",
                    icon: CalendarClock,
                    label: "Expiring soon",
                    hint: "Within the next 30 days",
                    value: summary.expiringSoon || 0,
                    tone: "warning"
                },
                {
                    key: "expired",
                    icon: CalendarX2,
                    label: "Expired",
                    hint: "Remove from shelves",
                    value: summary.expired || 0,
                    tone: "danger"
                }
            ]
            : [])
    ];

    const attentionCount = alerts.reduce((sum, alert) => sum + alert.value, 0);

    const BusinessIcon = profile.icon;
    const firstName = ownerName?.split(" ")[0];

    return (
        <div className="space-y-6">

            <Breadcrumbs />

            {/* ---------------- Hero ---------------- */}
            <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#1e3a8a_0%,#2563eb_55%,#4f46e5_100%)] text-white shadow-lg">
                <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
                <div className="pointer-events-none absolute right-24 -bottom-24 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" aria-hidden="true" />

                <div className="relative p-6 sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white/90">
                                <BusinessIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                {profile.shortLabel}
                            </span>

                            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                {greeting()}{firstName ? `, ${firstName}` : ""} 👋
                            </h1>

                            <p className="mt-1.5 text-sm text-white/75">
                                Here's how <span className="font-semibold text-white">{shopName}</span> is doing today.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                to="/billing"
                                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-primary text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                <ScanBarcode className="h-4 w-4" />
                                New sale
                            </Link>

                            <Link
                                to="/product"
                                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-white/30 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Add {term.itemLower}
                            </Link>
                        </div>
                    </div>

                    <dl className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl bg-white/15">
                        {[
                            { label: "Today's revenue", value: formatMoney(summary.todaysRevenue) },
                            { label: "Bills today", value: formatNumber(summary.ordersToday) },
                            { label: "This month", value: formatMoney(summary.monthlyRevenue) },
                            { label: "This year", value: formatMoney(summary.yearlyRevenue) }
                        ].map((item) => (
                            <div key={item.label} className="bg-white/[0.06] backdrop-blur-sm px-4 py-4 sm:px-5">
                                <dt className="text-[11px] font-medium uppercase tracking-wider text-white/65">
                                    {item.label}
                                </dt>
                                <dd className="mt-1 text-xl sm:text-2xl font-bold tabular text-white truncate">
                                    {summaryLoading ? <span className="inline-block h-7 w-20 rounded bg-white/20 animate-pulse" /> : item.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* ---------------- Inventory at a glance ---------------- */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Package}
                    label={`Total ${term.itemsLower}`}
                    value={formatNumber(summary.totalProducts)}
                    loading={summaryLoading}
                    to="/product"
                />
                <StatCard
                    icon={Wallet}
                    label="Stock value (at cost)"
                    value={formatMoney(summary.stockValue)}
                    loading={summaryLoading}
                    tone="success"
                />
                <StatCard
                    icon={Tags}
                    label={term.categories}
                    value={formatNumber(summary.totalCategories)}
                    loading={summaryLoading}
                    tone="info"
                    to="/category"
                />
                <StatCard
                    icon={Truck}
                    label={term.suppliers}
                    value={formatNumber(summary.totalSuppliers)}
                    loading={summaryLoading}
                    tone="neutral"
                    to="/suppliers"
                />
            </section>

            {/* ---------------- Chart + alerts ---------------- */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2">
                    <CardHeader
                        icon={TrendingUp}
                        title="Sales, last 14 days"
                        subtitle={salesLoading ? "Loading…" : `${formatMoney(fortnightTotal)} total`}
                        action={
                            <Button to="/reports" variant="ghost" size="sm" iconRight={ArrowRight}>
                                Reports
                            </Button>
                        }
                    />

                    <div className="mt-5">
                        {salesLoading ? (
                            <Skeleton className="h-[260px] w-full rounded-xl" />
                        ) : fortnightTotal === 0 ? (
                            <EmptyState
                                icon={IndianRupee}
                                title="No sales in the last 14 days"
                                message="Your daily sales will chart here as soon as you create your first bill."
                                action={<Button to="/billing" icon={ReceiptText}>Create a bill</Button>}
                                className="py-10"
                            />
                        ) : (
                            <SalesTrendChart data={series} />
                        )}
                    </div>
                </Card>

                <Card>
                    <CardHeader
                        title="Needs attention"
                        subtitle={
                            summaryLoading
                                ? "Checking stock…"
                                : attentionCount === 0
                                    ? "Everything looks healthy"
                                    : `${formatNumber(attentionCount)} ${attentionCount === 1 ? term.itemLower : term.itemsLower} to review`
                        }
                    />

                    <ul className="mt-4 space-y-2">
                        {alerts.map(({ key, icon: Icon, label, hint, value, tone }) => {
                            const active = value > 0;
                            const toneClass = !active
                                ? "bg-surface-hover text-faint"
                                : tone === "danger"
                                    ? "bg-danger/10 text-danger"
                                    : "bg-warning/10 text-warning";

                            return (
                                <li key={key}>
                                    <Link
                                        to="/product"
                                        className="flex items-center gap-3 rounded-xl border border-line px-3 py-3 hover:bg-surface-hover transition-colors"
                                    >
                                        <span className={`grid place-items-center h-9 w-9 shrink-0 rounded-lg ${toneClass}`}>
                                            <Icon className="h-4 w-4" aria-hidden="true" />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-heading">{label}</p>
                                            <p className="text-xs text-muted truncate">{hint}</p>
                                        </div>

                                        {summaryLoading ? (
                                            <Skeleton className="h-5 w-8" />
                                        ) : (
                                            <span className={`text-lg font-bold tabular ${active ? "text-heading" : "text-faint"}`}>
                                                {formatNumber(value)}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {!summaryLoading && attentionCount === 0 && (
                        <p className="mt-4 flex items-center gap-2 text-xs text-success font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            No stock alerts right now
                        </p>
                    )}
                </Card>
            </section>

            {/* ---------------- Top sellers ---------------- */}
            <Card padded={false}>
                <div className="p-5 pb-0">
                    <CardHeader
                        icon={Trophy}
                        title={`Top selling ${term.itemsLower}`}
                        subtitle="By units sold, all time"
                        action={
                            <Button to="/reports" variant="ghost" size="sm" iconRight={ArrowRight}>
                                See all
                            </Button>
                        }
                    />
                </div>

                <div className="mt-4">
                    {topLoading ? (
                        <div className="px-5 pb-5 space-y-3">
                            {[0, 1, 2, 3].map((row) => <Skeleton key={row} className="h-10 w-full" />)}
                        </div>
                    ) : topProducts.length === 0 ? (
                        <EmptyState
                            icon={Trophy}
                            title="No sales yet"
                            message={`Your best selling ${term.itemsLower} will appear here once you start billing.`}
                            className="py-10"
                        />
                    ) : (
                        <ol className="divide-y divide-line">
                            {topProducts.slice(0, 5).map((product, index) => {
                                const max = Number(topProducts[0]?.quantitySold || 1);
                                const share = Math.max(4, (Number(product.quantitySold || 0) / max) * 100);

                                return (
                                    <li key={product._id} className="flex items-center gap-4 px-5 py-3.5">
                                        <span
                                            className={[
                                                "grid place-items-center h-8 w-8 shrink-0 rounded-lg text-xs font-bold",
                                                index === 0 ? "bg-warning/15 text-warning" : "bg-surface-hover text-muted"
                                            ].join(" ")}
                                        >
                                            {index + 1}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline justify-between gap-3">
                                                <p className="text-sm font-semibold text-heading truncate">
                                                    {product.productName}
                                                </p>
                                                <p className="text-sm font-semibold text-heading tabular shrink-0">
                                                    {formatMoney(product.totalSales)}
                                                </p>
                                            </div>

                                            <div className="mt-1.5 flex items-center gap-3">
                                                <div className="h-1.5 flex-1 rounded-full bg-surface-hover overflow-hidden">
                                                    <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
                                                </div>
                                                <span className="text-xs text-muted tabular shrink-0 w-20 text-right">
                                                    {formatNumber(product.quantitySold)} sold
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </div>
            </Card>
        </div>
    );
}
