import { useEffect, useState } from "react";
import { getAdminDashboard } from "../services/adminService";

import {
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getAdminDashboard();
                setDashboardData(response);

            } catch (err) {
                console.log(err);
                setError(err?.response?.data?.message || "Something went Wrong")
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading dashboard...
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-red-500">
                    {error}
                </p>
            </div>
        )
    }

    const boxData = [
        {
            item: 1,
            name: "Total Customers",
            number: dashboardData?.stats?.totalCustomers
        },
        {
            item: 2,
            name: "Active Customers",
            number: dashboardData?.stats?.activeCustomers
        },
        {
            item: 3,
            name: "Inactive Customers",
            number: dashboardData?.stats?.inactiveCustomers
        },
        {
            item: 4,
            name: "Active Subscriptions",
            number: dashboardData?.stats?.activeSubscriptions
        },
        {
            item: 5,
            name: "Expired Subscriptions",
            number: dashboardData?.stats?.expiredSubscriptions
        },
        {
            item: 6,
            name: "Pending Subscriptions",
            number: dashboardData?.stats?.pendingSubscriptions
        },
        {
            item: 7,
            name: "Total Revenue",
            number: `₹${dashboardData?.stats?.totalRevenue ?? 0}`
        }
    ]

    const monthlyRevenueData =
        dashboardData?.monthlyRevenue?.map((item) => ({
            month: new Date(
                item.year,
                item.month - 1
            ).toLocaleString("en-US", {
                month: "short"
            }),
            revenue: item.revenue
        })) || [];

    return (
        <div className="min-h-screen">

            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">

                <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                        Admin Dashboard
                    </h1>

                    <p className="text-xs text-gray-500 mt-0.5">
                        Manage your MediStock platform
                    </p>
                </div>

            </header>


            {/* Content */}
            <div className="p-6">

                {/* Statics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {boxData.map((items) => {
                        return (
                            <div key={items.item} className="bg-white rounded-xl border border-gray-200 p-5">
                                <p className="text-sm text-gray-500">
                                    {items.name}
                                </p>
                                <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                    {items.number}
                                </h2>
                            </div>
                        )
                    })}
                </div>

                {/* Monthly Revenue */}
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">

                    <div className="mb-5">

                        <h2 className="text-lg font-semibold text-gray-900">
                            Monthly Revenue
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Revenue generated from subscriptions over the last 12 months.
                        </p>

                    </div>


                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead>

                                <tr className="border-b border-gray-200">

                                    <th className="text-left text-xs font-semibold text-gray-500 py-3">
                                        Month
                                    </th>

                                    <th className="text-left text-xs font-semibold text-gray-500 py-3">
                                        Subscriptions
                                    </th>

                                    <th className="text-left text-xs font-semibold text-gray-500 py-3">
                                        Revenue
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {dashboardData?.monthlyRevenue?.map((item) => (

                                    <tr
                                        key={`${item.year}-${item.month}`}
                                        className="border-b border-gray-100 last:border-0"
                                    >

                                        <td className="py-3 text-sm text-gray-700">
                                            {item.monthName} {item.year}
                                        </td>

                                        <td className="py-3 text-sm text-gray-700">
                                            {item.subscriptions}
                                        </td>

                                        <td className="py-3 text-sm font-semibold text-gray-900">
                                            ₹{item.revenue}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* Subscription Alert */}
                <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100">

                        <h2 className="text-lg font-semibold text-gray-900">
                            Subscription Alerts
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Important subscription activity that needs attention
                        </p>

                    </div>


                    {/* Alerts */}
                    <div className="divide-y divide-gray-100">

                        {/* Expiring */}
                        <div className="px-6 py-5 flex items-center justify-between gap-4">

                            <div className="flex items-center gap-4">

                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">

                                    <span className="text-lg text-amber-600">
                                        ⚠
                                    </span>

                                </div>

                                <div>

                                    <p className="text-sm font-semibold text-gray-900">
                                        Expiring subscriptions
                                    </p>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Subscriptions expire within the next 7 days
                                    </p>

                                </div>

                            </div>


                            <div className="flex items-center gap-2 flex-shrink-0">

                                <span className="text-lg font-bold text-amber-600">
                                    {dashboardData?.subscriptionAlerts?.expiringWithin7Days || 0}
                                </span>

                                <span className="hidden sm:block text-xs text-gray-400">
                                    subscriptions
                                </span>

                            </div>

                        </div>


                        {/* Expired */}
                        <div className="px-6 py-5 flex items-center justify-between gap-4">

                            <div className="flex items-center gap-4">

                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">

                                    <span className="text-lg text-red-600">
                                        ⚠
                                    </span>

                                </div>

                                <div>

                                    <p className="text-sm font-semibold text-gray-900">
                                        Expired subscriptions
                                    </p>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Customers currently have expired subscriptions
                                    </p>

                                </div>

                            </div>


                            <div className="flex items-center gap-2 flex-shrink-0">

                                <span className="text-lg font-bold text-red-600">
                                    {dashboardData?.subscriptionAlerts?.expiredCustomers || 0}
                                </span>

                                <span className="hidden sm:block text-xs text-gray-400">
                                    customers
                                </span>

                            </div>

                        </div>


                        {/* New subscriptions */}
                        <div className="px-6 py-5 flex items-center justify-between gap-4">

                            <div className="flex items-center gap-4">

                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">

                                    <span className="text-lg text-green-600">
                                        ✓
                                    </span>

                                </div>

                                <div>

                                    <p className="text-sm font-semibold text-gray-900">
                                        New subscriptions
                                    </p>

                                    <p className="text-xs text-gray-500 mt-1">
                                        New subscriptions created this month
                                    </p>

                                </div>

                            </div>


                            <div className="flex items-center gap-2 flex-shrink-0">

                                <span className="text-lg font-bold text-green-600">
                                    {dashboardData?.subscriptionAlerts?.newSubscriptionsThisMonth || 0}
                                </span>

                                <span className="hidden sm:block text-xs text-gray-400">
                                    subscriptions
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Monthly revenu */}
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">

                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Monthly Revenue
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Revenue generated from subscriptions over the last 12 months
                        </p>
                    </div>

                    <div className="w-full h-[350px]">

                        <ResponsiveContainer width="100%" height="100%">

                            <LineChart data={monthlyRevenueData}>

                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="month"
                                />

                                <YAxis />

                                <Tooltip
                                    formatter={(value) => [
                                        `₹${value.toLocaleString("en-IN")}`,
                                        "Revenue"
                                    ]}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                {/* Customer Growth Charts */}
                <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="px-6 pt-6">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Customer Growth
                                </p>

                                <div className="flex items-end gap-3 mt-2">

                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {dashboardData?.stats?.totalCustomers || 0}
                                    </h2>

                                    <span className="mb-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-600">
                                        +12.5%
                                    </span>

                                </div>

                                <p className="text-xs text-gray-400 mt-1">
                                    Total registered customers
                                </p>
                            </div>


                            {/* Period buttons */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">

                                <button
                                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-white text-gray-900 shadow-sm"
                                >
                                    12M
                                </button>

                                <button
                                    className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-500 hover:text-gray-900"
                                >
                                    6M
                                </button>

                                <button
                                    className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-500 hover:text-gray-900"
                                >
                                    30D
                                </button>

                            </div>

                        </div>

                    </div>


                    {/* Chart */}
                    <div className="px-4 sm:px-6 pt-6 pb-5">

                        <div className="h-[320px] w-full">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <AreaChart
                                    data={dashboardData?.customerGrowth || []}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -20,
                                        bottom: 0
                                    }}
                                >

                                    <defs>

                                        <linearGradient
                                            id="customerGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >

                                            <stop
                                                offset="0%"
                                                stopColor="#2563eb"
                                                stopOpacity={0.30}
                                            />

                                            <stop
                                                offset="100%"
                                                stopColor="#2563eb"
                                                stopOpacity={0.02}
                                            />

                                        </linearGradient>

                                    </defs>


                                    <CartesianGrid
                                        vertical={false}
                                        stroke="#f1f5f9"
                                    />


                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fontSize: 12,
                                            fill: "#94a3b8"
                                        }}
                                    />


                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                        tick={{
                                            fontSize: 12,
                                            fill: "#94a3b8"
                                        }}
                                    />


                                    <Tooltip
                                        cursor={{
                                            stroke: "#cbd5e1",
                                            strokeDasharray: "4 4"
                                        }}
                                        content={({ active, payload, label }) => {

                                            if (!active || !payload?.length) {
                                                return null;
                                            }

                                            return (
                                                <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">

                                                    <p className="text-xs text-gray-400 mb-1">
                                                        {label}
                                                    </p>

                                                    <p className="text-lg font-bold text-gray-900">
                                                        {payload[0].value}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        New customers
                                                    </p>

                                                </div>
                                            );

                                        }}
                                    />


                                    <Area
                                        type="monotone"
                                        dataKey="customers"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        fill="url(#customerGradient)"
                                        activeDot={{
                                            r: 6,
                                            strokeWidth: 3,
                                            stroke: "#ffffff"
                                        }}
                                    />

                                </AreaChart>

                            </ResponsiveContainer>

                        </div>

                    </div>


                    {/* Bottom information */}
                    <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        <div className="flex items-center gap-2">

                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>

                            <span className="text-xs text-gray-500">
                                New customers
                            </span>

                        </div>

                        <p className="text-xs text-gray-400">
                            Based on customer registration data
                        </p>

                    </div>

                </div>


            </div>

        </div>
    );
}

