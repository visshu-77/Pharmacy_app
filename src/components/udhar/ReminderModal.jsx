import { useEffect, useState } from "react";
import { BellRing, Copy, Check, MessageCircle, AlertCircle, Loader2 } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Textarea } from "../ui/Field";

import { getReminder } from "../../services/creditService";

/**
 * A polite payment reminder the owner sends themselves.
 *
 * Nothing is messaged automatically: the text is composed, shown in full, and
 * then either copied or handed to WhatsApp with the owner pressing send. It
 * only ever mentions this one customer.
 */
export default function ReminderModal({ show, customer, onClose }) {

    const [loading, setLoading] = useState(true);
    const [reminder, setReminder] = useState(null);
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!show || !customer?._id) return;

        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                setCopied(false);

                const data = await getReminder(customer._id);

                if (cancelled) return;

                setReminder(data.reminder);
                setText(data.reminder.text);

            } catch (err) {
                if (!cancelled) {
                    setError(err?.response?.data?.message || "Could not prepare the reminder");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => { cancelled = true; };
    }, [show, customer?._id]);

    if (!show) return null;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            setError("Could not copy — select the text and copy it by hand.");
        }
    };

    const openWhatsApp = () => {
        // The same route the invoice uses: wa.me opens the chat with the text
        // filled in, and the owner still has to press send.
        window.open(
            `https://wa.me/${reminder?.whatsappPhone || ""}?text=${encodeURIComponent(text)}`,
            "_blank",
            "noopener"
        );
    };

    return (
        <Modal
            onClose={onClose}
            size="md"
            icon={BellRing}
            title="Payment reminder"
            subtitle={customer?.customerName}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button
                        variant="secondary"
                        icon={copied ? Check : Copy}
                        onClick={copy}
                        disabled={loading || !text}
                    >
                        {copied ? "Copied" : "Copy text"}
                    </Button>
                    <Button icon={MessageCircle} onClick={openWhatsApp} disabled={loading || !text}>
                        {reminder?.whatsappPhone ? "Open WhatsApp" : "Share on WhatsApp"}
                    </Button>
                </>
            }
        >
            {loading ? (
                <div className="flex items-center gap-2 py-8 justify-center text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing the message…
                </div>
            ) : error ? (
                <p className="flex items-center gap-1.5 text-sm text-danger" role="alert">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </p>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-muted">
                        Nothing is sent from StoreFlow. Edit the wording if you like, then copy it
                        or open WhatsApp and press send yourself.
                    </p>

                    <Textarea
                        label="Message"
                        rows={12}
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        className="font-mono"
                    />

                    {!reminder?.whatsappPhone && (
                        <p className="text-xs text-faint">
                            No mobile number saved for this customer — WhatsApp will ask you to pick
                            the chat.
                        </p>
                    )}
                </div>
            )}
        </Modal>
    );
}
