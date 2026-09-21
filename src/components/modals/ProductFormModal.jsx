import { useEffect, useMemo, useRef, useState } from "react";
import {
    PackagePlus,
    PackageCheck,
    Tag,
    Barcode,
    Hash,
    Layers,
    Boxes,
    IndianRupee,
    Percent,
    FileDigit,
    CalendarClock,
    ShieldCheck,
    Truck,
    AlertCircle,
    Award
} from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Field";
import { useToast } from "../ui/Toast";

import { addProduct, updateProduct } from "../../services/productService";
import { getCategory } from "../../services/categoryService";
import { searchSuppliers } from "../../services/supplierService";
import { useBusiness } from "../../context/BusinessContext";

const toDateInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const emptyForm = (profile) => ({
    productName: "",
    productCategory: "",
    sku: "",
    barcode: "",
    brand: "",
    variant: "",
    unit: profile.defaultUnit,
    stock: "",
    lowStockThreshold: "",
    purchase: "",
    sellingPrice: "",
    mrp: "",
    taxRate: String(profile.defaultTaxRate ?? ""),
    hsnCode: "",
    ExpiryDate: "",
    batchNumber: "",
    warrantyMonths: "",
    supplierName: "",
    supplierId: "",
    notes: ""
});

const fromProduct = (product, profile) => ({
    ...emptyForm(profile),
    ...Object.fromEntries(
        Object.entries(product || {}).map(([key, value]) => [
            key,
            value === null || value === undefined ? "" : value
        ])
    ),
    productCategory: product?.productCategory?._id || product?.productCategory || "",
    ExpiryDate: toDateInput(product?.ExpiryDate),
    unit: product?.unit || profile.defaultUnit
});

function Section({ title, description, children }) {
    return (
        <section className="py-5 first:pt-0 border-b border-line last:border-b-0">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-heading">{title}</h3>
                {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
        </section>
    );
}

/**
 * Add / edit form for a stock item. Which fields appear is decided by the
 * shop's business type — a hardware store never sees "Expiry date", an
 * electronics shop gets "Warranty", a pharmacy gets "Batch no." and so on.
 */
export default function ProductFormModal({ product, onClose, onSaved }) {

    const isEdit = Boolean(product?._id);

    const toast = useToast();
    const { profile, term, showField, fields, currencySymbol, lowStockThreshold } = useBusiness();

    const [form, setForm] = useState(() =>
        isEdit ? fromProduct(product, profile) : emptyForm(profile)
    );
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [saving, setSaving] = useState(false);

    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [supplierOpen, setSupplierOpen] = useState(false);
    const supplierTimer = useRef(null);

    useEffect(() => {
        getCategory()
            .then((res) => setCategories(res.result || []))
            .catch((err) => console.log("Categories:", err));
    }, []);

    const set = (name, value) => {
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: undefined }));
        setServerError("");
    };

    const onChange = (e) => set(e.target.name, e.target.value);

    const onSupplierChange = (value) => {
        set("supplierName", value);
        set("supplierId", "");

        clearTimeout(supplierTimer.current);

        if (!value.trim()) {
            setSupplierSuggestions([]);
            setSupplierOpen(false);
            return;
        }

        supplierTimer.current = setTimeout(async () => {
            try {
                const data = await searchSuppliers(value);
                setSupplierSuggestions(data.suppliers || []);
                setSupplierOpen(true);
            } catch {
                setSupplierSuggestions([]);
            }
        }, 250);
    };

    const margin = useMemo(() => {
        const cost = Number(form.purchase);
        const price = Number(form.sellingPrice);
        if (!cost || !price) return null;
        return {
            amount: price - cost,
            percent: ((price - cost) / cost) * 100
        };
    }, [form.purchase, form.sellingPrice]);

    const validate = () => {
        const next = {};

        if (!form.productName.trim()) next.productName = "Name is required";
        if (!form.productCategory) next.productCategory = `Choose a ${term.category.toLowerCase()}`;
        if (form.stock === "" || Number(form.stock) < 0) next.stock = "Enter a stock count (0 or more)";
        if (!form.sellingPrice || Number(form.sellingPrice) <= 0) next.sellingPrice = "Selling price is required";

        if (form.mrp && Number(form.mrp) < Number(form.sellingPrice)) {
            next.mrp = "MRP is lower than the selling price";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        // Only send fields this business type uses.
        const payload = Object.fromEntries(
            Object.entries(form).filter(([key]) => {
                const optional = Object.values(fields);
                return !optional.includes(key) || showField(key) || key === "supplierId";
            })
        );

        try {
            setSaving(true);

            const result = isEdit
                ? await updateProduct(product._id, payload)
                : await addProduct(payload);

            toast.success(
                `${form.productName} ${isEdit ? "updated" : "added to inventory"}`
            );

            onSaved?.(result?.product);
            onClose();

        } catch (err) {
            setServerError(err?.response?.data?.message || "Could not save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const unitOptions = profile.units.includes(form.unit)
        ? profile.units
        : [form.unit, ...profile.units];

    return (
        <Modal
            onClose={onClose}
            size="lg"
            icon={isEdit ? PackageCheck : PackagePlus}
            title={isEdit ? `Edit ${term.itemLower}` : `Add ${term.itemLower}`}
            subtitle={isEdit ? form.productName : `Add a new ${term.itemLower} to your ${profile.shortLabel.toLowerCase()} inventory`}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="product-form" loading={saving}>
                        {isEdit ? "Save changes" : `Add ${term.itemLower}`}
                    </Button>
                </>
            }
        >
            <form id="product-form" onSubmit={handleSubmit} noValidate>

                <Section title="Basics" description={`What the ${term.itemLower} is and where it belongs`}>
                    <Input
                        className="sm:col-span-2"
                        label={`${term.item} name`}
                        name="productName"
                        icon={Tag}
                        placeholder={profile.id === "pharmacy" ? "e.g. Paracetamol 650mg" : profile.id === "hardware" ? "e.g. PVC Pipe 1 inch" : "e.g. Product name"}
                        value={form.productName}
                        onChange={onChange}
                        error={errors.productName}
                        required
                        autoFocus
                    />

                    <Select
                        label={term.category}
                        name="productCategory"
                        icon={Layers}
                        placeholder={`Select ${term.category.toLowerCase()}`}
                        options={categories.map((c) => ({ value: c._id, label: c.categoryName }))}
                        value={form.productCategory}
                        onChange={onChange}
                        error={errors.productCategory}
                        hint={categories.length === 0 ? `Create a ${term.category.toLowerCase()} first` : undefined}
                        required
                    />

                    {showField(fields.BRAND) && (
                        <Input
                            label="Brand / Manufacturer"
                            name="brand"
                            icon={Award}
                            placeholder="Optional"
                            value={form.brand}
                            onChange={onChange}
                        />
                    )}

                    {showField(fields.VARIANT) && (
                        <Input
                            label={profile.id === "clothing" || profile.id === "footwear" ? "Size / Colour" : "Variant / Size"}
                            name="variant"
                            icon={Boxes}
                            placeholder={
                                profile.id === "pharmacy" ? "e.g. 10 tablets" :
                                profile.id === "clothing" ? "e.g. XL / Blue" :
                                profile.id === "hardware" ? "e.g. 12mm" : "e.g. 500 ml"
                            }
                            value={form.variant}
                            onChange={onChange}
                        />
                    )}

                    {showField(fields.SKU) && (
                        <Input label="SKU / Item code" name="sku" icon={Hash} placeholder="Optional" value={form.sku} onChange={onChange} />
                    )}

                    {showField(fields.BARCODE) && (
                        <Input label="Barcode" name="barcode" icon={Barcode} placeholder="Scan or type" value={form.barcode} onChange={onChange} />
                    )}
                </Section>

                <Section title="Stock" description="How much you have and how you sell it">
                    <Input
                        label="Current stock"
                        name="stock"
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        suffix={form.unit}
                        value={form.stock}
                        onChange={onChange}
                        error={errors.stock}
                        required
                    />

                    <Select
                        label="Sold by"
                        name="unit"
                        options={unitOptions}
                        value={form.unit}
                        onChange={onChange}
                    />

                    <Input
                        label="Low stock alert at"
                        name="lowStockThreshold"
                        type="number"
                        min="0"
                        placeholder={`Shop default: ${lowStockThreshold}`}
                        suffix={form.unit}
                        value={form.lowStockThreshold}
                        onChange={onChange}
                        hint="Leave blank to use your shop-wide setting"
                    />

                    {showField(fields.BATCH) && (
                        <Input label="Batch / Lot no." name="batchNumber" icon={FileDigit} placeholder="e.g. B2409" value={form.batchNumber} onChange={onChange} />
                    )}

                    {showField(fields.EXPIRY) && (
                        <Input
                            label={profile.id === "grocery" || profile.id === "bakery" ? "Best before" : "Expiry date"}
                            name="ExpiryDate"
                            type="date"
                            icon={CalendarClock}
                            value={form.ExpiryDate}
                            onChange={onChange}
                        />
                    )}

                    {showField(fields.WARRANTY) && (
                        <Input
                            label="Warranty"
                            name="warrantyMonths"
                            type="number"
                            min="0"
                            icon={ShieldCheck}
                            placeholder="0"
                            suffix="months"
                            value={form.warrantyMonths}
                            onChange={onChange}
                        />
                    )}
                </Section>

                <Section title="Pricing & tax" description={`Per ${form.unit}`}>
                    <Input
                        label="Purchase price"
                        name="purchase"
                        type="number"
                        min="0"
                        step="0.01"
                        icon={IndianRupee}
                        placeholder="0.00"
                        value={form.purchase}
                        onChange={onChange}
                    />

                    <Input
                        label="Selling price"
                        name="sellingPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        icon={IndianRupee}
                        placeholder="0.00"
                        value={form.sellingPrice}
                        onChange={onChange}
                        error={errors.sellingPrice}
                        required
                    />

                    {showField(fields.MRP) && (
                        <Input
                            label="MRP"
                            name="mrp"
                            type="number"
                            min="0"
                            step="0.01"
                            icon={IndianRupee}
                            placeholder="Optional"
                            value={form.mrp}
                            onChange={onChange}
                            error={errors.mrp}
                        />
                    )}

                    {showField(fields.TAX) && (
                        <Select
                            label="GST rate"
                            name="taxRate"
                            icon={Percent}
                            options={["0", "5", "12", "18", "28"].map((rate) => ({ value: rate, label: `${rate}%` }))}
                            value={String(form.taxRate || 0)}
                            onChange={onChange}
                        />
                    )}

                    {showField(fields.HSN) && (
                        <Input label="HSN code" name="hsnCode" icon={FileDigit} placeholder="Optional" value={form.hsnCode} onChange={onChange} />
                    )}

                    {margin && (
                        <div className={`sm:col-span-2 flex items-center justify-between rounded-xl border px-4 py-3 ${margin.amount >= 0 ? "border-success/25 bg-success/5" : "border-danger/25 bg-danger/5"}`}>
                            <span className="text-sm text-muted">Margin per {form.unit}</span>
                            <span className={`text-sm font-bold tabular ${margin.amount >= 0 ? "text-success" : "text-danger"}`}>
                                {currencySymbol}{margin.amount.toFixed(2)} · {margin.percent.toFixed(1)}%
                            </span>
                        </div>
                    )}
                </Section>

                <Section title={term.supplier} description={`Who you buy this ${term.itemLower} from`}>
                    <div className="relative sm:col-span-2">
                        <Input
                            label={`${term.supplier} name`}
                            name="supplierName"
                            icon={Truck}
                            placeholder={`Search your ${term.suppliers.toLowerCase()} or type a new name`}
                            autoComplete="off"
                            value={form.supplierName}
                            onChange={(e) => onSupplierChange(e.target.value)}
                            onFocus={() => supplierSuggestions.length && setSupplierOpen(true)}
                            onBlur={() => setTimeout(() => setSupplierOpen(false), 150)}
                        />

                        {supplierOpen && supplierSuggestions.length > 0 && (
                            <ul className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto thin-scrollbar rounded-xl border border-line bg-surface shadow-lg">
                                {supplierSuggestions.map((supplier) => (
                                    <li key={supplier._id}>
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => {
                                                set("supplierName", supplier.supplierName);
                                                set("supplierId", supplier._id);
                                                setSupplierOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-surface-hover transition-colors"
                                        >
                                            <p className="text-sm font-medium text-heading">{supplier.supplierName}</p>
                                            <p className="text-xs text-muted">{[supplier.phone, supplier.city].filter(Boolean).join(" · ")}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <Textarea
                        className="sm:col-span-2"
                        label="Notes"
                        name="notes"
                        rows={2}
                        placeholder={profile.id === "mobile" ? "IMEI, colour, storage…" : profile.id === "autoparts" ? "Fits: Maruti Swift 2018+…" : "Anything worth remembering"}
                        value={form.notes}
                        onChange={onChange}
                    />
                </Section>

                {serverError && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger/25 bg-danger/5 px-3 py-2.5" role="alert">
                        <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                        <p className="text-sm text-danger">{serverError}</p>
                    </div>
                )}
            </form>
        </Modal>
    );
}
