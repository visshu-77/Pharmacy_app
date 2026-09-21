import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const WIDTHS = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl"
};

/**
 * Centred dialog rendered in a portal. Closes on Escape and on backdrop
 * click, locks body scroll, and moves focus into the panel on open.
 */
export default function Modal({
    open = true,
    onClose,
    title,
    subtitle,
    icon: Icon,
    size = "md",
    footer,
    children,
    closeOnBackdrop = true
}) {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = (event) => {
            if (event.key === "Escape") onClose?.();
        };

        document.addEventListener("keydown", onKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        panelRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
        >
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
                onClick={closeOnBackdrop ? onClose : undefined}
                aria-hidden="true"
            />

            <div
                ref={panelRef}
                tabIndex={-1}
                className={[
                    "relative w-full bg-surface border border-line shadow-lg",
                    "rounded-t-2xl sm:rounded-2xl",
                    "max-h-[92vh] sm:max-h-[88vh] flex flex-col",
                    "animate-slide-up focus:outline-none",
                    WIDTHS[size] || WIDTHS.md
                ].join(" ")}
            >
                {(title || onClose) && (
                    <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line">
                        <div className="flex items-start gap-3 min-w-0">
                            {Icon && (
                                <span className="shrink-0 grid place-items-center h-9 w-9 rounded-xl bg-primary/10 text-primary">
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                </span>
                            )}

                            <div className="min-w-0">
                                <h2 className="font-semibold text-base truncate">
                                    {title}
                                </h2>

                                {subtitle && (
                                    <p className="text-xs text-muted mt-0.5">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>

                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close dialog"
                                className="shrink-0 grid place-items-center h-8 w-8 rounded-lg text-muted hover:bg-surface-hover hover:text-heading transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </header>
                )}

                <div className="flex-1 overflow-y-auto thin-scrollbar px-5 py-5">
                    {children}
                </div>

                {footer && (
                    <footer className="flex items-center justify-end gap-2 px-5 py-4 border-t border-line bg-surface-muted rounded-b-2xl">
                        {footer}
                    </footer>
                )}
            </div>
        </div>,
        document.body
    );
}

/** Right-hand slide-over, used for the cart and other side panels. */
export function Drawer({
    open,
    onClose,
    title,
    subtitle,
    icon: Icon,
    footer,
    children,
    width = "max-w-md"
}) {
    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = (event) => {
            if (event.key === "Escape") onClose?.();
        };

        document.addEventListener("keydown", onKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={[
                    "absolute right-0 top-0 h-full w-full bg-surface",
                    "border-l border-line shadow-lg flex flex-col",
                    "animate-slide-in-right",
                    width
                ].join(" ")}
            >
                <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line">
                    <div className="flex items-start gap-3 min-w-0">
                        {Icon && (
                            <span className="shrink-0 grid place-items-center h-9 w-9 rounded-xl bg-primary/10 text-primary">
                                <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                        )}

                        <div className="min-w-0">
                            <h2 className="font-semibold text-base truncate">
                                {title}
                            </h2>

                            {subtitle && (
                                <p className="text-xs text-muted mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close panel"
                        className="shrink-0 grid place-items-center h-8 w-8 rounded-lg text-muted hover:bg-surface-hover hover:text-heading transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto thin-scrollbar px-5 py-4">
                    {children}
                </div>

                {footer && (
                    <footer className="border-t border-line bg-surface-muted px-5 py-4">
                        {footer}
                    </footer>
                )}
            </aside>
        </div>,
        document.body
    );
}

/** Small confirm dialog — replaces window.confirm for destructive actions. */
export function ConfirmDialog({
    open,
    onCancel,
    onConfirm,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "danger",
    loading = false
}) {
    const confirmClasses =
        tone === "danger"
            ? "bg-danger text-white hover:opacity-90"
            : "bg-primary text-white hover:bg-primary-strong";

    return (
        <Modal open={open} onClose={onCancel} title={title} size="sm">
            <p className="text-sm text-body leading-relaxed">{message}</p>

            <div className="flex justify-end gap-2 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-10 px-4 rounded-lg border border-line text-sm font-semibold text-heading hover:bg-surface-hover transition-colors"
                >
                    {cancelLabel}
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className={`h-10 px-4 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60 ${confirmClasses}`}
                >
                    {loading ? "Working…" : confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
