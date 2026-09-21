import { useEffect, useState } from "react";
import { Package } from "lucide-react";

import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import { Spinner, ErrorState } from "../ui/State";

import { singleProduct } from "../../services/productService";
import { useBusiness } from "../../context/BusinessContext";

function Detail({ label, children }) {
    return (
        <div className="rounded-xl border border-line bg-surface-muted px-4 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-faint">{label}</dt>
            <dd className="mt-1 text-sm font-semibold text-heading break-words">{children || "—"}</dd>
        </div>
    );
}

export default function ViewProductModal({ productId, onClose }) {

    const {
        term,
        profile,
        showField,
        fields,
        formatMoney,
        getStockStatus,
        getExpiryStatus
    } = useBusiness();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!productId) return;

        setLoading(true);
        singleProduct(productId)
            .then((data) => setProduct(data.product))
            .catch((err) => setError(err?.response?.data?.message || `Could not load this ${term.itemLower}`))
            .finally(() => setLoading(false));
    }, [productId, term.itemLower]);

    const stock = product ? getStockStatus(product) : null;
    const expiry = product ? getExpiryStatus(product) : null;

    const margin =
        product && product.purchase > 0
            ? ((product.sellingPrice - product.purchase) / product.purchase) * 100
            : null;

    return (
        <Modal
            onClose={onClose}
            size="lg"
            icon={Package}
            title={product?.productName || `${term.item} details`}
            subtitle={product?.productCategory?.categoryName}
        >
            {loading ? (
                <Spinner />
            ) : error ? (
                <ErrorState message={error} />
            ) : product && (
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={stock.tone} dot>{stock.label}</Badge>
                        {expiry && <Badge tone={expiry.tone}>{expiry.label}</Badge>}
                        {product.brand && <Badge tone="neutral">{product.brand}</Badge>}
                        {product.variant && <Badge tone="neutral">{product.variant}</Badge>}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">In stock</p>
                            <p className="mt-1 text-xl font-bold text-heading tabular">
                                {product.stock} <span className="text-sm font-medium text-muted">{product.unit}</span>
                            </p>
                        </div>
                        <div className="rounded-xl bg-surface-muted border border-line px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Selling</p>
                            <p className="mt-1 text-xl font-bold text-heading tabular">{formatMoney(product.sellingPrice, { decimals: 2 })}</p>
                        </div>
                        <div className="rounded-xl bg-surface-muted border border-line px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Cost</p>
                            <p className="mt-1 text-xl font-bold text-heading tabular">{formatMoney(product.purchase, { decimals: 2 })}</p>
                        </div>
                        <div className="rounded-xl bg-surface-muted border border-line px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Margin</p>
                            <p className={`mt-1 text-xl font-bold tabular ${margin === null ? "text-faint" : margin >= 0 ? "text-success" : "text-danger"}`}>
                                {margin === null ? "—" : `${margin.toFixed(1)}%`}
                            </p>
                        </div>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Detail label={term.category}>{product.productCategory?.categoryName}</Detail>
                        <Detail label={term.supplier}>{product.supplierName}</Detail>
                        {showField(fields.SKU) && <Detail label="SKU">{product.sku}</Detail>}
                        {showField(fields.BARCODE) && <Detail label="Barcode">{product.barcode}</Detail>}
                        {showField(fields.MRP) && <Detail label="MRP">{product.mrp ? formatMoney(product.mrp, { decimals: 2 }) : null}</Detail>}
                        {showField(fields.TAX) && <Detail label="GST rate">{`${product.taxRate || 0}%`}</Detail>}
                        {showField(fields.HSN) && <Detail label="HSN code">{product.hsnCode}</Detail>}
                        {showField(fields.BATCH) && <Detail label="Batch no.">{product.batchNumber}</Detail>}
                        {showField(fields.EXPIRY) && (
                            <Detail label={profile.id === "grocery" || profile.id === "bakery" ? "Best before" : "Expiry date"}>
                                {product.ExpiryDate ? new Date(product.ExpiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null}
                            </Detail>
                        )}
                        {showField(fields.WARRANTY) && <Detail label="Warranty">{product.warrantyMonths ? `${product.warrantyMonths} months` : null}</Detail>}
                        <Detail label="Stock value (cost)">{formatMoney((product.stock || 0) * (product.purchase || 0))}</Detail>
                        <Detail label="Last updated">
                            {product.updatedAt ? new Date(product.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null}
                        </Detail>
                    </dl>

                    {product.notes && (
                        <div className="rounded-xl border border-line px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Notes</p>
                            <p className="mt-1 text-sm text-body whitespace-pre-wrap">{product.notes}</p>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
