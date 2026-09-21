import { useEffect, useState } from "react";
import { Tags, Package } from "lucide-react";

import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import { Spinner, EmptyState, ErrorState } from "../ui/State";

import { viewCategory } from "../../services/categoryService";
import { useBusiness } from "../../context/BusinessContext";

export default function ViewCategoryModal({ categoryId, onClose }) {

    const { term, profile, formatMoney, formatNumber, getStockStatus, getExpiryStatus } = useBusiness();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!categoryId) return;

        viewCategory(categoryId)
            .then(setData)
            .catch((err) => setError(err?.response?.data?.message || "Could not load details"))
            .finally(() => setLoading(false));
    }, [categoryId]);

    const products = data?.products || [];
    const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
    const stockValue = products.reduce((sum, p) => sum + Number(p.stock || 0) * Number(p.purchase || 0), 0);

    return (
        <Modal
            onClose={onClose}
            size="xl"
            icon={Tags}
            title={data?.category?.categoryName || term.category}
            subtitle={data?.category?.description || undefined}
        >
            {loading ? (
                <Spinner />
            ) : error ? (
                <ErrorState message={error} />
            ) : (
                <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: term.items, value: formatNumber(products.length) },
                            { label: "Units in stock", value: formatNumber(totalStock) },
                            { label: "Stock value", value: formatMoney(stockValue) }
                        ].map((kpi) => (
                            <div key={kpi.label} className="rounded-xl border border-line bg-surface-muted px-4 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">{kpi.label}</p>
                                <p className="mt-1 text-lg font-bold text-heading tabular">{kpi.value}</p>
                            </div>
                        ))}
                    </div>

                    {products.length === 0 ? (
                        <EmptyState
                            icon={Package}
                            title={`No ${term.itemsLower} here yet`}
                            message={`Assign ${term.itemsLower} to this ${term.category.toLowerCase()} from the ${term.items} page.`}
                        />
                    ) : (
                        <div className="overflow-x-auto thin-scrollbar rounded-xl border border-line">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead>
                                    <tr className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                                        <th className="py-3 px-4">{term.item}</th>
                                        <th className="py-3 px-3 text-right">Stock</th>
                                        <th className="py-3 px-3 text-right">Price</th>
                                        {profile.tracksExpiry && <th className="py-3 px-3">Expiry</th>}
                                        <th className="py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {products.map((product) => {
                                        const status = getStockStatus(product);
                                        const expiry = getExpiryStatus(product);
                                        return (
                                            <tr key={product._id || product.id} className="hover:bg-surface-hover">
                                                <td className="py-3 px-4">
                                                    <p className="font-semibold text-heading">{product.productName}</p>
                                                    <p className="text-xs text-muted">{product.supplierName || "—"}</p>
                                                </td>
                                                <td className="py-3 px-3 text-right tabular font-semibold text-heading">
                                                    {formatNumber(product.stock)} <span className="text-xs text-faint font-normal">{product.unit}</span>
                                                </td>
                                                <td className="py-3 px-3 text-right tabular">{formatMoney(product.sellingPrice, { decimals: 2 })}</td>
                                                {profile.tracksExpiry && (
                                                    <td className="py-3 px-3">
                                                        {product.ExpiryDate
                                                            ? <span className={expiry?.tone === "danger" ? "text-danger font-semibold" : expiry?.tone === "warning" ? "text-warning font-semibold" : "text-body"}>
                                                                {new Date(product.ExpiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                                                            </span>
                                                            : <span className="text-faint">—</span>}
                                                    </td>
                                                )}
                                                <td className="py-3 px-4"><Badge tone={status.tone} dot size="sm">{status.label}</Badge></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
