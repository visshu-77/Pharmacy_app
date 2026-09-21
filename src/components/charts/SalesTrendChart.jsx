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

import { useTheme } from "../../context/ThemeContext";
import { useBusiness } from "../../context/BusinessContext";

/** Read a channel token ("37 99 235") from :root and return rgb(). */
const readToken = (name) => {
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`--color-${name}`)
        .trim();

    return value ? `rgb(${value.split(/\s+/).join(",")})` : undefined;
};

const toKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

/**
 * Fill every day in the window so a quiet day shows as ₹0 rather than the
 * line silently skipping it.
 */
export const fillDailySeries = (rows = [], { from, to }) => {
    const byDay = new Map(rows.map((row) => [row._id, row]));
    const result = [];

    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);

    const end = new Date(to);
    end.setHours(0, 0, 0, 0);

    while (cursor <= end) {
        const key = toKey(cursor);
        const row = byDay.get(key);

        result.push({
            date: key,
            totalSales: Number(row?.totalSales || 0),
            totalOrders: Number(row?.totalOrders || 0)
        });

        cursor.setDate(cursor.getDate() + 1);
    }

    return result;
};

/** Short axis labels in Indian units: 1.2K, 3.4L, 1.1Cr. */
export const compact = (value) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
    return String(Math.round(value));
};

function ChartTooltip({ active, payload, formatMoney }) {
    if (!active || !payload?.length) return null;

    const point = payload[0].payload;

    return (
        <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-md">
            <p className="text-[11px] font-medium text-muted">
                {new Date(point.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short"
                })}
            </p>
            <p className="text-sm font-bold text-heading tabular mt-0.5">
                {formatMoney(point.totalSales)}
            </p>
            <p className="text-[11px] text-muted tabular">
                {point.totalOrders} order{point.totalOrders === 1 ? "" : "s"}
            </p>
        </div>
    );
}

/**
 * Single-series daily sales area. No legend — the card title names it.
 */
export default function SalesTrendChart({ data, height = 260 }) {

    const { theme } = useTheme();
    const { formatMoney, currencySymbol } = useBusiness();

    const [colors, setColors] = useState({});

    // Re-read tokens whenever the theme flips; dark mode has its own series step.
    useEffect(() => {
        setColors({
            series: readToken("chart-1"),
            grid: readToken("line"),
            axis: readToken("muted")
        });
    }, [theme]);

    const gradientId = useMemo(
        () => `sales-fill-${Math.random().toString(36).slice(2, 8)}`,
        []
    );

    const tickEvery = Math.max(1, Math.ceil(data.length / 7));

    return (
        <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.series} stopOpacity={0.18} />
                            <stop offset="100%" stopColor={colors.series} stopOpacity={0.02} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid vertical={false} stroke={colors.grid} strokeWidth={1} />

                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        interval={tickEvery - 1}
                        tick={{ fill: colors.axis, fontSize: 11 }}
                        tickFormatter={(value) =>
                            new Date(value).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short"
                            })
                        }
                        dy={6}
                    />

                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={56}
                        tick={{ fill: colors.axis, fontSize: 11 }}
                        tickFormatter={(value) => `${currencySymbol}${compact(value)}`}
                        allowDecimals={false}
                    />

                    <Tooltip
                        cursor={{ stroke: colors.axis, strokeWidth: 1 }}
                        content={<ChartTooltip formatMoney={formatMoney} />}
                    />

                    <Area
                        type="monotone"
                        dataKey="totalSales"
                        stroke={colors.series}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill={`url(#${gradientId})`}
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: colors.series,
                            stroke: readToken("surface"),
                            strokeWidth: 2
                        }}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
