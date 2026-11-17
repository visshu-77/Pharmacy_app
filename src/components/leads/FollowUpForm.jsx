import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";

import Button from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Field";
import Modal from "../ui/Modal";

const DEFAULT_TYPES = ["Phone Call", "WhatsApp", "Email", "Online Meeting", "Physical Meeting", "Other"];
const REMINDERS = [
    { value: "0", label: "No reminder" },
    { value: "15", label: "15 minutes before" },
    { value: "60", label: "1 hour before" },
    { value: "1440", label: "1 day before" }
];
const localDateTime = (date) => {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function FollowUpForm({ lead, followUp, followUpTypes = DEFAULT_TYPES, saving, onClose, onSave }) {
    const [form, setForm] = useState({
        type: "Phone Call",
        scheduledAt: localDateTime(new Date(Date.now() + 60 * 60 * 1000)),
        assignedEmployee: "",
        reminderMinutes: "0",
        description: ""
    });

    useEffect(() => {
        if (followUp) {
            setForm({
                type: followUp.type,
                scheduledAt: localDateTime(new Date(followUp.scheduledAt)),
                assignedEmployee: followUp.assignedEmployee || "",
                reminderMinutes: String(followUp.reminderMinutes || 0),
                description: followUp.description || ""
            });
        } else {
            setForm({
                type: "Phone Call",
                scheduledAt: localDateTime(new Date(Date.now() + 60 * 60 * 1000)),
                assignedEmployee: lead?.assignedEmployee || "",
                reminderMinutes: "0",
                description: ""
            });
        }
    }, [lead, followUp]);

    const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
    const submit = (event) => {
        event.preventDefault();
        const scheduledAt = new Date(form.scheduledAt);
        onSave({
            ...(followUp ? { status: "Rescheduled" } : { leadId: lead._id }),
            type: form.type,
            scheduledAt: scheduledAt.toISOString(),
            assignedEmployee: form.assignedEmployee,
            reminderMinutes: Number(form.reminderMinutes),
            description: form.description
        });
    };

    return (
        <Modal
            open={Boolean(lead)}
            onClose={onClose}
            title={followUp ? "Reschedule follow-up" : "Schedule follow-up"}
            subtitle={`For ${lead?.customerName || "selected lead"}`}
            icon={CalendarClock}
            size="md"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="lead-followup-form" loading={saving}>{followUp ? "Reschedule" : "Schedule follow-up"}</Button>
                </>
            }
        >
            <form id="lead-followup-form" onSubmit={submit} className="space-y-4">
                <Select label="Follow-up type" value={form.type} onChange={set("type")} options={followUpTypes} required />
                <Input label="Date and time" type="datetime-local" value={form.scheduledAt} onChange={set("scheduledAt")} required />
                <Input label="Assigned employee" value={form.assignedEmployee} onChange={set("assignedEmployee")} maxLength={120} />
                <Select label="Reminder" value={form.reminderMinutes} onChange={set("reminderMinutes")} options={REMINDERS} />
                <Textarea label="Description" value={form.description} onChange={set("description")} maxLength={2000} rows={3} />
            </form>
        </Modal>
    );
}
