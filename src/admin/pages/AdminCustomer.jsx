import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Eye, Pencil, Trash2, Lock, AlertCircle } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button, { IconButton } from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Field";
import { SkeletonRows, EmptyState, ErrorState } from "../../components/ui/State";
import { useToast } from "../../components/ui/Toast";

import { getAllCustomers, deleteCustomer } from "../services/adminService";
import { BUSINESS_TYPES, getBusinessType } from "../../config/businessTypes";

const LIMIT = 10;

export default function AdminCustomers() {

    const navigate = useNavigate();
    const toast = useToast();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [businessType, setBusinessType] = useState("all");
    const [status, setStatus] = useState("all");
    const [plan, setPlan] = useState("all");
    const [page, setPage] = useState(1);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            setError("");
            setData(await getAllCustomers({ page, limit: LIMIT, search, status, plan, businessType }));
        } catch (err) {
            setError(err?.response?.data?.message || "Could not load shops");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search, status, plan, businessType]);

    // Debounce typing so every keystroke doesn't hit the API.
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const customers = data?.customers || [];
    const pagination = data?.pagination;

    const confirmDelete = async (e) => {
        e.preventDefault();
        if (!deletePassword.trim()) {
            setDeleteError("Enter your admin password to confirm");
            return;
        }
        try {
            setDeleting(true);
            await deleteCustomer(deleteTarget._id, deletePassword);
            toast.success(`${deleteTarget.Shopname} deleted`);
            setDeleteTarget(null);
            load();
        } catch (err) {
            setDeleteError(err?.response?.data?.message || "Could not delete");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon={Users}
                title="Shops"
                subtitle={`${pagination?.totalCustomers ?? "—"} registered shops`}
                breadcrumbs={false}
            />

            <Card padded={false}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] gap-3 p-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search owner, shop, email or city…"
                            className="w-full h-11 pl-9 pr-3 rounded-lg border border-line bg-surface text-sm text-heading focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            aria-label="Search shops"
                        />
                    </div>
                    <Select
                        value={businessType}
                        onChange={(e) => { setBusinessType(e.target.value); setPage(1); }}
                        aria-label="Business type"
                        options={[{ value: "all", label: "All business types" }, ...BUSINESS_TYPES.map((t) => ({ value: t.id, label: t.shortLabel }))]}
                    />
                    <Select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        aria-label="Plan status"
                        options={[
                            { value: "all", label: "Any plan status" },
                            { value: "active", label: "Active" },
                            { value: "expired", label: "Expired" },
                            { value: "pending", label: "Pending" }
                        ]}
                    />
                    <Select
                        value={plan}
                        onChange={(e) => { setPlan(e.target.value); setPage(1); }}
                        aria-label="Plan"
                        options={[
                            { value: "all", label: "Any plan" },
                            { value: "normal", label: "Normal" },
                            { value: "premium", label: "Premium" },
                            { value: "business", label: "Business" }
                        ]}
                    />
                </div>

                <div className="border-t border-line">
                    {loading ? (
                        <SkeletonRows rows={6} columns={6} />
                    ) : error ? (
                        <div className="p-5"><ErrorState message={error} onRetry={load} /></div>
                    ) : customers.length === 0 ? (
                        <EmptyState icon={Users} title="No shops found" message="Try a different search or filter." />
                    ) : (
                        <div className="overflow-x-auto thin-scrollbar">
                            <table className="w-full min-w-[960px] text-sm">
                                <thead>
                                    <tr className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                                        <th className="py-3 px-5">Shop</th>
                                        <th className="py-3 px-3">Type</th>
                                        <th className="py-3 px-3">Owner</th>
                                        <th className="py-3 px-3">Account</th>
                                        <th className="py-3 px-3">Plan</th>
                                        <th className="py-3 px-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {customers.map((customer) => {
                                        const profile = getBusinessType(customer.businessType);
                                        const Icon = profile.icon;
                                        return (
                                            <tr key={customer._id} className="hover:bg-surface-hover">
                                                <td className="py-3 px-5">
                                                    <button type="button" onClick={() => navigate(`/admin/customers/${customer._id}`)} className="text-left group">
                                                        <p className="font-semibold text-heading group-hover:text-primary transition-colors">{customer.Shopname}</p>
                                                        <p className="text-xs text-muted">{[customer.city, customer.state].filter(Boolean).join(", ") || "—"}</p>
                                                    </button>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="inline-flex items-center gap-2 text-xs font-medium text-body">
                                                        <span className="grid place-items-center h-6 w-6 rounded-md text-white" style={{ backgroundColor: profile.accent }}>
                                                            <Icon className="h-3.5 w-3.5" />
                                                        </span>
                                                        {profile.shortLabel}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <p className="text-heading">{customer.ownerName}</p>
                                                    <p className="text-xs text-muted">{customer.email} · {customer.mobileNumber}</p>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <Badge size="sm" dot tone={customer.isActive ? "success" : "danger"}>
                                                        {customer.isActive ? "Active" : "Deactivated"}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-3">
                                                    {customer.currentSubscription ? (
                                                        <div>
                                                            <p className="font-semibold text-heading capitalize">{customer.currentSubscription.plan}</p>
                                                            <p className="text-xs text-muted capitalize">{customer.subscriptionStatus}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-faint">No plan</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-5">
                                                    <div className="flex justify-end gap-1">
                                                        <IconButton icon={Eye} label="View" size="sm" onClick={() => navigate(`/admin/customers/${customer._id}`)} />
                                                        <IconButton icon={Pencil} label="Edit" size="sm" onClick={() => navigate(`/admin/customers/${customer._id}/edit`)} />
                                                        <IconButton
                                                            icon={Trash2}
                                                            label="Delete"
                                                            size="sm"
                                                            className="hover:!bg-danger/10 hover:!text-danger"
                                                            onClick={() => { setDeleteTarget(customer); setDeletePassword(""); setDeleteError(""); }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-line px-5 py-3">
                        <p className="text-xs text-muted">Page {pagination.currentPage} of {pagination.totalPages}</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                            <Button size="sm" variant="secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                        </div>
                    </div>
                )}
            </Card>

            <Modal
                open={Boolean(deleteTarget)}
                onClose={() => !deleting && setDeleteTarget(null)}
                size="sm"
                icon={Trash2}
                title={`Delete ${deleteTarget?.Shopname}?`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
                        <Button variant="danger" type="submit" form="delete-shop-form" loading={deleting}>Delete permanently</Button>
                    </>
                }
            >
                <form id="delete-shop-form" onSubmit={confirmDelete} className="space-y-4">
                    <p className="text-sm text-body">
                        This permanently deletes the shop account and its subscription history. It can't be undone.
                    </p>
                    <Input
                        label="Your admin password"
                        type="password"
                        icon={Lock}
                        autoFocus
                        value={deletePassword}
                        onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(""); }}
                    />
                    {deleteError && (
                        <p className="flex items-center gap-1.5 text-sm text-danger"><AlertCircle className="h-4 w-4" />{deleteError}</p>
                    )}
                </form>
            </Modal>
        </div>
    );
}
