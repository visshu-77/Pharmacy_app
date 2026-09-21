import { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { Truck, Plus, Upload, Download, Search, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Button, { IconButton } from "../components/ui/Button";
import Card from "../components/ui/Card";
import { ConfirmDialog } from "../components/ui/Modal";
import { EmptyState, SkeletonRows } from "../components/ui/State";
import { useToast } from "../components/ui/Toast";
import Pagination from "../components/pagination";

import SupplierModal from "../components/suppliers/SupplierModal";
import ImportSupplierModal from "../components/suppliers/ImportSupplierModal";

import { api } from "../services/api";
import {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    deleteSelectedSuppliers
} from "../services/supplierService";
import { useBusiness } from "../context/BusinessContext";

const PAGE_SIZE = 10;

const EMPTY_FORM = {
    supplierName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    gstNumber: ""
};

const initials = (name = "") =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";

export default function Suppliers() {

    const toast = useToast();
    const { term, formatNumber } = useBusiness();

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const [confirm, setConfirm] = useState(null);
    const [busy, setBusy] = useState(false);

    const fileRef = useRef(null);
    const [importData, setImportData] = useState([]);
    const [showImport, setShowImport] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importSuccess, setImportSuccess] = useState(false);

    const load = async () => {
        try {
            const data = await getSuppliers();
            setSuppliers(data.suppliers || []);
        } catch (err) {
            toast.error(err?.response?.data?.message || `Could not load ${term.suppliers.toLowerCase()}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return suppliers;
        return suppliers.filter((s) =>
            [s.supplierName, s.phone, s.email, s.city, s.state, s.gstNumber]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q))
        );
    }, [suppliers, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const pageIds = pageItems.map((s) => s._id);
    const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

    // ---------------- form ----------------

    const openForm = (supplier = null) => {
        setEditing(supplier);
        setFormError("");
        setFormData(
            supplier
                ? Object.fromEntries(Object.keys(EMPTY_FORM).map((key) => [key, supplier[key] || ""]))
                : EMPTY_FORM
        );
        setShowForm(true);
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setFormError("");

            if (editing) {
                await updateSupplier(editing._id, formData);
            } else {
                await createSupplier(formData);
            }

            await load();
            setShowForm(false);
            toast.success(`${formData.supplierName} ${editing ? "updated" : "added"}`);
        } catch (err) {
            setFormError(err?.response?.data?.message || `Could not save ${term.supplier.toLowerCase()}`);
        } finally {
            setSaving(false);
        }
    };

    // ---------------- delete ----------------

    const runConfirm = async () => {
        try {
            setBusy(true);
            if (confirm.type === "one") {
                await deleteSupplier(confirm.supplier._id);
                toast.success(`${confirm.supplier.supplierName} deleted`);
            } else {
                await deleteSelectedSuppliers(selected);
                toast.success(`${selected.length} deleted`);
                setSelected([]);
            }
            await load();
            setConfirm(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Delete failed");
        } finally {
            setBusy(false);
        }
    };

    // ---------------- CSV ----------------

    const exportCSV = () => {
        const headers = ["Supplier Name", "Phone", "Email", "Address", "City", "State", "GST Number"];
        const rows = suppliers.map((s) => [s.supplierName, s.phone, s.email, s.address, s.city, s.state, s.gstNumber]);
        const csv = [headers, ...rows]
            .map((row) => row.map((value) => `"${String(value || "").replace(/"/g, '""')}"`).join(","))
            .join("\n");

        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `${term.suppliers.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const onCSVSelected = (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".csv")) {
            toast.warning("Please choose a .csv file");
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setImportData(
                    results.data.map((row) => ({
                        supplierName: row["Supplier Name"]?.trim() || "",
                        phone: row["Phone"]?.trim() || "",
                        email: row["Email"]?.trim() || "",
                        address: row["Address"]?.trim() || "",
                        city: row["City"]?.trim() || "",
                        state: row["State"]?.trim() || "",
                        gstNumber: row["GST Number"]?.trim() || ""
                    }))
                );
                setImportSuccess(false);
                setImportProgress(0);
                setShowImport(true);
            },
            error: () => toast.error("Could not read that CSV file")
        });
    };

    const runImport = async () => {
        try {
            setImportLoading(true);
            setImportProgress(30);

            await api.post(
                "/supplier/import",
                { suppliers: importData.filter((row) => row.supplierName) },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setImportProgress(100);
            setImportSuccess(true);
            await load();
        } catch (err) {
            setImportProgress(0);
            toast.error(err?.response?.data?.message || "Import failed");
        } finally {
            setImportLoading(false);
        }
    };

    const closeImport = () => {
        setShowImport(false);
        setImportData([]);
        setImportSuccess(false);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon={Truck}
                title={term.suppliers}
                subtitle={loading ? "Loading…" : `${formatNumber(suppliers.length)} ${term.suppliers.toLowerCase()} you buy stock from`}
                actions={
                    <>
                        <Button variant="secondary" icon={Upload} onClick={() => fileRef.current?.click()}>Import CSV</Button>
                        <Button variant="secondary" icon={Download} onClick={exportCSV} disabled={!suppliers.length}>Export</Button>
                        <Button icon={Plus} onClick={() => openForm()}>Add {term.supplier.toLowerCase()}</Button>
                    </>
                }
            />

            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onCSVSelected} />

            <Card padded={false}>
                <div className="flex flex-col sm:flex-row gap-3 p-4">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by name, phone, city or GST…"
                            className="w-full h-11 pl-9 pr-3 rounded-lg border border-line bg-surface text-sm text-heading focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            aria-label={`Search ${term.suppliers.toLowerCase()}`}
                        />
                    </div>

                    {selected.length > 0 && (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <span className="text-sm text-muted">{selected.length} selected</span>
                            <Button variant="danger-soft" icon={Trash2} onClick={() => setConfirm({ type: "selected" })}>Delete</Button>
                        </div>
                    )}
                </div>

                <div className="border-t border-line">
                    {loading ? (
                        <SkeletonRows rows={5} columns={5} />
                    ) : filtered.length === 0 ? (
                        <EmptyState
                            icon={Truck}
                            title={suppliers.length ? "No matches" : `No ${term.suppliers.toLowerCase()} yet`}
                            message={suppliers.length ? "Try a different search." : `Keep your ${term.suppliers.toLowerCase()}' contacts and GST details in one place.`}
                            action={!suppliers.length && <Button icon={Plus} onClick={() => openForm()}>Add {term.supplier.toLowerCase()}</Button>}
                        />
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto thin-scrollbar">
                                <table className="w-full min-w-[820px] text-sm">
                                    <thead>
                                        <tr className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                                            <th className="py-3 pl-4 pr-2 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={allOnPage}
                                                    onChange={() => setSelected((cur) => allOnPage ? cur.filter((id) => !pageIds.includes(id)) : [...new Set([...cur, ...pageIds])])}
                                                    aria-label="Select all on page"
                                                />
                                            </th>
                                            <th className="py-3 px-3">{term.supplier}</th>
                                            <th className="py-3 px-3">Contact</th>
                                            <th className="py-3 px-3">Location</th>
                                            <th className="py-3 px-3">GST</th>
                                            <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {pageItems.map((s) => (
                                            <tr key={s._id} className={selected.includes(s._id) ? "bg-primary/5" : "hover:bg-surface-hover"}>
                                                <td className="py-3 pl-4 pr-2">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4"
                                                        checked={selected.includes(s._id)}
                                                        onChange={() => setSelected((cur) => cur.includes(s._id) ? cur.filter((id) => id !== s._id) : [...cur, s._id])}
                                                        aria-label={`Select ${s.supplierName}`}
                                                    />
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="grid place-items-center h-9 w-9 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                            {initials(s.supplierName)}
                                                        </span>
                                                        <span className="font-semibold text-heading">{s.supplierName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <p className="text-heading tabular">{s.phone || "—"}</p>
                                                    <p className="text-xs text-muted">{s.email || ""}</p>
                                                </td>
                                                <td className="py-3 px-3 text-body">{[s.city, s.state].filter(Boolean).join(", ") || "—"}</td>
                                                <td className="py-3 px-3 font-mono text-xs text-body">{s.gstNumber || "—"}</td>
                                                <td className="py-3 pl-3 pr-4">
                                                    <div className="flex justify-end gap-1">
                                                        <IconButton icon={Pencil} label="Edit" size="sm" onClick={() => openForm(s)} />
                                                        <IconButton icon={Trash2} label="Delete" size="sm" className="hover:!bg-danger/10 hover:!text-danger" onClick={() => setConfirm({ type: "one", supplier: s })} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <ul className="md:hidden divide-y divide-line">
                                {pageItems.map((s) => (
                                    <li key={s._id} className="p-4 flex items-start gap-3">
                                        <span className="grid place-items-center h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                            {initials(s.supplierName)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-heading truncate">{s.supplierName}</p>
                                            <div className="mt-1 space-y-0.5 text-xs text-muted">
                                                {s.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{s.phone}</p>}
                                                {s.email && <p className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3" />{s.email}</p>}
                                                {(s.city || s.state) && <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{[s.city, s.state].filter(Boolean).join(", ")}</p>}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <IconButton icon={Pencil} label="Edit" size="sm" onClick={() => openForm(s)} />
                                            <IconButton icon={Trash2} label="Delete" size="sm" onClick={() => setConfirm({ type: "one", supplier: s })} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                {!loading && filtered.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-line px-4 py-3">
                        <p className="text-xs text-muted tabular">
                            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {formatNumber(filtered.length)}
                        </p>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                )}
            </Card>

            <SupplierModal
                show={showForm}
                editingSupplier={editing}
                formData={formData}
                onChange={(e) => setFormData((cur) => ({ ...cur, [e.target.name]: e.target.value }))}
                onSubmit={submitForm}
                onClose={() => setShowForm(false)}
                error={formError}
                loading={saving}
            />

            <ImportSupplierModal
                show={showImport}
                importData={importData}
                importLoading={importLoading}
                importProgress={importProgress}
                importSuccess={importSuccess}
                onConfirm={runImport}
                onCancel={closeImport}
                onDone={closeImport}
            />

            <ConfirmDialog
                open={Boolean(confirm)}
                loading={busy}
                onCancel={() => setConfirm(null)}
                onConfirm={runConfirm}
                confirmLabel="Delete"
                title={confirm?.type === "one" ? `Delete ${confirm.supplier.supplierName}?` : `Delete ${selected.length} ${term.suppliers.toLowerCase()}?`}
                message={`${term.items} that list this ${term.supplier.toLowerCase()} keep the name; only the contact record is removed.`}
            />
        </div>
    );
}
