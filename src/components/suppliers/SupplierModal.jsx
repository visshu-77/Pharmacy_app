import { Truck, Phone, Mail, MapPin, Building2, Map as MapIcon, FileText, AlertCircle } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input } from "../ui/Field";
import { useBusiness } from "../../context/BusinessContext";

/** Add / edit supplier form. Controlled by the Suppliers page. */
export default function SupplierModal({
    show,
    editingSupplier,
    formData,
    onChange,
    onSubmit,
    onClose,
    error,
    loading
}) {
    const { term } = useBusiness();

    if (!show) return null;

    return (
        <Modal
            onClose={onClose}
            size="md"
            icon={Truck}
            title={editingSupplier ? `Edit ${term.supplier.toLowerCase()}` : `Add ${term.supplier.toLowerCase()}`}
            subtitle="Who you buy stock from — used on purchase records and reports"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="supplier-form" loading={loading}>
                        {editingSupplier ? "Save changes" : `Add ${term.supplier.toLowerCase()}`}
                    </Button>
                </>
            }
        >
            <form id="supplier-form" onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    className="sm:col-span-2"
                    label={`${term.supplier} / firm name`}
                    name="supplierName"
                    icon={Truck}
                    placeholder="e.g. Shree Distributors"
                    value={formData.supplierName}
                    onChange={onChange}
                    required
                    autoFocus
                />
                <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    icon={Phone}
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={onChange}
                    required
                />
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    icon={Mail}
                    placeholder="Optional"
                    value={formData.email}
                    onChange={onChange}
                />
                <Input
                    className="sm:col-span-2"
                    label="Address"
                    name="address"
                    icon={MapPin}
                    placeholder="Optional"
                    value={formData.address}
                    onChange={onChange}
                />
                <Input label="City" name="city" icon={Building2} value={formData.city} onChange={onChange} />
                <Input label="State" name="state" icon={MapIcon} value={formData.state} onChange={onChange} />
                <Input
                    className="sm:col-span-2"
                    label="GST number"
                    name="gstNumber"
                    icon={FileText}
                    placeholder="Optional"
                    maxLength={15}
                    value={formData.gstNumber}
                    onChange={onChange}
                />

                {error && (
                    <p className="sm:col-span-2 flex items-center gap-1.5 text-sm text-danger" role="alert">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </p>
                )}
            </form>
        </Modal>
    );
}
