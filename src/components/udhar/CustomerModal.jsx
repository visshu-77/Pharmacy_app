import { User, Phone, MapPin, AlertCircle } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Field";

/** Add / edit a khata customer. Controlled by the page that opens it. */
export default function CustomerModal({
    show,
    editing,
    formData,
    onChange,
    onSubmit,
    onClose,
    error,
    loading
}) {
    if (!show) return null;

    return (
        <Modal
            onClose={onClose}
            size="md"
            icon={User}
            title={editing ? "Edit customer" : "Add customer"}
            subtitle="Who the khata is kept for"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="udhar-customer-form" loading={loading}>
                        {editing ? "Save changes" : "Add customer"}
                    </Button>
                </>
            }
        >
            <form
                id="udhar-customer-form"
                onSubmit={onSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
                <Input
                    className="sm:col-span-2"
                    label="Customer name"
                    name="customerName"
                    icon={User}
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.customerName}
                    onChange={onChange}
                    maxLength={80}
                    required
                    autoFocus
                />

                <Input
                    className="sm:col-span-2"
                    label="Mobile number"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    icon={Phone}
                    placeholder="10 digits — optional, but it keeps two people apart"
                    value={formData.phone}
                    onChange={onChange}
                    maxLength={10}
                />

                <Input
                    className="sm:col-span-2"
                    label="Address"
                    name="address"
                    icon={MapPin}
                    placeholder="Optional"
                    value={formData.address}
                    onChange={onChange}
                    maxLength={250}
                />

                <Textarea
                    className="sm:col-span-2"
                    label="Note"
                    name="note"
                    rows={2}
                    placeholder="Optional — e.g. pays every Friday"
                    value={formData.note}
                    onChange={onChange}
                    maxLength={250}
                />

                {error && (
                    <p className="sm:col-span-2 flex items-center gap-1.5 text-sm text-danger" role="alert">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </p>
                )}
            </form>
        </Modal>
    );
}
