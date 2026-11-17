import {
    Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
    Tooltip, XAxis, YAxis
} from "recharts";
import { BarChart3, CalendarRange, Download, Printer } from "lucide-react";

import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Card, { CardHeader } from "../ui/Card";
import { Input, Select } from "../ui/Field";
import StatCard from "../ui/StatCard";
import { EmptyState, Spinner } from "../ui/State";

const dateLabel = (value) => value
    ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";
const percent = (value) => `${Number(value || 0).toFixed(1)}%`;

function ReportTable({ title, columns, rows, emptyMessage }) {
    return (
        <Card padded={false}>
            <div className="px-5 py-4"><CardHeader title={title} /></div>
            {rows?.length ? (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-sm">
                        <thead><tr className="border-y border-line text-left text-xs text-muted">
                            {columns.map(([key, label, align]) => <th key={key} className={`px-4 py-3 ${align === "right" ? "text-right" : ""}`}>{label}</th>)}
                        </tr></thead>
                        <tbody className="divide-y divide-line">
                            {rows.map((row, index) => (
                                <tr key={row._id || row.source || row.employee || row.status || row.customerName || index}>
                                    {columns.map(([key, , align]) => <td key={key} className={`px-4 py-3 ${align === "right" ? "text-right tabular-nums" : ""}`}>{row[key] ?? "—"}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <EmptyState icon={BarChart3} title="No report data" message={emptyMessage} className="py-7" />}
        </Card>
    );
}

export default function LeadReportsPanel({
    report, loading, filters, setFilters, onApply, onExport, page, setPage, formatMoney
}) {
    const summary = report?.summary;
    const cards = [
        ["Total leads", summary?.totalLeads || 0],
        ["New leads", summary?.newLeads || 0],
        ["Completed leads", summary?.completedLeads || 0],
        ["Converted leads", summary?.convertedLeads || 0],
        ["Lost leads", summary?.lostLeads || 0],
        ["Conversion rate", percent(summary?.conversionRate)],
        ["Expected pipeline", formatMoney(summary?.expectedPipelineRevenue || 0)],
        ["Converted deal value", formatMoney(summary?.convertedDealValue || 0)],
        ["Recorded income", formatMoney(summary?.confirmedIncome || 0)],
        ["Pending follow-ups", summary?.pendingFollowUps || 0],
        ["Overdue follow-ups", summary?.overdueFollowUps || 0]
    ];

    return (
        <div className="space-y-5">
            <Card className="no-print">
                <form onSubmit={onApply} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <Select
                        label="Reporting period"
                        value={filters.period}
                        onChange={(event) => setFilters({ ...filters, period: event.target.value, from: "", to: "" })}
                        options={[
                            { value: "daily", label: "Daily" },
                            { value: "weekly", label: "Weekly" },
                            { value: "monthly", label: "Monthly" },
                            { value: "yearly", label: "Yearly" }
                        ]}
                    />
                    <Input label="From" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
                    <Input label="To" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
                    <div className="flex flex-wrap gap-2 xl:col-span-2">
                        <Button type="submit" icon={CalendarRange}>Apply date range</Button>
                        <Button variant="secondary" icon={Download} onClick={onExport}>Export CSV</Button>
                        <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
                    </div>
                </form>
                <p className="mt-3 text-xs text-muted">
                    Lead totals use the lead creation date; converted deal value uses the conversion date. Recorded income includes confirmed Expense transactions only.
                </p>
            </Card>

            {loading ? <Spinner /> : !report ? (
                <EmptyState icon={BarChart3} title="Reports unavailable" message="CRM analytics could not be loaded." />
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                        {cards.map(([label, value]) => <StatCard key={label} icon={BarChart3} label={label} value={String(value)} compact />)}
                    </div>
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        <Card>
                            <CardHeader title="Daily lead generation" subtitle="Last 31 days in this reporting range" />
                            <div className="mt-3 h-[270px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={report.dailyLeadGeneration}>
                                        <CartesianGrid vertical={false} stroke="rgb(var(--color-line))" />
                                        <XAxis dataKey="_id" tickFormatter={(value) => value.slice(5)} tickLine={false} axisLine={false} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Leads" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card>
                            <CardHeader title="Monthly lead generation" />
                            <div className="mt-3 h-[270px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={report.monthlyLeadGeneration}>
                                        <CartesianGrid vertical={false} stroke="rgb(var(--color-line))" />
                                        <XAxis dataKey="_id" tickLine={false} axisLine={false} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Leads" fill="#0d9488" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card>
                            <CardHeader title="Lead source performance" subtitle="Lead volume and conversion rate by source" />
                            <div className="mt-3 h-[290px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={report.sourceAnalytics} layout="vertical">
                                        <CartesianGrid horizontal={false} stroke="rgb(var(--color-line))" />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis type="category" dataKey="source" width={100} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="totalLeads" name="Leads" fill="#2563eb" />
                                        <Bar dataKey="convertedLeads" name="Converted" fill="#16a34a" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card>
                            <CardHeader title="Status distribution" />
                            {report.statusReports.length ? (
                                <div className="mt-3 h-[290px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={report.statusReports} dataKey="count" nameKey="status" innerRadius={55} outerRadius={100}>
                                                {report.statusReports.map((item) => <Cell key={item.status} fill={item.color} />)}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : <EmptyState icon={BarChart3} title="No status data" message="Leads will appear here." />}
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        <ReportTable title="Source-wise analytics" rows={report.sourceAnalytics.map((row) => ({
                            ...row,
                            conversionRateLabel: percent(row.conversionRate),
                            expectedRevenue: formatMoney(row.expectedPipelineRevenue),
                            convertedValue: formatMoney(row.convertedDealValue)
                        }))} columns={[
                            ["source", "Source"], ["totalLeads", "Leads", "right"],
                            ["convertedLeads", "Converted", "right"], ["conversionRateLabel", "Rate", "right"],
                            ["expectedRevenue", "Expected pipeline", "right"], ["convertedValue", "Deal value", "right"]
                        ]} emptyMessage="There are no leads for this date range." />
                        <ReportTable title="Status-wise pipeline" rows={report.statusReports.map((row) => ({
                            ...row, expectedValue: formatMoney(row.expectedPipelineRevenue)
                        }))} columns={[
                            ["status", "Status"], ["count", "Leads", "right"], ["expectedValue", "Expected pipeline", "right"]
                        ]} emptyMessage="There are no leads for this date range." />
                        <ReportTable title="Employee performance" rows={report.employeePerformance.map((row) => ({
                            ...row,
                            conversionRateLabel: percent(row.conversionRate),
                            dealValue: formatMoney(row.convertedDealValue)
                        }))} columns={[
                            ["employee", "Employee"], ["totalAssignedLeads", "Assigned", "right"],
                            ["contacted", "Contacted", "right"], ["qualified", "Qualified", "right"],
                            ["completed", "Completed", "right"], ["converted", "Converted", "right"], ["lost", "Lost", "right"],
                            ["pendingFollowUps", "Follow-ups", "right"], ["conversionRateLabel", "Rate", "right"],
                            ["dealValue", "Deal value", "right"]
                        ]} emptyMessage="No assigned employee activity in this range." />
                        <Card>
                            <CardHeader title="Follow-up performance" subtitle="Scheduled-date range" />
                            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    ["Scheduled", report.followUpPerformance.scheduled],
                                    ["Completed", report.followUpPerformance.completed],
                                    ["Pending", report.followUpPerformance.pending],
                                    ["Completion rate", percent(report.followUpPerformance.completionRate)]
                                ].map(([label, value]) => <div key={label} className="rounded-lg bg-surface-muted p-3"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-lg font-bold text-heading">{value}</p></div>)}
                            </div>
                            <p className="mt-3 text-sm text-body">Average conversion time: <strong>{Number(report.summary.averageConversionDays || 0).toFixed(1)} days</strong></p>
                        </Card>
                        <ReportTable title="Lost lead reasons" rows={report.lostReasons.map((row) => ({ reason: row._id, count: row.count }))} columns={[
                            ["reason", "Reason"], ["count", "Lost leads", "right"]
                        ]} emptyMessage="No lost leads in this range." />
                        <ReportTable title="Converted leads" rows={report.conversions.map((row) => ({
                            ...row,
                            conversionDateLabel: dateLabel(row.conversionDate),
                            dealAmount: formatMoney(row.finalDealAmount)
                        }))} columns={[
                            ["customerName", "Customer"], ["source", "Source"], ["responsibleEmployee", "Employee"],
                            ["conversionDateLabel", "Converted"], ["dealAmount", "Deal value", "right"]
                        ]} emptyMessage="No conversions in this range." />
                        <ReportTable title="Lost leads" rows={report.lostLeads.map((row) => ({
                            ...row,
                            lostDateLabel: dateLabel(row.lostAt || row.updatedAt),
                            reasonLabel: <Badge tone="danger">{row.lostReason || "Unspecified"}</Badge>
                        }))} columns={[
                            ["customerName", "Customer"], ["source", "Source"], ["assignedEmployee", "Employee"],
                            ["reasonLabel", "Reason"], ["lostDateLabel", "Lost"]
                        ]} emptyMessage="No lost leads in this range." />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 no-print">
                        <p className="text-xs text-muted">Converted: {report.conversionPage.total} · Lost: {report.lostPage.total}</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous page</Button>
                            <Button size="sm" variant="secondary" disabled={!report.conversionPage.hasMore && !report.lostPage.hasMore} onClick={() => setPage(page + 1)}>Next page</Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
