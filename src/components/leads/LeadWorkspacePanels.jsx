import { useState } from "react";
import { CalendarClock, Check, Clock3, GripVertical, Users } from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card, { CardHeader } from "../ui/Card";
import { EmptyState } from "../ui/State";

const dateTimeLabel = (value) => new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short"
});

export function PipelineBoard({ stages, loading, formatMoney, onMove, onMore }) {
    const [draggedLead, setDraggedLead] = useState(null);
    if (loading) return <p className="py-10 text-center text-sm text-muted">Loading pipeline…</p>;
    if (!stages.length) return <EmptyState icon={GripVertical} title="No pipeline statuses" message="Activate the default statuses to see the pipeline." />;

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto pb-2">
                <div className="flex min-h-[440px] min-w-max items-start gap-3">
                    {stages.map((stage) => (
                        <section
                            key={stage.statusId}
                            onDragOver={(event) => {
                                if (stage.active) event.preventDefault();
                            }}
                            onDrop={(event) => {
                                event.preventDefault();
                                if (stage.active && draggedLead && draggedLead.statusId !== stage.statusId) onMove(draggedLead, stage);
                                setDraggedLead(null);
                            }}
                            className="w-[280px] rounded-xl border border-line bg-surface-muted/60"
                        >
                            <header className="sticky top-0 rounded-t-xl border-b border-line bg-surface p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-heading">
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} />
                                        {stage.name}
                                    </span>
                                    <Badge>{stage.count}</Badge>
                                </div>
                                <p className="mt-1 text-xs text-muted">Expected value: {formatMoney(stage.expectedDealValue)}</p>
                            </header>
                            <div className="space-y-2 p-2">
                                {stage.leads.map((lead) => (
                                    <article
                                        key={lead._id}
                                        draggable={!stage.terminal}
                                        onDragStart={() => setDraggedLead(lead)}
                                        onDragEnd={() => setDraggedLead(null)}
                                        className="rounded-lg border border-line bg-surface p-3 shadow-sm"
                                    >
                                        <div className="flex items-start gap-2">
                                            {!stage.terminal && <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-faint" aria-label="Drag to change status" />}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-heading">{lead.customerName}</p>
                                                <p className="mt-0.5 truncate text-xs text-muted">{lead.title}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-2">
                                            <span className="text-xs font-semibold text-heading">
                                                {stage.systemKey === "completed"
                                                    ? `Final: ${lead.finalAmount == null ? "—" : formatMoney(lead.finalAmount)}`
                                                    : (lead.expectedDealValue == null ? "—" : formatMoney(lead.expectedDealValue))}
                                            </span>
                                            <Badge tone={lead.priority === "Urgent" || lead.priority === "High" ? "danger" : "neutral"} size="sm">{lead.priority}</Badge>
                                        </div>
                                        {lead.assignedEmployee && <p className="mt-2 truncate text-[11px] text-muted">{lead.assignedEmployee}</p>}
                                        {!stage.terminal && (
                                            <select
                                                aria-label={`Move ${lead.customerName} to another pipeline stage`}
                                                className="mt-2 h-8 w-full rounded-md border border-line bg-surface px-2 text-xs text-muted"
                                                value={stage.statusId}
                                                onChange={(event) => {
                                                    const targetStage = stages.find((item) => item.statusId === event.target.value);
                                                    if (targetStage) onMove(lead, targetStage);
                                                }}
                                            >
                                                {stages.filter((item) => item.active).map((item) => <option key={item.statusId} value={item.statusId}>{item.name}</option>)}
                                            </select>
                                        )}
                                    </article>
                                ))}
                                {!stage.leads.length && <p className="py-8 text-center text-xs text-muted">Drop a lead here</p>}
                                {stage.hasMore && <Button variant="ghost" size="sm" fullWidth onClick={onMore}>Load more leads</Button>}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
            <p className="text-xs text-muted">Drag a lead card to another column, or use its status menu. Converted and Lost leads are terminal.</p>
        </div>
    );
}

export function FollowUpsPanel({ view, setView, followUps, loading, onComplete, onCancel, onReschedule, page, hasMore, onNextPage }) {
    const views = [
        ["today", "Today"],
        ["upcoming", "Upcoming"],
        ["overdue", "Overdue"],
        ["completed", "Completed"]
    ];
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {views.map(([key, label]) => <Button key={key} size="sm" variant={view === key ? "soft" : "secondary"} onClick={() => setView(key)} icon={key === "today" ? CalendarClock : Clock3}>{label}</Button>)}
            </div>
            <Card padded={false}>
                <div className="px-5 py-4"><CardHeader title={`${views.find(([key]) => key === view)?.[1]} follow-ups`} subtitle="Pending reminders and completed activities" /></div>
                {loading ? <p className="py-10 text-center text-sm text-muted">Loading follow-ups…</p> : followUps.length ? (
                    <div className="divide-y divide-line">
                        {followUps.map((followUp) => (
                            <div key={followUp._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-heading">{followUp.leadId?.customerName || "Lead"} · {followUp.type}</p>
                                    <p className="mt-0.5 text-xs text-muted">{dateTimeLabel(followUp.scheduledAt)}{followUp.assignedEmployee ? ` · ${followUp.assignedEmployee}` : ""}</p>
                                    {followUp.description && <p className="mt-1 text-sm text-body">{followUp.description}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge tone={followUp.status === "Completed" ? "success" : followUp.status === "Cancelled" ? "neutral" : "warning"}>{followUp.status}</Badge>
                                    {followUp.status === "Pending" && (
                                        <>
                                            <Button size="sm" variant="secondary" onClick={() => onComplete(followUp)} icon={Check}>Complete</Button>
                                            <Button size="sm" variant="ghost" onClick={() => onReschedule(followUp)}>Reschedule</Button>
                                            <Button size="sm" variant="ghost" onClick={() => onCancel(followUp)}>Cancel</Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <EmptyState icon={CalendarClock} title="No follow-ups here" message="Scheduled follow-ups will appear in this view." className="py-8" />}
                <div className="flex items-center justify-between border-t border-line px-5 py-3">
                    <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onNextPage(page - 1)}>Previous</Button>
                    <span className="text-xs text-muted">Page {page}</span>
                    <Button size="sm" variant="secondary" disabled={!hasMore} onClick={() => onNextPage(page + 1)}>Next</Button>
                </div>
            </Card>
        </div>
    );
}

export function TeamAssignments({ employees, loading, formatMoney }) {
    return (
        <Card padded={false}>
            <div className="px-5 py-4"><CardHeader title="Employee-wise leads" subtitle="Assignment volume, pending pipeline, and conversions" /></div>
            {loading ? <p className="py-10 text-center text-sm text-muted">Loading team summary…</p> : employees.length ? (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-sm">
                        <thead><tr className="border-b border-line text-left text-xs text-muted">
                            <th className="px-5 py-3">Employee</th><th className="px-5 py-3 text-right">Total leads</th>
                            <th className="px-5 py-3 text-right">Pending</th><th className="px-5 py-3 text-right">Completed</th><th className="px-5 py-3 text-right">Converted</th>
                            <th className="px-5 py-3 text-right">Expected deal value</th>
                        </tr></thead>
                        <tbody className="divide-y divide-line">
                            {employees.map((employee) => (
                                <tr key={employee.employee}>
                                    <td className="px-5 py-3 font-medium text-heading">{employee.employee}</td>
                                    <td className="px-5 py-3 text-right text-muted">{employee.total}</td>
                                    <td className="px-5 py-3 text-right text-muted">{employee.pending}</td>
                                    <td className="px-5 py-3 text-right text-primary">{employee.completed || 0}</td>
                                    <td className="px-5 py-3 text-right text-success">{employee.converted}</td>
                                    <td className="px-5 py-3 text-right font-semibold text-heading">{formatMoney(employee.expectedDealValue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <EmptyState icon={Users} title="No assigned leads yet" message="Assign a lead to an employee to see team performance." className="py-8" />}
        </Card>
    );
}
