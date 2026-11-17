import { useState } from "react";
import { Activity } from "lucide-react";

import Button from "../ui/Button";
import { Select, Textarea } from "../ui/Field";
import Modal from "../ui/Modal";

const TYPES = [
    { value: "call_made", label: "Call made" },
    { value: "whatsapp_message", label: "WhatsApp message" },
    { value: "email_sent", label: "Email sent" },
    { value: "meeting_completed", label: "Meeting completed" },
    { value: "notes_added", label: "Notes added" }
];

export default function LeadActivityForm({ lead, saving, onClose, onSave }) {
    const [type, setType] = useState("call_made");
    const [description, setDescription] = useState("");

    const submit = (event) => {
        event.preventDefault();
        onSave({ type, description });
    };

    return (
        <Modal open={Boolean(lead)} onClose={onClose} title="Log lead activity" subtitle={`For ${lead?.customerName || "selected lead"}`} icon={Activity} size="md" footer={
            <>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" form="lead-activity-form" loading={saving}>Save activity</Button>
            </>
        }>
            <form id="lead-activity-form" onSubmit={submit} className="space-y-4">
                <Select label="Activity" value={type} onChange={(event) => setType(event.target.value)} options={TYPES} required />
                <Textarea label="Description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={2000} required />
            </form>
        </Modal>
    );
}
