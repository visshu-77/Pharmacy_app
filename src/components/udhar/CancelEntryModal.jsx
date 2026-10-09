import { useEffect, useState } from "react";
import { Undo2, PackagePlus } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Textarea } from "../ui/Field";
import { useBusiness } from "../../context/BusinessContext";

/**
 * Cancels a ledger entry. Nothing is deleted: the entry stays and an
 * opposite one is written against it, which is why a reason is required.
 */
export default function CancelEntryModal({ show, entry, onClose, onConfirm, loading }) {

    const { term, formatMoney } = useBusiness();

    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (show) {
            setReason("");
            setError("");
        }
    }, [show, entry?._id]);

    if (!show || !entry) return null;

    const isSale = entry.type === "CREDIT_SALE";
    const movesStock = Boolean(entry.orderId);

    const submit = () => {
        if (reason.trim().length < 3) {
            setError("Say why in a few words — it stays on the record");
            return;
        }

        onConfirm(reason.trim());
    };

    return (
        <Modal
            onClose={loading ? undefined : onClose}
            closeOnBackdrop={!loading}
            size="sm"
            icon={Undo2}
            title="Cancel this entry"
            subtitle={`${isSale ? "Udhar given" : entry.type === "PAYMENT" ? "Payment received" : "Adjustment"} · ${formatMoney(entry.amount, { decimals: 2 })}`}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>Keep it</Button>
                    <Button variant="danger" onClick={submit} loading={loading}>Cancel entry</Button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-body leading-relaxed">
                    The entry stays in the khata and a matching reversal is written against it, so the
                    history still adds up. The balance goes back to what it was.
                </p>

                {movesStock && (
                    <p className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5 text-xs text-heading">
                        <PackagePlus className="h-4 w-4 shrink-0 mt-0.5" />
                        The {term.itemsLower} on this entry go back into your stock.
                    </p>
                )}

                <Textarea
                    label="Reason"
                    rows={2}
                    value={reason}
                    maxLength={250}
                    placeholder="e.g. entered against the wrong customer"
                    onChange={(e) => { setReason(e.target.value); setError(""); }}
                    error={error}
                    required
                    autoFocus
                />
            </div>
        </Modal>
    );
}
