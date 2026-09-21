import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState
} from "react";
import { createPortal } from "react-dom";
import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
    X
} from "lucide-react";

const ToastContext = createContext(null);

const TONES = {
    success: {
        icon: CheckCircle2,
        bar: "bg-success",
        iconClass: "text-success"
    },
    error: {
        icon: XCircle,
        bar: "bg-danger",
        iconClass: "text-danger"
    },
    warning: {
        icon: AlertTriangle,
        bar: "bg-warning",
        iconClass: "text-warning"
    },
    info: {
        icon: Info,
        bar: "bg-info",
        iconClass: "text-info"
    }
};

/**
 * Replaces the app's window.alert() calls. Mount once near the app root.
 *
 *   const toast = useToast();
 *   toast.success("Product added");
 *   toast.error(err?.response?.data?.message || "Something went wrong");
 */
export function ToastProvider({ children }) {

    const [toasts, setToasts] = useState([]);
    const timers = useRef(new Map());

    const dismiss = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));

        const timer = timers.current.get(id);

        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const push = useCallback(
        (message, { tone = "info", title, duration = 4000 } = {}) => {
            if (!message) return undefined;

            const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

            setToasts((current) => [
                ...current.slice(-3),
                { id, message, tone, title }
            ]);

            if (duration > 0) {
                timers.current.set(
                    id,
                    setTimeout(() => dismiss(id), duration)
                );
            }

            return id;
        },
        [dismiss]
    );

    const api = useMemo(
        () => ({
            push,
            dismiss,
            success: (message, options) =>
                push(message, { ...options, tone: "success" }),
            error: (message, options) =>
                push(message, { ...options, tone: "error", duration: 6000 }),
            warning: (message, options) =>
                push(message, { ...options, tone: "warning" }),
            info: (message, options) =>
                push(message, { ...options, tone: "info" })
        }),
        [push, dismiss]
    );

    return (
        <ToastContext.Provider value={api}>
            {children}

            {createPortal(
                <div
                    className="fixed z-[200] top-4 right-4 left-4 sm:left-auto flex flex-col gap-2 sm:w-[360px] pointer-events-none"
                    role="region"
                    aria-live="polite"
                    aria-label="Notifications"
                >
                    {toasts.map((toast) => {
                        const tone = TONES[toast.tone] || TONES.info;
                        const Icon = tone.icon;

                        return (
                            <div
                                key={toast.id}
                                className="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border border-line bg-surface p-3.5 pl-4 shadow-lg animate-slide-up"
                            >
                                <span
                                    className={`absolute left-0 top-0 h-full w-1 ${tone.bar}`}
                                    aria-hidden="true"
                                />

                                <Icon
                                    className={`h-5 w-5 shrink-0 mt-0.5 ${tone.iconClass}`}
                                    aria-hidden="true"
                                />

                                <div className="min-w-0 flex-1">
                                    {toast.title && (
                                        <p className="text-sm font-semibold text-heading">
                                            {toast.title}
                                        </p>
                                    )}

                                    <p className="text-sm text-body break-words">
                                        {toast.message}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => dismiss(toast.id)}
                                    aria-label="Dismiss notification"
                                    className="shrink-0 grid place-items-center h-6 w-6 rounded-md text-faint hover:bg-surface-hover hover:text-heading transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used inside a <ToastProvider>");
    }

    return context;
}

export default ToastProvider;
