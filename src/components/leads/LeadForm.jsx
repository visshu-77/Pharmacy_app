import { useEffect, useState } from "react";
import { Building2, UserRound } from "lucide-react";

import Button from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Field";
import Modal from "../ui/Modal";

const localDate = (value) => {
    const date = value ? new Date(value) : new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const emptyLead = (settings) => ({
    customerName: "",
    companyName: "",
    mobileNumber: "",
    alternateNumber: "",
    email: "",
    whatsappNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    title: "",
    source: settings?.sources?.[0] || "",
    interestedProduct: "",
    expectedBudget: "",
    expectedDealValue: "",
    finalQuotationAmount: "",
    finalAmount: "",
    priority: settings?.priorities?.[0] || "Medium",
    statusId: "",
    assignedEmployee: "",
    description: "",
    notes: "",
    category: "",
    leadDate: localDate()
});

export default function LeadForm({ open, lead, statuses, settings, saving, onClose, onSave }) {
    const [form, setForm] = useState(() => emptyLead(settings));
    const activeStatuses = statuses.filter((status) => status.active);
    const currentStatusId = lead?.statusId?._id || lead?.statusId;
    const selectableStatuses = lead && !activeStatuses.some((status) => status._id === currentStatusId)
        ? [...activeStatuses, ...statuses.filter((status) => status._id === currentStatusId)]
        : activeStatuses;

    useEffect(() => {
        if (!open) return;
        if (lead) {
            setForm({
                ...emptyLead(settings),
                ...lead,
                statusId: lead.statusId?._id || lead.statusId || "",
                expectedBudget: lead.expectedBudget ?? "",
                expectedDealValue: lead.expectedDealValue ?? "",
                finalQuotationAmount: lead.finalQuotationAmount ?? "",
                finalAmount: lead.finalAmount ?? "",
                leadDate: localDate(lead.leadDate)
            });
        } else {
            setForm({
                ...emptyLead(settings),
                statusId: statuses.find((status) => status.active)?._id || "",
                source: settings?.sources?.[0] || "",
                priority: settings?.priorities?.[0] || "Medium"
            });
        }
    }, [open, lead, statuses, settings]);

    const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
    const selectedStatus = statuses.find((status) => status._id === form.statusId);
    const isCompleted = selectedStatus?.systemKey === "completed" ||
        selectedStatus?.name?.trim().toLowerCase() === "completed";
    const handleSubmit = (event) => {
        event.preventDefault();
        const leadFields = { ...form };
        delete leadFields.nextFollowUpAt;
        onSave({
            ...leadFields,
            expectedBudget: form.expectedBudget === "" ? null : Number(form.expectedBudget),
            expectedDealValue: form.expectedDealValue === "" ? null : Number(form.expectedDealValue),
            ...(isCompleted ? {
                finalQuotationAmount: Number(form.finalQuotationAmount),
                finalAmount: Number(form.finalAmount)
            } : {})
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={lead ? "Edit lead" : "Add new lead"}
            subtitle="Save customer and opportunity details to your CRM."
            icon={UserRound}
            size="xl"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="lead-form" loading={saving}>{lead ? "Save changes" : "Create lead"}</Button>
                </>
            }
        >
            <form id="lead-form" onSubmit={handleSubmit} className="space-y-5">
                <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-heading"><UserRound className="h-4 w-4 text-primary" />Customer information</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Input label="Customer name" value={form.customerName} onChange={set("customerName")} required maxLength={120} />
                        <Input label="Company name" value={form.companyName} onChange={set("companyName")} maxLength={120} />
                        <Input label="Mobile number" value={form.mobileNumber} onChange={set("mobileNumber")} required maxLength={20} />
                        <Input label="Alternate number" value={form.alternateNumber} onChange={set("alternateNumber")} maxLength={20} />
                        <Input label="Email" type="email" value={form.email} onChange={set("email")} maxLength={254} />
                        <Input label="WhatsApp number" value={form.whatsappNumber} onChange={set("whatsappNumber")} maxLength={20} />
                        <Input label="City" value={form.city} onChange={set("city")} maxLength={100} />
                        <Input label="State" value={form.state} onChange={set("state")} maxLength={100} />
                        <Input label="Pincode" value={form.pincode} onChange={set("pincode")} maxLength={12} />
                        <Input className="sm:col-span-2 lg:col-span-3" label="Address" value={form.address} onChange={set("address")} maxLength={300} />
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-heading"><Building2 className="h-4 w-4 text-primary" />Lead information</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Input label="Lead title" value={form.title} onChange={set("title")} required maxLength={160} />
                        <Select label="Lead source" value={form.source} onChange={set("source")} required placeholder="Select source" options={settings?.sources || []} />
                        {!!settings?.categories?.length && <Select label="Lead category" value={form.category} onChange={set("category")} placeholder="No category" options={settings.categories} />}
                        <Input label="Interested product / service" value={form.interestedProduct} onChange={set("interestedProduct")} maxLength={160} />
                        <Input label="Expected budget" type="number" min="0" step="0.01" value={form.expectedBudget} onChange={set("expectedBudget")} />
                        <Input label="Expected deal value" type="number" min="0" step="0.01" value={form.expectedDealValue} onChange={set("expectedDealValue")} />
                        {isCompleted && (
                            <>
                                <Input label="Final quotation amount" type="number" min="0" max="10000000000" step="0.01" value={form.finalQuotationAmount} onChange={set("finalQuotationAmount")} required />
                                <Input label="Final amount" type="number" min="0" max="10000000000" step="0.01" value={form.finalAmount} onChange={set("finalAmount")} required />
                            </>
                        )}
                        <Select label="Priority" value={form.priority} onChange={set("priority")} options={settings?.priorities || ["Medium"]} />
                        <Select label="Lead status" value={form.statusId} onChange={set("statusId")} required options={selectableStatuses.map((status) => ({ value: status._id, label: status.active ? status.name : `${status.name} (inactive)` }))} />
                        <Input label="Assigned employee" value={form.assignedEmployee} onChange={set("assignedEmployee")} maxLength={120} />
                        <Input label="Lead creation date" type="date" value={form.leadDate} onChange={set("leadDate")} required />
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Textarea label="Description / requirements" value={form.description} onChange={set("description")} maxLength={3000} rows={3} />
                    <Textarea label="Notes" value={form.notes} onChange={set("notes")} maxLength={5000} rows={3} />
                </section>
            </form>
        </Modal>
    );
}
