import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";
import {
    LayoutDashboard,
    Users,
    UserCheck,
    UserX,
    Crown,
    CalendarX2,
    Hourglass,
    IndianRupee,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Store
} from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import Card, { CardHeader } from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { Skeleton, ErrorState, EmptyState } from "../../components/ui/State";

import { getAdminDashboard } from "../services/adminService";
import { getBusinessType } from "../../config/businessTypes";
import { useTheme } from "../../context/ThemeContext";
import { compact } from "../../components/charts/SalesTrendChart";

const readToken = (name) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
    return value ? `rgb(${value.split(/\s+/).join(",")})` : undefined;
};

const inr = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

/** Single-series trend used for revenue and sign-ups. No legend: the title names it. */
function TrendChart({ data, dataKey, format, tickFormat = format, unitLabel }) {

    const { theme } = useTheme();
    const [colors, setColors] = useState({});

    useEffect(() => {
        setColors({ series: readToken("chart-1"), grid: readToken("line"), axis: readToken("muted"), surface: readToken("surface") });
    }, [theme]);

    const id = useMemo(() => `admin-fill-${dataKey}`, [dataKey]);

    return (
        <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                    <defs>
                        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.series} stopOpacity={0.18} />
                            <stop offset="100%" stopColor={colors.series} stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={colors.grid} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: colors.axis, fontSize: 11 }} dy={6} />
                    <YAxis tickLine={false} axisLine={false} width={56} allowDecimals={false} tick={{ fill: colors.axis, fontSize: 11 }} tickFormatter={tickFormat} />
                    <Tooltip
                        cursor={{ stroke: colors.axis, strokeWidth: 1 }}
                        content={({ active, payload, label }) =>
                            active && payload?.length ? (
                                <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-md">
                                    <p className="text-[11px] font-medium text-muted">{label}</p>
                                    <p className="text-sm font-bold text-heading tabular">{format(payload[0].value)}</p>
                                    <p className="text-[11px] text-muted">{unitLabel}</p>
                                </div>
                            ) : null
                        }
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={colors.series}
                        strokeWidth={2}
                        fill={`url(#${id})`}
                        dot={false}
                        activeDot={{ r: 5, fill: colors.series, stroke: colors.surface, strokeWidth: 2 }}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default function AdminDashboard() {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getAdminDashboard()
            .then(setData)
            .catch((err) => setError(err?.response?.data?.message || "Could not load dashboard"))
            .finally(() => setLoading(false));
    }, []);

    const stats = data?.stats || {};

    const revenueSeries = (data?.monthlyRevenue || []).map((item) => ({
        month: new Date(item.year, item.month - 1).toLocaleString("en-IN", { month: "short" }),
        revenue: item.revenue
    }));

    const growthSeries = data?.customerGrowth || [];
    const businessTypes = data?.businessTypes || [];
    const maxTypeCount = Math.max(1, ...businessTypes.map((t) => t.count));

    const alerts = [
        { icon: AlertTriangle, tone: "warning", label: "Expiring in 7 days", hint: "Plans that need renewal soon", value: data?.subscriptionAlerts?.expiringWithin7Days },
        { icon: CalendarX2, tone: "danger", label: "Expired", hint: "Shops without an active plan", value: data?.subscriptionAlerts?.expiredCustomers },
        { icon: CheckCircle2, tone: "success", label: "New this month", hint: "Subscriptions started", value: data?.subscriptionAlerts?.newSubscriptionsThisMonth }
    ];

    if (error) return <ErrorState message={error} />;

    return (
        <div className="space-y-6">
            <PageHeader icon={LayoutDashboard} title="Platform overview" subtitle="Every shop on StoreFlow, at a glance" breadcrumbs={false} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total shops" value={Number(stats.totalCustomers || 0).toLocaleString("en-IN")} loading={loading} to="/admin/customers" />
                <StatCard icon={UserCheck} tone="success" label="Active accounts" value={stats.activeCustomers ?? 0} loading={loading} />
                <StatCard icon={UserX} tone="danger" label="Deactivated" value={stats.inactiveCustomers ?? 0} loading={loading} />
                <StatCard icon={IndianRupee} tone="info" label="Total revenue" value={inr(stats.totalRevenue)} loading={loading} />
                <StatCard compact icon={Crown} tone="primary" label="Active plans" value={stats.activeSubscriptions ?? 0} loading={loading} />
                <StatCard compact icon={CalendarX2} tone="danger" label="Expired plans" value={stats.expiredSubscriptions ?? 0} loading={loading} />
                <StatCard compact icon={Hourglass} tone="warning" label="Pending plans" value={stats.pendingSubscriptions ?? 0} loading={loading} />
                <StatCard compact icon={Store} tone="neutral" label="Business types in use" value={businessTypes.length} loading={loading} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2">
                    <CardHeader icon={TrendingUp} title="Subscription revenue" subtitle="Last 12 months" />
                    <div className="mt-5">
                        {loading ? <Skeleton className="h-[280px] w-full rounded-xl" /> : revenueSeries.length ? (
                            <TrendChart data={revenueSeries} dataKey="revenue" format={inr} tickFormat={(v) => `₹${compact(v)}`} unitLabel="Revenue" />
                        ) : (
                            <EmptyState icon={IndianRupee} title="No revenue yet" className="py-10" />
                        )}
                    </div>
                </Card>

                <Card>
                    <CardHeader title="Plan alerts" subtitle="Needs follow-up" />
                    <ul className="mt-4 space-y-2">
                        {alerts.map(({ icon: Icon, tone, label, hint, value }) => (
                            <li key={label} className="flex items-center gap-3 rounded-xl border border-line px-3 py-3">
                                <span className={`grid place-items-center h-9 w-9 shrink-0 rounded-lg ${tone === "danger" ? "bg-danger/10 text-danger" : tone === "warning" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                                    <Icon className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-heading">{label}</p>
                                    <p className="text-xs text-muted truncate">{hint}</p>
                                </div>
                                {loading ? <Skeleton className="h-5 w-8" /> : <span className="text-lg font-bold text-heading tabular">{value || 0}</span>}
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2">
                    <CardHeader icon={Users} title="New shops per month" subtitle="Registrations, last 12 months" />
                    <div className="mt-5">
                        {loading ? <Skeleton className="h-[280px] w-full rounded-xl" /> : growthSeries.length ? (
                            <TrendChart data={growthSeries} dataKey="customers" format={(v) => Number(v).toLocaleString("en-IN")} unitLabel="New shops" />
                        ) : (
                            <EmptyState icon={Users} title="No sign-ups yet" className="py-10" />
                        )}
                    </div>
                </Card>

                <Card padded={false}>
                    <div className="p-5">
                        <CardHeader icon={Store} title="Shops by business type" subtitle="Who's using the platform" />
                    </div>
                    {loading ? (
                        <div className="px-5 pb-5 space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
                    ) : businessTypes.length === 0 ? (
                        <EmptyState icon={Store} title="No shops yet" className="py-8" />
                    ) : (
                        <ul className="divide-y divide-line border-t border-line">
                            {businessTypes.map((type) => {
                                const profile = getBusinessType(type.id);
                                const Icon = profile.icon;
                                return (
                                    <li key={type.id} className="flex items-center gap-3 px-5 py-3">
                                        <span className="grid place-items-center h-8 w-8 shrink-0 rounded-lg text-white" style={{ backgroundColor: profile.accent }}>
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <p className="text-sm font-medium text-heading truncate">{profile.shortLabel}</p>
                                                <p className="text-sm font-bold text-heading tabular">{type.count}</p>
                                            </div>
                                            <div className="mt-1.5 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${(type.count / maxTypeCount) * 100}%` }} />
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
}
