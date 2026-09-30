import { FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, Loader2, PlusCircle, RefreshCw, SkipForward } from "lucide-react";

import Modal from "./ui/Modal";
import Button from "./ui/Button";

const DUPLICATE_CHOICES = [
    {
        value: "add",
        icon: PlusCircle,
        title: "Add to the stock I have",
        detail: "Best for a delivery or purchase sheet — 20 in the file adds 20 to what is on the shelf."
    },
    {
        value: "replace",
        icon: RefreshCw,
        title: "Replace with the file's stock",
        detail: "Best after a stock count — the number in the file becomes the new stock."
    },
    {
        value: "skip",
        icon: SkipForward,
        title: "Leave them untouched",
        detail: "Only items you do not have yet are added. Nothing existing changes."
    }
];

/**
 * Live status of a CSV import: what to do about items already on file, a real
 * progress bar, row counts, and a list of any rows the server skipped.
 */
export default function ImportProgressModal({ state, label = "rows", onCancel, onClose }) {

    const {
        phase, fileName, total, processed, imported, updated = 0, skipped,
        error, percent, busy, duplicateMode, setDuplicateMode, confirm
    } = state;

    const choosing = phase === "options";

    const tone =
        phase === "error" ? "danger"
            : phase === "cancelled" ? "warning"
                : phase === "done" && skipped.length ? "warning"
                    : phase === "done" ? "success"
                        : "primary";

    const barColour = {
        primary: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        danger: "bg-danger"
    }[tone];

    const title = {
        options: "Before we import",
        reading: "Reading your file…",
        importing: `Importing ${label}…`,
        done: "Import complete",
        cancelled: "Import stopped",
        error: "Import failed"
    }[phase] || "Import";

    const StatusIcon = {
        done: CheckCircle2,
        cancelled: AlertTriangle,
        error: XCircle
    }[phase] || Loader2;

    /** "12 added, 3 updated" — only the parts that actually happened. */
    const summary = [
        imported > 0 && `${imported.toLocaleString("en-IN")} added`,
        updated > 0 && `${updated.toLocaleString("en-IN")} updated`,
        skipped.length > 0 && `${skipped.length.toLocaleString("en-IN")} skipped`
    ].filter(Boolean).join(", ");

    return (
        <Modal
            open={phase !== "idle"}
            onClose={busy ? undefined : onClose}
            closeOnBackdrop={!busy}
            size="md"
            icon={FileSpreadsheet}
            title={title}
            subtitle={fileName}
            footer={
                choosing ? (
                    <>
                        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                        <Button onClick={confirm}>Start import</Button>
                    </>
                ) : busy ? (
                    <Button variant="secondary" onClick={onCancel}>Stop import</Button>
                ) : (
                    <Button onClick={onClose}>Done</Button>
                )
            }
        >
            {choosing ? (
                <div className="space-y-4">
                    <p className="text-sm text-muted">
                        Some {label} in this file may already be in your list. We match them by
                        SKU, then barcode, then name — never creating a second copy.
                        What should happen to those?
                    </p>

                    <div className="space-y-2">
                        {DUPLICATE_CHOICES.map((choice) => {
                            const selected = duplicateMode === choice.value;

                            return (
                                <label
                                    key={choice.value}
                                    className={[
                                        "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors",
                                        selected
                                            ? "border-primary bg-primary/5"
                                            : "border-line hover:bg-surface-hover"
                                    ].join(" ")}
                                >
                                    <input
                                        type="radio"
                                        name="duplicate-mode"
                                        className="sr-only"
                                        value={choice.value}
                                        checked={selected}
                                        onChange={() => setDuplicateMode(choice.value)}
                                    />

                                    <span
                                        className={[
                                            "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                                            selected ? "bg-primary text-white" : "bg-surface-muted text-muted"
                                        ].join(" ")}
                                        aria-hidden="true"
                                    >
                                        <choice.icon className="h-4.5 w-4.5" />
                                    </span>

                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-heading">{choice.title}</span>
                                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">{choice.detail}</span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    {/* Progress */}
                    <div>
                        <div className="flex items-baseline justify-between mb-2">
                            <span className="text-sm font-medium text-heading">
                                {phase === "reading"
                                    ? "Reading rows"
                                    : total
                                        ? `${processed.toLocaleString("en-IN")} of ${total.toLocaleString("en-IN")} ${label}`
                                        : ""}
                            </span>
                            <span className="text-sm font-bold text-heading tabular">{percent}%</span>
                        </div>

                        <div
                            className="h-3 rounded-full bg-surface-hover overflow-hidden"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={percent}
                            aria-label={`Import progress: ${percent}%`}
                        >
                            <div
                                className={`h-full rounded-full transition-[width] duration-300 ${barColour} ${busy ? "animate-pulse" : ""}`}
                                style={{ width: `${Math.max(percent, 2)}%` }}
                            />
                        </div>
                    </div>

                    {/* Counts */}
                    {total > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { label: "Added", value: imported, tone: "text-success" },
                                { label: "Updated", value: updated, tone: updated ? "text-primary" : "text-faint" },
                                { label: "Skipped", value: skipped.length, tone: skipped.length ? "text-warning" : "text-faint" },
                                { label: "Remaining", value: Math.max(0, total - processed), tone: "text-heading" }
                            ].map((item) => (
                                <div key={item.label} className="rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-center">
                                    <p className={`text-xl font-bold tabular ${item.tone}`}>{item.value.toLocaleString("en-IN")}</p>
                                    <p className="text-[11px] text-muted mt-0.5">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Outcome */}
                    {phase !== "reading" && phase !== "importing" && (
                        <div
                            className={[
                                "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
                                tone === "success" ? "border-success/25 bg-success/10 text-heading"
                                    : tone === "danger" ? "border-danger/25 bg-danger/10 text-danger"
                                        : "border-warning/30 bg-warning/10 text-heading"
                            ].join(" ")}
                            role="status"
                        >
                            <StatusIcon className="h-4 w-4 shrink-0 mt-0.5" />
                            <p>
                                {phase === "error"
                                    ? error
                                    : phase === "cancelled"
                                        ? `Stopped early — ${summary || "nothing was changed"}. What was saved stays.`
                                        : summary
                                            ? `${summary}.`
                                            : `No ${label} were changed.`}
                            </p>
                        </div>
                    )}

                    {/* Skipped rows */}
                    {skipped.length > 0 && !busy && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-faint mb-2">
                                Skipped rows
                            </p>
                            <ul className="max-h-40 overflow-y-auto thin-scrollbar rounded-xl border border-line divide-y divide-line">
                                {skipped.slice(0, 50).map((item, index) => (
                                    <li key={index} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                                        <span className="text-muted">Row {item.row}</span>
                                        <span className="text-heading">{item.reason}</span>
                                    </li>
                                ))}
                            </ul>
                            {skipped.length > 50 && (
                                <p className="mt-2 text-xs text-muted">…and {skipped.length - 50} more.</p>
                            )}
                        </div>
                    )}

                    {busy && (
                        <p className="text-xs text-faint">
                            Keep this page open. Rows already saved stay even if you stop.
                        </p>
                    )}
                </div>
            )}
        </Modal>
    );
}
