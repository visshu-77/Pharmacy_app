import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Activity, BarChart3, Bell, CalendarClock, CheckCircle2, Download, Eye, Filter,
    History, Pencil, Plus, Search, Settings2,
    Trash2, TrendingUp, UserRound, Users, WalletCards, XCircle
} from "lucide-react";
import {
    Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
    Tooltip, XAxis, YAxis
} from "recharts";

import Button, { IconButton } from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card, { CardHeader } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import Modal, { ConfirmDialog } from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import { EmptyState, Spinner } from "../components/ui/State";
import { useToast } from "../components/ui/Toast";
import { useBusiness } from "../context/BusinessContext";
import LeadForm from "../components/leads/LeadForm";
import FollowUpForm from "../components/leads/FollowUpForm";
import LeadActivityForm from "../components/leads/LeadActivityForm";
import { CompletedLeadForm, ConversionForm, LostLeadForm, RecordIncomeForm } from "../components/leads/LeadOutcomeForms";
import { FollowUpsPanel, PipelineBoard, TeamAssignments } from "../components/leads/LeadWorkspacePanels";
import LeadReportsPanel from "../components/leads/LeadReportsPanel";
import LeadSettingsPanel from "../components/leads/LeadSettingsPanel";
import {
    addLeadActivity, bulkUpdateLeads, changeLeadStatus, checkLeadDuplicates, convertLead,
    deleteLead, exportLeadReports, exportLeads, getCrmSettings, getLead, getLeadDashboard,
    getLeadDuplicates, getLeadFollowUps, getLeadNotifications, getLeadPipeline, getLeadReports,
    getLeadStatuses, getLeadTeamSummary, getLeads, markAllLeadNotificationsRead, markLeadLost,
    markLeadNotificationRead, mergeDuplicateLead, recordLeadIncome, saveCrmSetting, saveLead,
    saveLeadFollowUp, saveLeadStatus
} from "../services/leadService";

const dateLabel = (value) => value
    ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";
const shortMonth = (value) => new Date(`${value}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
const displayStatus = (lead) => lead.statusName || lead.statusId?.name || "Unknown";
const statusColor = (lead) => lead.statusColor || lead.statusId?.color || "#64748b";

function LeadTable({ rows, statuses, selected, onSelect, onSelectAll, onView, onEdit, onDelete, onStatus, onSchedule, onLogActivity }) {
    if (!rows.length) {
        return <EmptyState icon={Users} title="No leads found" message="Change the filters or add your first lead." className="py-10" />;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
                <thead>
                    <tr className="border-b border-line text-left text-xs text-muted">
                        <th className="px-3 py-3"><input type="checkbox" aria-label="Select all leads on this page" checked={rows.every((row) => selected.includes(row._id))} onChange={(event) => onSelectAll(event.target.checked)} /></th>
                        <th className="px-3 py-3 font-semibold">Lead ID</th>
                        <th className="px-3 py-3 font-semibold">Lead / Customer</th>
                        <th className="px-3 py-3 font-semibold">Contact</th>
                        <th className="px-3 py-3 font-semibold">Source</th>
                        <th className="px-3 py-3 font-semibold">Assigned employee</th>
                        <th className="px-3 py-3 font-semibold">Status</th>
                        <th className="px-3 py-3 font-semibold">Priority</th>
                        <th className="px-3 py-3 font-semibold">Next follow-up</th>
                        <th className="px-3 py-3 font-semibold">Created</th>
                        <th className="px-3 py-3 text-right font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {rows.map((lead) => {
                        const currentStatusId = lead.statusId?._id || lead.statusId;
                        const selectableStatuses = statuses.filter((status) =>
                            status.active || status._id === currentStatusId
                        );
                        return (
                        <tr key={lead._id} className="hover:bg-surface-hover/60">
                            <td className="px-3 py-3"><input type="checkbox" aria-label={`Select ${lead.customerName}`} checked={selected.includes(lead._id)} onChange={() => onSelect(lead._id)} /></td>
                            <td className="px-3 py-3 font-mono text-xs text-muted" title={lead._id}>{String(lead._id).slice(-8).toUpperCase()}</td>
                            <td className="px-3 py-3">
                                <button type="button" className="text-left" onClick={() => onView(lead)}>
                                    <span className="block max-w-[220px] truncate font-semibold text-heading hover:text-primary">{lead.customerName}</span>
                                    <span className="block max-w-[220px] truncate text-xs text-muted">{lead.title}</span>
                                </button>
                            </td>
                            <td className="px-3 py-3">
                                <p className="text-heading">{lead.mobileNumber}</p>
                                <p className="max-w-[190px] truncate text-xs text-muted">{lead.email || "—"}</p>
                            </td>
                            <td className="px-3 py-3 text-muted">{lead.source}</td>
                            <td className="px-3 py-3 text-muted">{lead.assignedEmployee || "—"}</td>
                            <td className="px-3 py-3">
                                <select
                                    aria-label={`Change status for ${lead.customerName}`}
                                    value={lead.statusId?._id || lead.statusId}
                                    onChange={(event) => onStatus(lead, event.target.value)}
                                    className="max-w-[170px] rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-heading"
                                    style={{ borderColor: statusColor(lead), color: statusColor(lead) }}
                                >
                                    {selectableStatuses.map((status) => <option key={status._id} value={status._id}>{status.active ? status.name : `${status.name} (inactive)`}</option>)}
                                </select>
                            </td>
                            <td className="px-3 py-3"><Badge tone={lead.priority === "Urgent" || lead.priority === "High" ? "danger" : lead.priority === "Medium" ? "warning" : "neutral"}>{lead.priority}</Badge></td>
                            <td className="px-3 py-3 whitespace-nowrap text-muted">{dateLabel(lead.nextFollowUpAt)}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-muted">{dateLabel(lead.leadDate)}</td>
                            <td className="px-3 py-3">
                                <div className="flex justify-end gap-1">
                                    <IconButton icon={Eye} label="View lead" size="sm" onClick={() => onView(lead)} />
                                    <IconButton icon={CalendarClock} label="Schedule follow-up" size="sm" onClick={() => onSchedule(lead)} />
                                    <IconButton icon={Activity} label="Log activity" size="sm" onClick={() => onLogActivity(lead)} />
                                    <IconButton icon={Pencil} label="Edit lead" size="sm" onClick={() => onEdit(lead)} />
                                    <IconButton icon={Trash2} label="Delete lead" size="sm" className="text-danger" onClick={() => onDelete(lead)} />
                                </div>
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function LeadDetails({ detail, duplicates, onClose, onSchedule, onLogActivity, onMerge, onRecordIncome, formatMoney }) {
    return (
        <Modal open={Boolean(detail)} onClose={onClose} title={detail?.lead?.customerName || "Lead details"} subtitle={detail?.lead?.title} icon={UserRound} size="lg">
            {detail && (
                <div className="space-y-5">
                    <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2" padded>
                        {[
                            ["Phone", detail.lead.mobileNumber], ["Alternate phone", detail.lead.alternateNumber],
                            ["Email", detail.lead.email], ["WhatsApp", detail.lead.whatsappNumber],
                            ["Company", detail.lead.companyName], ["Source", detail.lead.source],
                            ["Interested in", detail.lead.interestedProduct], ["Assigned employee", detail.lead.assignedEmployee],
                            ["Expected budget", detail.lead.expectedBudget == null ? "—" : formatMoney(detail.lead.expectedBudget, { decimals: 2 })],
                            ["Expected deal value", detail.lead.expectedDealValue == null ? "—" : formatMoney(detail.lead.expectedDealValue, { decimals: 2 })],
                            ["Priority", detail.lead.priority], ["Created", dateLabel(detail.lead.leadDate)],
                            ["Follow-up", dateLabel(detail.lead.nextFollowUpAt)], ["Address", [detail.lead.address, detail.lead.city, detail.lead.state, detail.lead.pincode].filter(Boolean).join(", ") || "—"]
                        ].map(([label, value]) => <div key={label}><p className="text-xs text-muted">{label}</p><p className="mt-1 break-words text-sm font-medium text-heading">{value || "—"}</p></div>)}
                        <div className="sm:col-span-2"><p className="text-xs text-muted">Current status</p><p className="mt-1"><Badge className="border-0 text-white" style={{ backgroundColor: statusColor(detail.lead) }}>{displayStatus(detail.lead)}</Badge></p></div>
                        <div className="sm:col-span-2"><p className="text-xs text-muted">Description / requirements</p><p className="mt-1 whitespace-pre-wrap text-sm text-heading">{detail.lead.description || "—"}</p></div>
                        <div className="sm:col-span-2"><p className="text-xs text-muted">Notes</p><p className="mt-1 whitespace-pre-wrap text-sm text-heading">{detail.lead.notes || "—"}</p></div>
                        {detail.lead.lostReason && <div className="sm:col-span-2"><p className="text-xs text-muted">Lost reason</p><p className="mt-1 text-sm font-medium text-heading">{detail.lead.lostReason}</p><p className="mt-1 whitespace-pre-wrap text-sm text-body">{detail.lead.lostRemarks || "—"}</p></div>}
                    </Card>
                    {detail.conversion && (
                        <Card>
                            <CardHeader title="Conversion details" subtitle={detail.conversion.referenceId} />
                            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div><p className="text-xs text-muted">Final deal amount</p><p className="mt-1 text-sm font-semibold text-heading">{formatMoney(detail.conversion.finalDealAmount, { decimals: 2 })}</p></div>
                                <div><p className="text-xs text-muted">Conversion date</p><p className="mt-1 text-sm font-medium text-heading">{dateLabel(detail.conversion.conversionDate)}</p></div>
                                <div><p className="text-xs text-muted">Responsible employee</p><p className="mt-1 text-sm font-medium text-heading">{detail.conversion.responsibleEmployee || "—"}</p></div>
                                <div className="sm:col-span-2"><p className="text-xs text-muted">Conversion notes</p><p className="mt-1 whitespace-pre-wrap text-sm text-body">{detail.conversion.notes || "—"}</p></div>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                                <p className="text-sm text-body">
                                    Confirmed income recorded: <strong>{formatMoney(detail.recordedIncome?.total || 0, { decimals: 2 })}</strong>
                                </p>
                                {Number(detail.recordedIncome?.total || 0) < Number(detail.conversion.finalDealAmount) && !detail.lead.isMerged && (
                                    <Button size="sm" variant="secondary" icon={WalletCards} onClick={() => onRecordIncome(detail)}>
                                        Record confirmed payment
                                    </Button>
                                )}
                            </div>
                        </Card>
                    )}
                    {(detail.lead.statusId?.systemKey === "completed" ||
                        detail.lead.statusName?.trim().toLowerCase() === "completed") && (
                        <Card>
                            <CardHeader title="Completed lead amounts" subtitle="Kept separate from Converted / Won and recorded income" />
                            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div><p className="text-xs text-muted">Final quotation amount</p><p className="mt-1 text-sm font-semibold text-heading">{detail.lead.finalQuotationAmount == null ? "—" : formatMoney(detail.lead.finalQuotationAmount, { decimals: 2 })}</p></div>
                                <div><p className="text-xs text-muted">Final amount</p><p className="mt-1 text-sm font-semibold text-heading">{detail.lead.finalAmount == null ? "—" : formatMoney(detail.lead.finalAmount, { decimals: 2 })}</p></div>
                            </div>
                        </Card>
                    )}
                    {!detail.lead.isMerged && !!duplicates?.length && (
                        <Card>
                            <CardHeader title="Possible duplicate leads" subtitle="Matches found by mobile number or email. Merge is explicit and retains the original as an archived record." />
                            <div className="mt-3 divide-y divide-line">
                                {duplicates.map((duplicate) => (
                                    <div key={duplicate._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-heading">{duplicate.customerName} · {duplicate.title}</p>
                                            <p className="text-xs text-muted">{duplicate.mobileNumber} · {duplicate.email || "No email"} · {duplicate.statusName}</p>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={() => onMerge(duplicate, detail.lead)}>
                                            Merge into this lead
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                    {!!detail.mergedSources?.length && (
                        <Card>
                            <CardHeader title="Archived merged records" subtitle="Original lead records remain available for audit." />
                            <div className="mt-2 divide-y divide-line">
                                {detail.mergedSources.map((source) => (
                                    <div key={source._id} className="py-2">
                                        <p className="text-sm font-medium text-heading">{source.customerName} · {source.mobileNumber}</p>
                                        <p className="text-xs text-muted">{source.email || "No email"} · Archived {dateLabel(source.mergedAt)}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                    <Card>
                        <CardHeader
                            title="Follow-ups"
                            subtitle="Scheduled contact and meeting reminders"
                            action={<Button size="sm" variant="secondary" icon={CalendarClock} onClick={() => onSchedule(detail.lead)}>Schedule</Button>}
                        />
                        <div className="mt-3 divide-y divide-line">
                            {(detail.followUps || []).slice(0, 5).map((followUp) => (
                                <div key={followUp._id} className="flex items-center justify-between gap-3 py-2.5">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-heading">{followUp.type} · {new Date(followUp.scheduledAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                                        <p className="text-xs text-muted">{followUp.assignedEmployee || "Unassigned"} · {followUp.status}</p>
                                    </div>
                                    {followUp.status === "Pending" && <Button size="sm" variant="ghost" onClick={() => onSchedule(detail.lead, followUp)}>Reschedule</Button>}
                                </div>
                            ))}
                            {!detail.followUps?.length && <p className="py-3 text-sm text-muted">No follow-ups scheduled.</p>}
                        </div>
                    </Card>
                    <section>
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <h3 className="flex items-center gap-2 font-semibold text-heading"><History className="h-4 w-4 text-primary" />Lead history</h3>
                            <Button size="sm" variant="secondary" icon={Activity} onClick={() => onLogActivity(detail.lead)}>Log activity</Button>
                        </div>
                        <div className="space-y-3">
                            {(detail.activities || []).map((activity) => (
                                <div key={activity._id} className="flex gap-3">
                                    <span className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full ${activity.type === "status_changed" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
                                        {activity.type === "status_changed" ? <Activity className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
                                    </span>
                                    <div className="min-w-0 flex-1 border-b border-line pb-3">
                                        <p className="text-sm font-medium text-heading">{activity.message}</p>
                                        {activity.description && <p className="mt-1 whitespace-pre-wrap text-sm text-body">{activity.description}</p>}
                                        <p className="mt-1 text-xs text-muted">{activity.changedBy || "Account user"} · {new Date(activity.createdAt).toLocaleString("en-IN")}</p>
                                    </div>
                                </div>
                            ))}
                            {!detail.activities?.length && <p className="text-sm text-muted">No activity recorded yet.</p>}
                        </div>
                    </section>
                </div>
            )}
        </Modal>
    );
}

export default function Leads() {
    const toast = useToast();
    const { formatMoney } = useBusiness();
    const [activeTab, setActiveTab] = useState("overview");
    const [dashboard, setDashboard] = useState(null);
    const [statuses, setStatuses] = useState([]);
    const [crmSettings, setCrmSettings] = useState(null);
    const [dashboardPeriod, setDashboardPeriod] = useState("monthly");
    const [reportFilters, setReportFilters] = useState({ period: "monthly", from: "", to: "" });
    const [report, setReport] = useState(null);
    const [reportPage, setReportPage] = useState(1);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [settingSavingKey, setSettingSavingKey] = useState("");
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [loadingLeads, setLoadingLeads] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editor, setEditor] = useState(null);
    const [detail, setDetail] = useState(null);
    const [duplicates, setDuplicates] = useState([]);
    const [duplicatePrompt, setDuplicatePrompt] = useState(null);
    const [mergeSource, setMergeSource] = useState(null);
    const [incomeDetail, setIncomeDetail] = useState(null);
    const [incomeSaving, setIncomeSaving] = useState(false);
    const [confirmLead, setConfirmLead] = useState(null);
    const [selected, setSelected] = useState([]);
    const [statusManager, setStatusManager] = useState(false);
    const [statusEditor, setStatusEditor] = useState(null);
    const [statusForm, setStatusForm] = useState({ name: "", color: "#2563eb", order: 99 });
    const [bulkStatus, setBulkStatus] = useState("");
    const [bulkEmployee, setBulkEmployee] = useState("");
    const [followUpEditor, setFollowUpEditor] = useState(null);
    const [activityLead, setActivityLead] = useState(null);
    const [conversionLead, setConversionLead] = useState(null);
    const [completedLead, setCompletedLead] = useState(null);
    const [lostLead, setLostLead] = useState(null);
    const [followUpSaving, setFollowUpSaving] = useState(false);
    const [activitySaving, setActivitySaving] = useState(false);
    const [outcomeSaving, setOutcomeSaving] = useState(false);
    const [followUpView, setFollowUpView] = useState("today");
    const [followUps, setFollowUps] = useState([]);
    const [followUpPage, setFollowUpPage] = useState(1);
    const [followUpsHasMore, setFollowUpsHasMore] = useState(false);
    const [followUpsLoading, setFollowUpsLoading] = useState(false);
    const [pipelineStages, setPipelineStages] = useState([]);
    const [pipelinePage, setPipelinePage] = useState(1);
    const [pipelineLoading, setPipelineLoading] = useState(false);
    const [teamEmployees, setTeamEmployees] = useState([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [filters, setFilters] = useState({ search: "", statusId: "", source: "", priority: "", category: "", assignedEmployee: "", from: "", to: "", sort: "newest" });
    const [draft, setDraft] = useState(filters);

    const loadStatuses = useCallback(async () => {
        try {
            const result = await getLeadStatuses();
            setStatuses(result.statuses);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load lead statuses");
        }
    }, [toast]);

    const loadSettings = useCallback(async () => {
        try {
            const result = await getCrmSettings();
            setCrmSettings(result.settings);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load CRM settings");
        }
    }, [toast]);

    const loadDashboard = useCallback(async () => {
        setLoadingDashboard(true);
        try {
            setDashboard(await getLeadDashboard({ period: dashboardPeriod }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load CRM dashboard");
        } finally {
            setLoadingDashboard(false);
        }
    }, [dashboardPeriod, toast]);

    const loadReports = useCallback(async () => {
        setReportsLoading(true);
        try {
            setReport(await getLeadReports({ ...reportFilters, page: reportPage, limit: 20 }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load CRM reports");
        } finally {
            setReportsLoading(false);
        }
    }, [reportFilters, reportPage, toast]);

    const loadRows = useCallback(async () => {
        setLoadingLeads(true);
        try {
            const result = await getLeads({ ...filters, page, limit: 20 });
            setRows(result.leads);
            setTotal(result.total);
            setHasMore(result.hasMore);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load leads");
        } finally {
            setLoadingLeads(false);
        }
    }, [filters, page, toast]);

    useEffect(() => {
        loadDashboard();
        loadStatuses();
        loadSettings();
    }, [loadDashboard, loadStatuses, loadSettings]);

    useEffect(() => {
        loadRows();
    }, [loadRows]);

    const loadFollowUps = useCallback(async (view = followUpView, requestedPage = followUpPage) => {
        setFollowUpsLoading(true);
        try {
            const result = await getLeadFollowUps(view, requestedPage);
            setFollowUps(result.followUps);
            setFollowUpsHasMore(result.hasMore);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load follow-ups");
        } finally {
            setFollowUpsLoading(false);
        }
    }, [followUpView, followUpPage, toast]);

    const loadPipeline = useCallback(async (requestedPage = 1, append = false) => {
        setPipelineLoading(true);
        try {
            const result = await getLeadPipeline(requestedPage);
            setPipelineStages((current) => append
                ? current.map((stage) => {
                    const next = result.stages.find((entry) => entry.statusId === stage.statusId);
                    return next ? { ...stage, leads: [...stage.leads, ...next.leads], hasMore: next.hasMore } : stage;
                })
                : result.stages);
            setPipelinePage(requestedPage);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load lead pipeline");
        } finally {
            setPipelineLoading(false);
        }
    }, [toast]);

    const loadTeam = useCallback(async () => {
        setTeamLoading(true);
        try {
            const result = await getLeadTeamSummary();
            setTeamEmployees(result.employees);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load employee assignments");
        } finally {
            setTeamLoading(false);
        }
    }, [toast]);

    const loadNotifications = useCallback(async () => {
        try {
            const result = await getLeadNotifications();
            setNotifications(result.notifications);
            setUnreadNotifications(result.unreadCount);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load CRM notifications");
        }
    }, [toast]);

    useEffect(() => {
        if (activeTab === "followups") loadFollowUps(followUpView, followUpPage);
    }, [activeTab, followUpView, followUpPage, loadFollowUps]);

    useEffect(() => {
        if (activeTab === "pipeline") loadPipeline(1, false);
    }, [activeTab, loadPipeline]);

    useEffect(() => {
        if (activeTab === "team") loadTeam();
    }, [activeTab, loadTeam]);

    useEffect(() => {
        if (activeTab === "reports") loadReports();
    }, [activeTab, loadReports]);

    useEffect(() => {
        if (activeTab === "settings") loadSettings();
    }, [activeTab, loadSettings]);

    useEffect(() => {
        if (notificationsOpen) loadNotifications();
    }, [notificationsOpen, loadNotifications]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const applyFilters = (event) => {
        event.preventDefault();
        setPage(1);
        setFilters(draft);
    };

    const openDetails = async (lead) => {
        try {
            const result = await getLead(lead._id);
            const matchResult = result.lead.isMerged
                ? { duplicates: [] }
                : await getLeadDuplicates(lead._id);
            setDetail(result);
            setDuplicates(matchResult.duplicates);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load lead details");
        }
    };

    const openFollowUp = (lead, followUp = null) => {
        setDetail(null);
        setFollowUpEditor({ lead: followUp?.leadId || lead, followUp });
    };

    const saveFollowUp = async (payload) => {
        setFollowUpSaving(true);
        try {
            await saveLeadFollowUp(payload, followUpEditor?.followUp?._id);
            setFollowUpEditor(null);
            toast.success(followUpEditor?.followUp ? "Follow-up rescheduled" : "Follow-up scheduled");
            await Promise.all([loadDashboard(), loadFollowUps(followUpView, followUpPage), loadReports()]);
            if (followUpEditor?.lead?._id) await openDetails(followUpEditor.lead);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not save follow-up");
        } finally {
            setFollowUpSaving(false);
        }
    };

    const updateFollowUpStatus = async (followUp, status) => {
        try {
            await saveLeadFollowUp({ status }, followUp._id);
            toast.success(`Follow-up marked ${status.toLowerCase()}`);
            await Promise.all([loadDashboard(), loadFollowUps(followUpView, followUpPage), loadReports()]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not update follow-up");
        }
    };

    const saveActivity = async (payload) => {
        setActivitySaving(true);
        const lead = activityLead;
        try {
            await addLeadActivity(lead._id, payload);
            setActivityLead(null);
            toast.success("Lead activity recorded");
            await openDetails(lead);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not record activity");
        } finally {
            setActivitySaving(false);
        }
    };

    const handleStatusSelection = (lead, statusId) => {
        const status = statuses.find((item) => item._id === statusId);
        if (status?.systemKey === "converted_won") {
            setConversionLead(lead);
        } else if (status?.systemKey === "lost") {
            setLostLead(lead);
        } else if (status?.systemKey === "completed" || status?.name?.trim().toLowerCase() === "completed") {
            setCompletedLead({ lead, statusId });
        } else {
            changeStatus(lead, statusId);
        }
    };

    const save = async (payload, skipDuplicateCheck = false) => {
        setSaving(true);
        try {
            if (!skipDuplicateCheck) {
                const matchResult = await checkLeadDuplicates({
                    mobileNumber: payload.mobileNumber,
                    email: payload.email,
                    excludeId: editor?.lead?._id
                });
                if (matchResult.duplicates.length) {
                    setDuplicatePrompt({ payload, duplicates: matchResult.duplicates, leadId: editor?.lead?._id });
                    return;
                }
            }
            await saveLead(payload, editor?.lead?._id);
            setEditor(null);
            toast.success(editor?.lead ? "Lead updated" : "Lead created");
            await Promise.all([loadRows(), loadDashboard(), loadTeam(), loadPipeline(1, false), loadReports()]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not save lead");
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        try {
            await deleteLead(confirmLead._id);
            setConfirmLead(null);
            setSelected((current) => current.filter((id) => id !== confirmLead._id));
            toast.success("Lead deleted");
            await Promise.all([loadRows(), loadDashboard(), loadPipeline(1, false), loadTeam()]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not delete lead");
        }
    };

    const changeStatus = async (lead, statusId, amounts = {}) => {
        try {
            await changeLeadStatus(lead._id, statusId, amounts);
            toast.success("Lead status updated");
            await Promise.all([loadRows(), loadDashboard(), loadPipeline(1, false), loadReports()]);
            if (detail?.lead?._id === lead._id) await openDetails(lead);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not update lead status");
        }
    };

    const bulkUpdate = async () => {
        if (!selected.length || (!bulkStatus && !bulkEmployee.trim())) {
            toast.warning("Select leads and a status or employee assignment");
            return;
        }
        try {
            await bulkUpdateLeads(selected, {
                ...(bulkStatus ? { statusId: bulkStatus } : {}),
                ...(bulkEmployee.trim() ? { assignedEmployee: bulkEmployee.trim() } : {})
            });
            toast.success(`${selected.length} leads updated`);
            setSelected([]);
            setBulkStatus("");
            setBulkEmployee("");
            await Promise.all([loadRows(), loadDashboard(), loadTeam(), loadPipeline(1, false), loadReports()]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not update selected leads");
        }
    };

    const downloadCsv = async () => {
        try {
            const file = await exportLeads(filters);
            const url = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = url;
            link.download = "leads.csv";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not export leads");
        }
    };

    const downloadReport = async () => {
        try {
            const file = await exportLeadReports({ ...reportFilters, limit: 100 });
            const url = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = url;
            link.download = "crm-report.csv";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not export CRM reports");
        }
    };

    const saveSettingList = async (key, text) => {
        setSettingSavingKey(key);
        try {
            const values = text.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
            const result = await saveCrmSetting(key, values);
            setCrmSettings(result.settings);
            toast.success("CRM setting saved");
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not save CRM setting");
        } finally {
            setSettingSavingKey("");
        }
    };

    const mergeLead = async () => {
        if (!mergeSource || !detail?.lead) return;
        try {
            await mergeDuplicateLead(mergeSource.source._id, detail.lead._id);
            setMergeSource(null);
            toast.success("Duplicate lead merged; original retained in the archive");
            await Promise.all([loadRows(), loadDashboard(), loadPipeline(1, false), loadTeam()]);
            await openDetails(detail.lead);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not merge duplicate lead");
        }
    };

    const recordIncome = async (payload) => {
        if (!incomeDetail) return;
        setIncomeSaving(true);
        try {
            await recordLeadIncome(incomeDetail.lead._id, payload);
            setIncomeDetail(null);
            toast.success("Confirmed payment added to Expense income");
            await Promise.all([openDetails(incomeDetail.lead), loadReports(), loadDashboard()]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not record confirmed income");
        } finally {
            setIncomeSaving(false);
        }
    };

    const saveConversion = async (payload) => {
        setOutcomeSaving(true);
        try {
            const result = await convertLead(conversionLead._id, payload);
            setConversionLead(null);
            toast.success(`Lead converted · ${result.conversion.referenceId}`);
            await Promise.all([loadRows(), loadDashboard(), loadPipeline(1, false), loadTeam(), loadNotifications(), loadReports()]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not convert lead");
        } finally {
            setOutcomeSaving(false);
        }
    };

    const saveCompletedLead = async (amounts) => {
        if (!completedLead) return;
        setOutcomeSaving(true);
        try {
            await changeLeadStatus(completedLead.lead._id, completedLead.statusId, amounts);
            setCompletedLead(null);
            toast.success("Lead completed with final amounts saved");
            await Promise.all([loadRows(), loadDashboard(), loadPipeline(1, false), loadTeam(), loadReports()]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not complete lead");
        } finally {
            setOutcomeSaving(false);
        }
    };

    const saveLostLead = async (payload) => {
        setOutcomeSaving(true);
        try {
            await markLeadLost(lostLead._id, payload);
            setLostLead(null);
            toast.success("Lead marked as lost");
            await Promise.all([loadRows(), loadDashboard(), loadPipeline(1, false), loadTeam(), loadNotifications(), loadReports()]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not mark lead as lost");
        } finally {
            setOutcomeSaving(false);
        }
    };

    const movePipelineLead = (lead, stage) => {
        if (stage.systemKey === "converted_won") {
            setConversionLead(lead);
        } else if (stage.systemKey === "lost") {
            setLostLead(lead);
        } else if (stage.systemKey === "completed" || stage.name?.trim().toLowerCase() === "completed") {
            setCompletedLead({ lead, statusId: stage.statusId });
        } else {
            changeStatus(lead, stage.statusId);
        }
    };

    const loadMorePipeline = async () => {
        await loadPipeline(pipelinePage + 1, true);
    };

    const markNotificationRead = async (notification) => {
        try {
            await markLeadNotificationRead(notification._id);
            setNotifications((current) => current.map((item) =>
                item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item
            ));
            setUnreadNotifications((count) => Math.max(0, count - (notification.readAt ? 0 : 1)));
            if (notification.leadId) {
                setNotificationsOpen(false);
                await openDetails({ _id: notification.leadId });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not mark notification as read");
        }
    };

    const markAllNotificationsRead = async () => {
        try {
            await markAllLeadNotificationsRead();
            setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
            setUnreadNotifications(0);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not update notifications");
        }
    };

    const saveStatus = async (event) => {
        event.preventDefault();
        try {
            await saveLeadStatus(statusForm, statusEditor?._id);
            setStatusEditor(null);
            setStatusForm({ name: "", color: "#2563eb", order: 99 });
            await Promise.all([loadStatuses(), loadRows(), loadDashboard()]);
            toast.success(statusEditor ? "Status updated" : "Status added");
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not save status");
        }
    };

    const toggleStatus = async (status) => {
        try {
            await saveLeadStatus({ active: !status.active }, status._id);
            await loadStatuses();
            toast.success(status.active ? "Status deactivated" : "Status activated");
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not update status");
        }
    };

    const statusOptions = useMemo(() => [{ value: "", label: "All statuses" }, ...statuses.map((status) => ({ value: status._id, label: status.name }))], [statuses]);
    const cards = [
        [Users, "Total leads", dashboard?.summary.totalLeads || 0, "primary"],
        [Plus, "New leads", dashboard?.summary.newLeads || 0, "info"],
        [CheckCircle2, "Completed leads", dashboard?.summary.completedLeads || 0, "info"],
        [CheckCircle2, "Converted leads", dashboard?.summary.convertedLeads || 0, "success"],
        [XCircle, "Lost leads", dashboard?.summary.lostLeads || 0, "danger"],
        [TrendingUp, "Conversion rate", `${Number(dashboard?.summary.conversionRate || 0).toFixed(1)}%`, "success"],
        [WalletCards, "Expected pipeline", formatMoney(dashboard?.summary.expectedPipelineRevenue || 0), "primary"],
        [WalletCards, "Converted deal value", formatMoney(dashboard?.summary.convertedDealValue || 0), "success"],
        [WalletCards, "Recorded income", formatMoney(dashboard?.summary.confirmedIncome || 0), "info"],
        [CalendarClock, "Today's follow-ups", dashboard?.summary.todayFollowUps || 0, "warning"],
        [CalendarClock, "Overdue follow-ups", dashboard?.summary.overdueFollowUps || 0, "danger"]
    ];

    const toggleSelected = (id) => setSelected((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]);
    const selectPage = (checked) => setSelected((current) => checked
        ? [...new Set([...current, ...rows.map((lead) => lead._id)])]
        : current.filter((id) => !rows.some((lead) => lead._id === id)));

    return (
        <div className="space-y-6">
            <PageHeader
                icon={Users}
                title="Lead Management"
                subtitle="Manage prospects, track pipeline progress, and stay on top of follow-ups."
                actions={
                    <>
                        <Button variant="secondary" icon={Bell} onClick={() => setNotificationsOpen(true)}>
                            Notifications{unreadNotifications > 0 ? ` (${unreadNotifications})` : ""}
                        </Button>
                        <Button variant="secondary" icon={Settings2} onClick={() => setStatusManager(true)}>Manage statuses</Button>
                        <Button icon={Plus} onClick={() => setEditor({ lead: null })}>Add lead</Button>
                    </>
                }
            />

            <div className="flex flex-wrap gap-2 no-print" role="tablist" aria-label="CRM sections">
                {[
                    ["overview", "Overview", TrendingUp],
                    ["leads", "Leads", Users],
                    ["pipeline", "Pipeline", Activity],
                    ["followups", "Follow-ups", CalendarClock],
                    ["team", "Team", UserRound],
                    ["reports", "Reports", BarChart3],
                    ["settings", "CRM settings", Settings2]
                ].map(([key, label, Icon]) => (
                    <Button key={key} size="sm" variant={activeTab === key ? "soft" : "ghost"} role="tab" aria-selected={activeTab === key} icon={Icon} onClick={() => setActiveTab(key)}>
                        {label}
                    </Button>
                ))}
            </div>

            {activeTab === "overview" && (loadingDashboard ? <Spinner /> : (
                <>
                    <Card className="no-print">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold text-heading">Dashboard period</h2>
                                <p className="mt-1 text-xs text-muted">Lead counts follow creation date; conversion totals follow conversion date.</p>
                            </div>
                            <Select
                                label="Period"
                                value={dashboardPeriod}
                                onChange={(event) => setDashboardPeriod(event.target.value)}
                                options={[
                                    { value: "daily", label: "Today" },
                                    { value: "weekly", label: "This week" },
                                    { value: "monthly", label: "This month" },
                                    { value: "yearly", label: "This year" }
                                ]}
                            />
                        </div>
                    </Card>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {cards.map(([Icon, label, value, tone]) => <StatCard key={label} icon={Icon} label={label} value={String(value)} tone={tone} compact />)}
                    </div>
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        <Card>
                            <CardHeader title="Lead status distribution" subtitle="Current pipeline across all active and inactive statuses" />
                            {(dashboard?.statusDistribution || []).length ? (
                                <div className="mt-4 h-[260px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={dashboard.statusDistribution} dataKey="count" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                                                {dashboard.statusDistribution.map((status) => <Cell key={status.name} fill={status.color || "#64748b"} />)}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : <p className="py-12 text-center text-sm text-muted">No leads to chart yet.</p>}
                        </Card>
                        <Card>
                            <CardHeader title="Lead generation" subtitle={`Leads created for the selected ${dashboardPeriod} period`} />
                            <div className="mt-4 h-[260px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={(dashboardPeriod === "yearly"
                                            ? dashboard?.monthlyLeadGeneration || []
                                            : dashboard?.dailyLeadGeneration || []
                                        ).map((item) => ({ month: item._id, count: item.count }))}
                                        margin={{ left: 0, right: 12, top: 8 }}
                                    >
                                        <CartesianGrid vertical={false} stroke="rgb(var(--color-line))" />
                                        <XAxis dataKey="month" tickFormatter={(value) => dashboardPeriod === "yearly" ? shortMonth(value) : value.slice(5)} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "rgb(var(--color-muted))" }} />
                                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={34} tick={{ fontSize: 11, fill: "rgb(var(--color-muted))" }} />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Leads" fill="#2563eb" radius={[5, 5, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader title="Recent leads" subtitle="Recently added opportunities" action={<span className="text-xs text-muted">{dashboard?.summary.totalLeads || 0} in period</span>} />
                        <div className="mt-3 divide-y divide-line">
                            {(dashboard?.recentLeads || []).map((lead) => (
                                <button key={lead._id} type="button" onClick={() => openDetails(lead)} className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-surface-hover">
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold text-heading">{lead.customerName} · {lead.title}</span>
                                        <span className="text-xs text-muted">{lead.source} · {dateLabel(lead.leadDate)}</span>
                                    </span>
                                    <Badge className="border-0 text-white" style={{ backgroundColor: lead.statusColor }}>{lead.statusName}</Badge>
                                </button>
                            ))}
                            {!dashboard?.recentLeads?.length && <p className="py-6 text-sm text-muted">Your recent leads will appear here.</p>}
                        </div>
                    </Card>
                </>
            ))}

            {activeTab === "leads" && <>
            <Card className="no-print">
                <form onSubmit={applyFilters} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Input label="Search leads" icon={Search} placeholder="Name, phone, email, title or ID" value={draft.search} onChange={(event) => setDraft({ ...draft, search: event.target.value })} />
                    <Select label="Status" value={draft.statusId} onChange={(event) => setDraft({ ...draft, statusId: event.target.value })} options={statusOptions} />
                    <Select label="Source" value={draft.source} onChange={(event) => setDraft({ ...draft, source: event.target.value })} options={[{ value: "", label: "All sources" }, ...(crmSettings?.sources || []).map((value) => ({ value, label: value }))]} />
                    <Select label="Priority" value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value })} options={[{ value: "", label: "All priorities" }, ...(crmSettings?.priorities || []).map((value) => ({ value, label: value }))]} />
                    <Select label="Category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} options={[{ value: "", label: "All categories" }, ...(crmSettings?.categories || []).map((value) => ({ value, label: value }))]} />
                    <Input label="Assigned employee" value={draft.assignedEmployee} onChange={(event) => setDraft({ ...draft, assignedEmployee: event.target.value })} placeholder="Employee name" />
                    <Input label="Created from" type="date" value={draft.from} onChange={(event) => setDraft({ ...draft, from: event.target.value })} />
                    <Input label="Created to" type="date" value={draft.to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} />
                    <Select label="Sort by" value={draft.sort} onChange={(event) => setDraft({ ...draft, sort: event.target.value })} options={[{ value: "newest", label: "Newest first" }, { value: "oldest", label: "Oldest first" }, { value: "name", label: "Customer name" }]} />
                    <div className="flex flex-wrap gap-2 sm:col-span-2 xl:col-span-4">
                        <Button type="submit" icon={Filter}>Apply filters</Button>
                        <Button variant="secondary" icon={Download} onClick={downloadCsv}>Export CSV</Button>
                    </div>
                </form>
            </Card>

            <Card padded={false}>
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <h2 className="font-semibold text-heading">Leads <span className="ml-1 text-xs font-normal text-muted">({total})</span></h2>
                    {!!selected.length && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted">{selected.length} selected</span>
                            <Select aria-label="Bulk status" value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)} options={[{ value: "", label: "Change status" }, ...statuses.filter((status) => status.active).map((status) => ({ value: status._id, label: status.name }))]} />
                            <Input aria-label="Bulk employee assignment" placeholder="Assign employee" value={bulkEmployee} onChange={(event) => setBulkEmployee(event.target.value)} />
                            <Button size="sm" onClick={bulkUpdate}>Update selected</Button>
                        </div>
                    )}
                </div>
                {loadingLeads ? <Spinner /> : (
                    <LeadTable
                        rows={rows}
                        statuses={statuses}
                        selected={selected}
                        onSelect={toggleSelected}
                        onSelectAll={selectPage}
                        onView={openDetails}
                        onEdit={(lead) => setEditor({ lead })}
                        onDelete={setConfirmLead}
                        onStatus={handleStatusSelection}
                        onSchedule={(lead) => openFollowUp(lead)}
                        onLogActivity={(lead) => { setDetail(null); setActivityLead(lead); }}
                    />
                )}
                <div className="flex items-center justify-between border-t border-line px-5 py-3">
                    <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
                    <span className="text-xs text-muted">Page {page}</span>
                    <Button variant="secondary" size="sm" disabled={!hasMore} onClick={() => setPage((value) => value + 1)}>Next</Button>
                </div>
            </Card>
            </>}

            {activeTab === "pipeline" && (
                <Card>
                    <CardHeader title="Lead pipeline" subtitle="Drag leads between stages. Conversion and Lost require their dedicated forms." />
                    <div className="mt-4">
                        <PipelineBoard
                            stages={pipelineStages}
                            loading={pipelineLoading}
                            formatMoney={formatMoney}
                            onMove={movePipelineLead}
                            onMore={loadMorePipeline}
                        />
                    </div>
                </Card>
            )}

            {activeTab === "followups" && (
                <FollowUpsPanel
                    view={followUpView}
                    setView={(view) => { setFollowUpView(view); setFollowUpPage(1); }}
                    followUps={followUps}
                    loading={followUpsLoading}
                    onComplete={(followUp) => updateFollowUpStatus(followUp, "Completed")}
                    onCancel={(followUp) => updateFollowUpStatus(followUp, "Cancelled")}
                    onReschedule={(followUp) => openFollowUp(followUp.leadId, followUp)}
                    page={followUpPage}
                    hasMore={followUpsHasMore}
                    onNextPage={setFollowUpPage}
                />
            )}

            {activeTab === "team" && (
                <TeamAssignments employees={teamEmployees} loading={teamLoading} formatMoney={formatMoney} />
            )}

            {activeTab === "reports" && (
                <LeadReportsPanel
                    report={report}
                    loading={reportsLoading}
                    filters={reportFilters}
                    setFilters={setReportFilters}
                    onApply={(event) => { event.preventDefault(); setReportPage(1); }}
                    onExport={downloadReport}
                    page={reportPage}
                    setPage={setReportPage}
                    formatMoney={formatMoney}
                />
            )}

            {activeTab === "settings" && (
                <LeadSettingsPanel
                    settings={crmSettings}
                    savingKey={settingSavingKey}
                    onSave={saveSettingList}
                    onManageStatuses={() => setStatusManager(true)}
                />
            )}

            <LeadForm open={Boolean(editor)} lead={editor?.lead} statuses={statuses} settings={crmSettings} saving={saving} onClose={() => setEditor(null)} onSave={save} />
            <LeadDetails
                detail={detail}
                duplicates={duplicates}
                formatMoney={formatMoney}
                onClose={() => { setDetail(null); setDuplicates([]); }}
                onSchedule={openFollowUp}
                onLogActivity={(lead) => { setDetail(null); setActivityLead(lead); }}
                onMerge={(source, target) => setMergeSource({ source, target })}
                onRecordIncome={setIncomeDetail}
            />
            <FollowUpForm
                lead={followUpEditor?.lead}
                followUp={followUpEditor?.followUp}
                followUpTypes={crmSettings?.followUpTypes}
                saving={followUpSaving}
                onClose={() => setFollowUpEditor(null)}
                onSave={saveFollowUp}
            />
            <LeadActivityForm
                lead={activityLead}
                saving={activitySaving}
                onClose={() => setActivityLead(null)}
                onSave={saveActivity}
            />
            <ConversionForm lead={conversionLead} saving={outcomeSaving} onClose={() => setConversionLead(null)} onSave={saveConversion} />
            <CompletedLeadForm lead={completedLead?.lead} saving={outcomeSaving} onClose={() => setCompletedLead(null)} onSave={saveCompletedLead} />
            <LostLeadForm lead={lostLead} lostReasons={crmSettings?.lostReasons} saving={outcomeSaving} onClose={() => setLostLead(null)} onSave={saveLostLead} />
            <RecordIncomeForm
                lead={incomeDetail?.lead}
                conversion={incomeDetail?.conversion}
                recordedIncome={incomeDetail?.recordedIncome?.total}
                saving={incomeSaving}
                onClose={() => setIncomeDetail(null)}
                onSave={recordIncome}
            />
            <Modal
                open={Boolean(duplicatePrompt)}
                onClose={() => setDuplicatePrompt(null)}
                title="Possible duplicate lead"
                subtitle="A lead with the same mobile number or email already exists. Review it before continuing."
                icon={Users}
                size="md"
            >
                <div className="divide-y divide-line">
                    {(duplicatePrompt?.duplicates || []).map((lead) => (
                        <div key={lead._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                            <div>
                                <p className="text-sm font-semibold text-heading">{lead.customerName} · {lead.title}</p>
                                <p className="text-xs text-muted">{lead.mobileNumber} · {lead.email || "No email"} · {lead.source} · {lead.statusName}</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => {
                                setDuplicatePrompt(null);
                                setEditor(null);
                                openDetails(lead);
                            }}>View lead</Button>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button variant="secondary" onClick={() => setDuplicatePrompt(null)}>Cancel</Button>
                    <Button onClick={() => {
                        const payload = duplicatePrompt.payload;
                        setDuplicatePrompt(null);
                        save(payload, true);
                    }}>Continue creating anyway</Button>
                </div>
            </Modal>
            <Modal open={notificationsOpen} onClose={() => setNotificationsOpen(false)} title="CRM notifications" subtitle={unreadNotifications ? `${unreadNotifications} unread` : "You're up to date"} icon={Bell} size="md">
                <div className="mb-3 flex justify-end">
                    <Button size="sm" variant="ghost" disabled={!unreadNotifications} onClick={markAllNotificationsRead}>Mark all read</Button>
                </div>
                <div className="divide-y divide-line">
                    {notifications.map((notification) => (
                        <button
                            key={notification._id}
                            type="button"
                            onClick={() => markNotificationRead(notification)}
                            className={`block w-full py-3 text-left ${notification.readAt ? "opacity-70" : "bg-primary/5"}`}
                        >
                            <span className="flex items-start justify-between gap-3">
                                <span>
                                    <span className="block text-sm font-semibold text-heading">{notification.title}</span>
                                    <span className="mt-1 block text-sm text-body">{notification.message}</span>
                                    <span className="mt-1 block text-xs text-muted">{new Date(notification.createdAt).toLocaleString("en-IN")}</span>
                                </span>
                                {!notification.readAt && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                            </span>
                        </button>
                    ))}
                    {!notifications.length && <p className="py-8 text-center text-sm text-muted">No CRM notifications yet.</p>}
                </div>
            </Modal>
            <ConfirmDialog
                open={Boolean(confirmLead)}
                onCancel={() => setConfirmLead(null)}
                onConfirm={remove}
                title="Delete lead?"
                message={`Delete ${confirmLead?.customerName || "this lead"}? Its activity, follow-ups, and notifications will also be removed. Converted and Lost leads are retained to preserve outcome history.`}
                confirmLabel="Delete lead"
            />
            <ConfirmDialog
                open={Boolean(mergeSource)}
                onCancel={() => setMergeSource(null)}
                onConfirm={mergeLead}
                title="Merge duplicate lead?"
                message={`Merge ${mergeSource?.source?.customerName || "this lead"} into ${detail?.lead?.customerName || "the current lead"}? The original record and its activity history will be retained in the archive; its follow-ups move to the selected lead.`}
                confirmLabel="Merge and archive original"
            />

            <Modal open={statusManager} onClose={() => setStatusManager(false)} title="Manage lead statuses" subtitle="Customize your pipeline. Deactivated statuses remain attached to existing leads." icon={Settings2} size="lg">
                <div className="space-y-4">
                    <form onSubmit={saveStatus} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
                        <Input label="Status name" value={statusForm.name} onChange={(event) => setStatusForm({ ...statusForm, name: event.target.value })} required maxLength={40} />
                        <label className="block text-xs font-semibold text-muted">Color<input className="mt-1 block h-11 w-14 cursor-pointer rounded-lg border border-line bg-surface p-1" type="color" value={statusForm.color} onChange={(event) => setStatusForm({ ...statusForm, color: event.target.value })} /></label>
                        <Input label="Order" type="number" min="0" max="999" value={statusForm.order} onChange={(event) => setStatusForm({ ...statusForm, order: event.target.value })} />
                        <Button type="submit">{statusEditor ? "Save status" : "Add status"}</Button>
                    </form>
                    {statusEditor && <Button variant="ghost" size="sm" onClick={() => { setStatusEditor(null); setStatusForm({ name: "", color: "#2563eb", order: 99 }); }}>Cancel editing</Button>}
                    <div className="divide-y divide-line rounded-xl border border-line">
                        {statuses.map((status) => (
                            <div key={status._id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
                                <span className="flex items-center gap-2 text-sm font-medium text-heading">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }} />
                                    {status.name}
                                    {!status.active && <Badge>Inactive</Badge>}
                                </span>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => { setStatusEditor(status); setStatusForm({ name: status.name, color: status.color, order: status.order }); }}>Edit</Button>
                                    {status.systemKey === "completed"
                                        ? <Button size="sm" variant="secondary" disabled>Always active</Button>
                                        : <Button size="sm" variant="secondary" onClick={() => toggleStatus(status)}>{status.active ? "Deactivate" : "Activate"}</Button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
