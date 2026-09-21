import { useState, useEffect, useRef, useMemo } from "react";
import {
    Trash2,
    Eye,
    Pencil,
    ShoppingCart,
    Package,
    PackageMinus,
    PackageX,
    CalendarClock,
    Search,
    Download,
    Upload,
    Plus,
    X,
    SlidersHorizontal,
    Wallet
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Button, { IconButton } from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import { Select } from "../components/ui/Field";
import { ConfirmDialog } from "../components/ui/Modal";
import { EmptyState, SkeletonRows } from "../components/ui/State";
import { useToast } from "../components/ui/Toast";
import Pagination from "../components/pagination";

import {
    getProducts,
    deleteProduct,
    exportProducts,
    importProducts,
    deleteSingleProducts,
    deleteAllProducts
} from "../services/productService";
import { getCategory } from "../services/categoryService";
import { getSuppliers } from "../services/supplierService";

import ProductFormModal from "../components/modals/ProductFormModal";
import ViewProductModal from "../components/modals/ViewProductModal";
import CartDrawer from "../components/drawer/CartDrawer";

import { useCart } from "../context/CartContext";
import { useBusiness } from "../context/BusinessContext";

const PAGE_SIZE = 10;

const EMPTY_FILTERS = { category: "", supplier: "", status: "", expiry: "" };

export default function ProductPage() {

    const toast = useToast();
    const { addToCart, cart } = useCart();
    const {
        profile,
        term,
        formatMoney,
        formatNumber,
        getStockStatus,
        getExpiryStatus
    } = useBusiness();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState([]);

    const [formProduct, setFormProduct] = useState(null); // null = closed, {} = add, product = edit
    const [viewId, setViewId] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [confirmBusy, setConfirmBusy] = useState(false);

    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

    const loadProducts = async () => {
        try {
            const result = await getProducts();
            setProducts(result.products || []);
        } catch (err) {
            toast.error(err?.response?.data?.message || `Could not load ${term.itemsLower}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();

        Promise.all([getCategory(), getSuppliers()])
            .then(([categoryResult, supplierResult]) => {
                setCategories(categoryResult.result || []);
                setSuppliers(supplierResult.suppliers || []);
            })
            .catch((err) => console.log("Filter data:", err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------------- derived ----------------

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        return products.filter((product) => {
            const haystack = [
                product.productName,
                product.productCategory?.categoryName,
                product.supplierName,
                product.brand,
                product.sku,
                product.barcode
            ].join(" ").toLowerCase();

            if (q && !haystack.includes(q)) return false;
            if (filters.category && product.productCategory?._id !== filters.category) return false;
            if (filters.supplier && product.supplierName !== filters.supplier) return false;
            if (filters.status && getStockStatus(product).key !== filters.status) return false;

            if (filters.expiry) {
                const status = getExpiryStatus(product);
                if (!status || status.key !== filters.expiry) return false;
            }

            return true;
        });
    }, [products, search, filters, getStockStatus, getExpiryStatus]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const counts = useMemo(() => {
        const result = { low: 0, out: 0, soon: 0, value: 0 };
        for (const product of products) {
            const status = getStockStatus(product).key;
            if (status === "low") result.low += 1;
            if (status === "out") result.out += 1;
            const expiry = getExpiryStatus(product);
            if (expiry && (expiry.key === "soon" || expiry.key === "expired")) result.soon += 1;
            result.value += Number(product.stock || 0) * Number(product.purchase || 0);
        }
        return result;
    }, [products, getStockStatus, getExpiryStatus]);

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    const updateFilter = (key, value) => {
        setFilters((current) => ({ ...current, [key]: value }));
        setPage(1);
    };

    const pageIds = pageItems.map((p) => p._id);
    const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

    const toggleSelect = (id) =>
        setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);

    const toggleSelectPage = () =>
        setSelected((current) =>
            allOnPageSelected
                ? current.filter((id) => !pageIds.includes(id))
                : [...new Set([...current, ...pageIds])]
        );

    // ---------------- actions ----------------

    const runConfirm = async () => {
        if (!confirm) return;

        try {
            setConfirmBusy(true);

            if (confirm.type === "one") {
                await deleteProduct(confirm.product._id);
                setProducts((prev) => prev.filter((p) => p._id !== confirm.product._id));
                setSelected((prev) => prev.filter((id) => id !== confirm.product._id));
                toast.success(`${confirm.product.productName} deleted`);
            }

            if (confirm.type === "selected") {
                await deleteSingleProducts(selected);
                setProducts((prev) => prev.filter((p) => !selected.includes(p._id)));
                toast.success(`${selected.length} ${selected.length === 1 ? term.itemLower : term.itemsLower} deleted`);
                setSelected([]);
            }

            if (confirm.type === "all") {
                await deleteAllProducts();
                setProducts([]);
                setSelected([]);
                setPage(1);
                toast.success(`All ${term.itemsLower} deleted`);
            }

            setConfirm(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Delete failed");
        } finally {
            setConfirmBusy(false);
        }
    };

    const handleExport = async () => {
        try {
            const data = await exportProducts();
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${term.itemsLower}-${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error("Export failed");
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        try {
            setImporting(true);
            const result = await importProducts(file);
            await loadProducts();
            setPage(1);

            toast.success(
                `${result.importedCount} imported${result.skippedCount ? `, ${result.skippedCount} skipped` : ""}`,
                { title: "Import complete" }
            );
        } catch (err) {
            toast.error(err?.response?.data?.message || "Import failed");
        } finally {
            setImporting(false);
        }
    };

    const handleAddToCart = (product) => {
        if (getStockStatus(product).key === "out") {
            toast.warning(`${product.productName} is out of stock`);
            return;
        }
        addToCart(product);
        toast.success(`${product.productName} added to bill`, { duration: 1800 });
    };

    // ---------------- render helpers ----------------

    const showExpiry = profile.tracksExpiry;

    const StockBadge = ({ product }) => {
        const status = getStockStatus(product);
        return <Badge tone={status.tone} dot size="sm">{status.label}</Badge>;
    };

    const ExpiryCell = ({ product }) => {
        if (!product.ExpiryDate) return <span className="text-faint">—</span>;
        const status = getExpiryStatus(product);
        return (
            <div>
                <p className="text-sm text-heading tabular">
                    {new Date(product.ExpiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                </p>
                {status && status.key !== "valid" && (
                    <p className={`text-[11px] font-semibold ${status.tone === "danger" ? "text-danger" : "text-warning"}`}>
                        {status.label}
                    </p>
                )}
            </div>
        );
    };

    const RowActions = ({ product }) => (
        <div className="flex items-center justify-end gap-1">
            <IconButton icon={Eye} label="View details" size="sm" onClick={() => setViewId(product._id)} />
            <IconButton icon={Pencil} label="Edit" size="sm" onClick={() => setFormProduct(product)} />
            <IconButton
                icon={Trash2}
                label="Delete"
                size="sm"
                className="hover:!bg-danger/10 hover:!text-danger"
                onClick={() => setConfirm({ type: "one", product })}
            />
            <IconButton
                icon={ShoppingCart}
                label="Add to bill"
                size="sm"
                variant="soft"
                onClick={() => handleAddToCart(product)}
            />
        </div>
    );

    const cartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="space-y-6">

            <PageHeader
                icon={Package}
                title={term.items}
                subtitle={
                    loading
                        ? "Loading inventory…"
                        : `${formatNumber(products.length)} ${products.length === 1 ? term.itemLower : term.itemsLower} across ${formatNumber(categories.length)} ${term.categories.toLowerCase()}`
                }
                actions={
                    <>
                        <Button variant="secondary" icon={Download} onClick={handleExport} disabled={!products.length}>
                            Export
                        </Button>
                        <Button variant="secondary" icon={Upload} loading={importing} onClick={() => fileInputRef.current?.click()}>
                            Import CSV
                        </Button>
                        <Button icon={Plus} onClick={() => setFormProduct({})}>
                            Add {term.itemLower}
                        </Button>
                    </>
                }
            />

            <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleImport} />

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard compact icon={Package} label={`Total ${term.itemsLower}`} value={formatNumber(products.length)} loading={loading} />
                <StatCard compact icon={PackageMinus} tone="warning" label="Low stock" value={formatNumber(counts.low)} loading={loading} />
                {showExpiry ? (
                    <StatCard compact icon={CalendarClock} tone="warning" label="Expiring / expired" value={formatNumber(counts.soon)} loading={loading} />
                ) : (
                    <StatCard compact icon={Wallet} tone="success" label="Stock value (cost)" value={formatMoney(counts.value)} loading={loading} />
                )}
                <StatCard compact icon={PackageX} tone="danger" label="Out of stock" value={formatNumber(counts.out)} loading={loading} />
            </div>

            {/* Toolbar */}
            <Card padded={false}>
                <div className="flex flex-col lg:flex-row gap-3 p-4">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder={`Search by name, brand, SKU or barcode…`}
                            className="w-full h-11 pl-9 pr-3 rounded-lg border border-line bg-surface text-sm text-heading focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            aria-label={`Search ${term.itemsLower}`}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={showFilters || activeFilterCount ? "soft" : "secondary"}
                            icon={SlidersHorizontal}
                            onClick={() => setShowFilters((v) => !v)}
                            className="h-11"
                        >
                            Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
                        </Button>

                        <Button variant="secondary" icon={ShoppingCart} onClick={() => setCartOpen(true)} className="h-11">
                            Bill{cartUnits ? ` (${cartUnits})` : ""}
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className="border-t border-line p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
                        <Select
                            placeholder={`All ${term.categories.toLowerCase()}`}
                            options={categories.map((c) => ({ value: c._id, label: c.categoryName }))}
                            value={filters.category}
                            onChange={(e) => updateFilter("category", e.target.value)}
                            aria-label={term.category}
                        />
                        <Select
                            placeholder={`All ${term.suppliers.toLowerCase()}`}
                            options={suppliers.map((s) => s.supplierName)}
                            value={filters.supplier}
                            onChange={(e) => updateFilter("supplier", e.target.value)}
                            aria-label={term.supplier}
                        />
                        <Select
                            placeholder="Any stock status"
                            options={[
                                { value: "in", label: "In stock" },
                                { value: "low", label: "Low stock" },
                                { value: "out", label: "Out of stock" }
                            ]}
                            value={filters.status}
                            onChange={(e) => updateFilter("status", e.target.value)}
                            aria-label="Stock status"
                        />
                        {showExpiry && (
                            <Select
                                placeholder="Any expiry"
                                options={[
                                    { value: "valid", label: "Valid" },
                                    { value: "soon", label: "Expiring in 30 days" },
                                    { value: "expired", label: "Expired" }
                                ]}
                                value={filters.expiry}
                                onChange={(e) => updateFilter("expiry", e.target.value)}
                                aria-label="Expiry"
                            />
                        )}

                        {activeFilterCount > 0 && (
                            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                                <Button variant="ghost" size="sm" icon={X} onClick={() => { setFilters(EMPTY_FILTERS); setPage(1); }}>
                                    Clear filters
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {selected.length > 0 && (
                    <div className="border-t border-line bg-primary/5 px-4 py-3 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                        <p className="text-sm font-medium text-heading">
                            {selected.length} selected
                            <button type="button" onClick={() => setSelected([])} className="ml-3 text-xs font-semibold text-primary hover:underline">
                                Clear
                            </button>
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="danger-soft" icon={Trash2} onClick={() => setConfirm({ type: "selected" })}>
                                Delete selected
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfirm({ type: "all" })}>
                                Delete all {term.itemsLower}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="border-t border-line">
                    {loading ? (
                        <SkeletonRows rows={6} columns={6} />
                    ) : filtered.length === 0 ? (
                        products.length === 0 ? (
                            <EmptyState
                                icon={Package}
                                title={`No ${term.itemsLower} yet`}
                                message={`Add your first ${term.itemLower} or import a CSV to start billing.`}
                                action={
                                    <div className="flex flex-wrap justify-center gap-2">
                                        <Button icon={Plus} onClick={() => setFormProduct({})}>Add {term.itemLower}</Button>
                                        <Button variant="secondary" icon={Upload} onClick={() => fileInputRef.current?.click()}>Import CSV</Button>
                                    </div>
                                }
                            />
                        ) : (
                            <EmptyState
                                icon={Search}
                                title="No matches"
                                message="Try a different search or clear your filters."
                                action={<Button variant="secondary" onClick={() => { setSearch(""); setFilters(EMPTY_FILTERS); }}>Clear search</Button>}
                            />
                        )
                    ) : (
                        <>
                            {/* Desktop */}
                            <div className="hidden md:block overflow-x-auto thin-scrollbar">
                                <table className="w-full min-w-[960px] text-sm">
                                    <thead>
                                        <tr className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                                            <th className="py-3 pl-4 pr-2 w-10">
                                                <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectPage} className="h-4 w-4" aria-label="Select all on page" />
                                            </th>
                                            <th className="py-3 px-3">{term.item}</th>
                                            <th className="py-3 px-3">{term.category}</th>
                                            <th className="py-3 px-3 text-right">Stock</th>
                                            <th className="py-3 px-3 text-right">Cost</th>
                                            <th className="py-3 px-3 text-right">Price</th>
                                            {showExpiry && <th className="py-3 px-3">Expiry</th>}
                                            <th className="py-3 px-3">Status</th>
                                            <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {pageItems.map((product) => {
                                            const isSelected = selected.includes(product._id);
                                            const stockTone = getStockStatus(product).tone;
                                            return (
                                                <tr key={product._id} className={`transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-surface-hover"}`}>
                                                    <td className="py-3 pl-4 pr-2">
                                                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(product._id)} className="h-4 w-4" aria-label={`Select ${product.productName}`} />
                                                    </td>
                                                    <td className="py-3 px-3 max-w-[280px]">
                                                        <button type="button" onClick={() => setViewId(product._id)} className="text-left group">
                                                            <p className="font-semibold text-heading truncate group-hover:text-primary transition-colors">{product.productName}</p>
                                                            <p className="text-xs text-muted truncate">
                                                                {[product.brand, product.variant, product.supplierName].filter(Boolean).join(" · ") || "—"}
                                                            </p>
                                                        </button>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <Badge size="sm">{product.productCategory?.categoryName || "—"}</Badge>
                                                    </td>
                                                    <td className="py-3 px-3 text-right tabular">
                                                        <span className={`font-semibold ${stockTone === "danger" ? "text-danger" : stockTone === "warning" ? "text-warning" : "text-heading"}`}>
                                                            {formatNumber(product.stock)}
                                                        </span>
                                                        <span className="text-xs text-faint ml-1">{product.unit}</span>
                                                    </td>
                                                    <td className="py-3 px-3 text-right tabular text-muted">{formatMoney(product.purchase, { decimals: 2 })}</td>
                                                    <td className="py-3 px-3 text-right tabular font-semibold text-heading">{formatMoney(product.sellingPrice, { decimals: 2 })}</td>
                                                    {showExpiry && <td className="py-3 px-3"><ExpiryCell product={product} /></td>}
                                                    <td className="py-3 px-3"><StockBadge product={product} /></td>
                                                    <td className="py-3 pl-3 pr-4"><RowActions product={product} /></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile */}
                            <ul className="md:hidden divide-y divide-line">
                                {pageItems.map((product) => (
                                    <li key={product._id} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" checked={selected.includes(product._id)} onChange={() => toggleSelect(product._id)} className="h-4 w-4 mt-1" aria-label={`Select ${product.productName}`} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-semibold text-heading truncate">{product.productName}</p>
                                                    <StockBadge product={product} />
                                                </div>
                                                <p className="text-xs text-muted mt-0.5 truncate">
                                                    {[product.productCategory?.categoryName, product.brand, product.variant].filter(Boolean).join(" · ")}
                                                </p>

                                                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                                                    <div>
                                                        <p className="text-faint">Stock</p>
                                                        <p className="font-semibold text-heading tabular">{formatNumber(product.stock)} {product.unit}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-faint">Price</p>
                                                        <p className="font-semibold text-heading tabular">{formatMoney(product.sellingPrice, { decimals: 2 })}</p>
                                                    </div>
                                                    {showExpiry ? (
                                                        <div>
                                                            <p className="text-faint">Expiry</p>
                                                            <ExpiryCell product={product} />
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p className="text-faint">Cost</p>
                                                            <p className="font-semibold text-heading tabular">{formatMoney(product.purchase, { decimals: 2 })}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-3 -mr-1">
                                                    <RowActions product={product} />
                                                </div>
                                            </div>
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

            {/* Overlays */}
            {formProduct && (
                <ProductFormModal
                    product={formProduct._id ? formProduct : null}
                    onClose={() => setFormProduct(null)}
                    onSaved={(saved) => {
                        if (!saved) {
                            loadProducts();
                            return;
                        }
                        setProducts((prev) =>
                            prev.some((p) => p._id === saved._id)
                                ? prev.map((p) => (p._id === saved._id ? saved : p))
                                : [saved, ...prev]
                        );
                    }}
                />
            )}

            {viewId && <ViewProductModal productId={viewId} onClose={() => setViewId(null)} />}

            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

            <ConfirmDialog
                open={Boolean(confirm)}
                loading={confirmBusy}
                onCancel={() => setConfirm(null)}
                onConfirm={runConfirm}
                confirmLabel="Delete"
                title={
                    confirm?.type === "one"
                        ? `Delete ${confirm.product.productName}?`
                        : confirm?.type === "selected"
                            ? `Delete ${selected.length} ${selected.length === 1 ? term.itemLower : term.itemsLower}?`
                            : `Delete all ${formatNumber(products.length)} ${term.itemsLower}?`
                }
                message={
                    confirm?.type === "all"
                        ? `This permanently removes your entire inventory. Past bills are kept, but you'll need to add or import ${term.itemsLower} again.`
                        : "This can't be undone. Past bills that include it are kept."
                }
            />
        </div>
    );
}
