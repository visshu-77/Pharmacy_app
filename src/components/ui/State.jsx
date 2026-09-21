import { Loader2, Inbox } from "lucide-react";

/** Grey placeholder block used while data loads. */
export function Skeleton({ className = "h-4 w-full" }) {
    return <div className={`skeleton rounded-md ${className}`} />;
}

/** A few skeleton rows shaped like a table body. */
export function SkeletonRows({ rows = 5, columns = 4 }) {
    return (
        <div className="divide-y divide-line">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="flex items-center gap-4 px-4 py-4"
                >
                    {Array.from({ length: columns }).map((__, columnIndex) => (
                        <Skeleton
                            key={columnIndex}
                            className={
                                columnIndex === 0
                                    ? "h-4 flex-[2]"
                                    : "h-4 flex-1"
                            }
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonCards({ count = 4, className = "" }) {
    return (
        <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
        >
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-surface border border-line rounded-2xl p-5"
                >
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-6 w-20 mt-4" />
                    <Skeleton className="h-3 w-24 mt-2" />
                </div>
            ))}
        </div>
    );
}

/** Centred spinner for whole-panel loading. */
export function Spinner({ label = "Loading…", className = "" }) {
    return (
        <div
            className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
        >
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted">{label}</p>
        </div>
    );
}

/**
 * Empty state with an optional call to action. Used instead of the bare
 * "No Product Found" text the app had everywhere.
 */
export function EmptyState({
    icon: Icon = Inbox,
    title,
    message,
    action,
    className = ""
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center text-center px-6 py-14 ${className}`}
        >
            <span className="grid place-items-center h-14 w-14 rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
            </span>

            <h3 className="mt-4 font-semibold text-base text-heading">
                {title}
            </h3>

            {message && (
                <p className="mt-1.5 text-sm text-muted max-w-sm leading-relaxed">
                    {message}
                </p>
            )}

            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

/** Inline error panel with a retry affordance. */
export function ErrorState({ message, onRetry }) {
    return (
        <div className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-4 text-center">
            <p className="text-sm text-danger font-medium">{message}</p>

            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 text-xs font-semibold text-primary hover:underline"
                >
                    Try again
                </button>
            )}
        </div>
    );
}
