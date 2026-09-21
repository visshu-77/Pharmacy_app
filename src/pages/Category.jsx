import { useEffect, useMemo, useState } from "react";
import { Tags, Plus, Search, Eye, Pencil, Trash2, Package, Sparkles } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Button, { IconButton } from "../components/ui/Button";
import Card from "../components/ui/Card";
import { ConfirmDialog } from "../components/ui/Modal";
import { EmptyState, SkeletonCards } from "../components/ui/State";
import { useToast } from "../components/ui/Toast";

import CategoryFormModal from "../components/modals/CategoryFormModal";
import ViewCategoryModal from "../components/modals/viewCategoryModal";

import {
    getCategory,
    addCategory,
    deleteCategory,
    deleteSingleCategories,
    deleteAllCategories
} from "../services/categoryService";
import { useBusiness } from "../context/BusinessContext";

// Soft, fixed palette so each category keeps a recognisable tile colour.
const TILE_TONES = [
    "bg-primary/10 text-primary",
    "bg-success/10 text-success",
    "bg-warning/10 text-warning",
    "bg-info/10 text-info",
    "bg-danger/10 text-danger",
    "bg-accent/10 text-accent"
];

const toneFor = (name = "") => {
    let hash = 0;
    for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return TILE_TONES[hash % TILE_TONES.length];
};

export default function CategoryPage() {

    const toast = useToast();
    const { term, profile, formatNumber } = useBusiness();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);

    const [formCategory, setFormCategory] = useState(null);
    const [viewId, setViewId] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [busy, setBusy] = useState(false);
    const [seeding, setSeeding] = useState(false);

    const load = async () => {
        try {
            const result = await getCategory();
            setCategories(result.result || []);
        } catch (err) {
            toast.error(err?.response?.data?.message || `Could not load ${term.categories.toLowerCase()}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return categories.filter((c) =>
            !q ||
            c.categoryName?.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q)
        );
    }, [categories, search]);

    const totalItems = categories.reduce((sum, c) => sum + Number(c.productCount || 0), 0);
    const emptyCategories = categories.filter((c) => !c.productCount).length;

    const missingStarters = profile.defaultCategories.filter(
        (name) => !categories.some((c) => c.categoryName?.toLowerCase() === name.toLowerCase())
    );

    const addStarters = async () => {
        try {
            setSeeding(true);
            await Promise.all(missingStarters.map((categoryName) => addCategory({ categoryName, description: "" })));
            await load();
            toast.success(`Added ${missingStarters.length} ${term.categories.toLowerCase()}`);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Could not add starter categories");
        } finally {
            setSeeding(false);
        }
    };

    const toggle = (id) =>
        setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);

    const runConfirm = async () => {
        try {
            setBusy(true);

            if (confirm.type === "one") {
                await deleteCategory(confirm.category._id);
                setCategories((prev) => prev.filter((c) => c._id !== confirm.category._id));
                toast.success(`${confirm.category.categoryName} deleted`);
            } else if (confirm.type === "selected") {
                await deleteSingleCategories(selected);
                setCategories((prev) => prev.filter((c) => !selected.includes(c._id)));
                toast.success(`${selected.length} deleted`);
                setSelected([]);
            } else {
                await deleteAllCategories();
                setCategories([]);
                setSelected([]);
                toast.success(`All ${term.categories.toLowerCase()} deleted`);
            }

            setConfirm(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Delete failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon={Tags}
                title={term.categories}
                subtitle={
                    loading
                        ? "Loading…"
                        : `${formatNumber(categories.length)} ${term.categories.toLowerCase()} · ${formatNumber(totalItems)} ${term.itemsLower}${emptyCategories ? ` · ${emptyCategories} empty` : ""}`
                }
                actions={
                    <Button icon={Plus} onClick={() => setFormCategory({})}>
                        New {term.category.toLowerCase()}
                    </Button>
                }
            />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Search ${term.categories.toLowerCase()}…`}
                        className="w-full h-11 pl-9 pr-3 rounded-lg border border-line bg-surface text-sm text-heading focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        aria-label={`Search ${term.categories.toLowerCase()}`}
                    />
                </div>

                {selected.length > 0 && (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <span className="text-sm text-muted">{selected.length} selected</span>
                        <Button variant="danger-soft" icon={Trash2} onClick={() => setConfirm({ type: "selected" })}>
                            Delete
                        </Button>
                        <Button variant="ghost" onClick={() => setSelected([])}>Clear</Button>
                    </div>
                )}
            </div>

            {!loading && missingStarters.length > 0 && categories.length < 3 && (
                <Card className="flex flex-col sm:flex-row sm:items-center gap-4 bg-primary/5 border-primary/20">
                    <span className="grid place-items-center h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary">
                        <Sparkles className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-heading">Start with common {profile.shortLabel.toLowerCase()} {term.categories.toLowerCase()}</p>
                        <p className="text-sm text-muted mt-0.5 truncate">{missingStarters.join(" · ")}</p>
                    </div>
                    <Button variant="soft" loading={seeding} onClick={addStarters}>
                        Add {missingStarters.length}
                    </Button>
                </Card>
            )}

            {loading ? (
                <SkeletonCards count={8} className="lg:grid-cols-4" />
            ) : filtered.length === 0 ? (
                <Card padded={false}>
                    <EmptyState
                        icon={Tags}
                        title={categories.length ? "No matches" : `No ${term.categories.toLowerCase()} yet`}
                        message={categories.length ? "Try a different search." : `${term.categories} help you organise ${term.itemsLower} and see which groups sell best.`}
                        action={!categories.length && <Button icon={Plus} onClick={() => setFormCategory({})}>New {term.category.toLowerCase()}</Button>}
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {filtered.map((category) => {
                        const isSelected = selected.includes(category._id);
                        const count = Number(category.productCount || 0);

                        return (
                            <Card
                                key={category._id}
                                hover
                                className={`relative flex flex-col ${isSelected ? "ring-2 ring-primary border-primary" : ""}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className={`grid place-items-center h-11 w-11 rounded-xl text-base font-bold ${toneFor(category.categoryName)}`}>
                                        {category.categoryName?.[0]?.toUpperCase() || "?"}
                                    </span>

                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggle(category._id)}
                                        className="h-4 w-4 mt-1"
                                        aria-label={`Select ${category.categoryName}`}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setViewId(category._id)}
                                    className="mt-4 text-left group"
                                >
                                    <h3 className="font-semibold text-heading truncate group-hover:text-primary transition-colors">
                                        {category.categoryName}
                                    </h3>
                                    <p className="text-xs text-muted mt-1 line-clamp-2 min-h-[2rem]">
                                        {category.description || "No description"}
                                    </p>
                                </button>

                                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                                    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${count ? "text-heading" : "text-faint"}`}>
                                        <Package className="h-4 w-4 text-faint" />
                                        {formatNumber(count)} {count === 1 ? term.itemLower : term.itemsLower}
                                    </span>

                                    <div className="flex items-center -mr-1.5">
                                        <IconButton icon={Eye} label="View" size="sm" onClick={() => setViewId(category._id)} />
                                        <IconButton icon={Pencil} label="Edit" size="sm" onClick={() => setFormCategory(category)} />
                                        <IconButton
                                            icon={Trash2}
                                            label="Delete"
                                            size="sm"
                                            className="hover:!bg-danger/10 hover:!text-danger"
                                            onClick={() => setConfirm({ type: "one", category })}
                                        />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {!loading && categories.length > 0 && (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirm({ type: "all" })}>
                        Delete all {term.categories.toLowerCase()}
                    </Button>
                </div>
            )}

            {formCategory && (
                <CategoryFormModal
                    category={formCategory._id ? formCategory : null}
                    onClose={() => setFormCategory(null)}
                    onSaved={() => load()}
                />
            )}

            {viewId && <ViewCategoryModal categoryId={viewId} onClose={() => setViewId(null)} />}

            <ConfirmDialog
                open={Boolean(confirm)}
                loading={busy}
                onCancel={() => setConfirm(null)}
                onConfirm={runConfirm}
                confirmLabel="Delete"
                title={
                    confirm?.type === "one"
                        ? `Delete ${confirm.category.categoryName}?`
                        : confirm?.type === "selected"
                            ? `Delete ${selected.length} ${term.categories.toLowerCase()}?`
                            : `Delete all ${term.categories.toLowerCase()}?`
                }
                message={`${term.items} in ${confirm?.type === "one" ? "this" : "these"} ${term.category.toLowerCase()} will stay in your inventory but lose their grouping.`}
            />
        </div>
    );
}
