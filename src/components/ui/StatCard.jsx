import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import { Skeleton } from "./State";

const TONES = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    info: "bg-info/10 text-info",
    neutral: "bg-surface-hover text-muted"
};

/**
 * Metric tile: icon, big number, label and an optional supporting line.
 * Becomes a link when `to` is given.
 */
export default function StatCard({
    icon: Icon,
    label,
    value,
    hint,
    tone = "primary",
    loading = false,
    to,
    compact = false
}) {
    const body = (
        <>
            <div className="flex items-start justify-between gap-3">
                {Icon && (
                    <span
                        className={[
                            "grid place-items-center rounded-xl shrink-0",
                            compact ? "h-9 w-9" : "h-11 w-11",
                            TONES[tone] || TONES.primary
                        ].join(" ")}
                    >
                        <Icon
                            className={compact ? "h-4 w-4" : "h-5 w-5"}
                            aria-hidden="true"
                        />
                    </span>
                )}

                {to && (
                    <ArrowUpRight
                        className="h-4 w-4 text-faint opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                        aria-hidden="true"
                    />
                )}
            </div>

            <div className={compact ? "mt-3" : "mt-4"}>
                {loading ? (
                    <Skeleton className="h-7 w-24" />
                ) : (
                    <p
                        className={[
                            "font-bold tracking-tight text-heading tabular truncate",
                            compact ? "text-xl" : "text-2xl"
                        ].join(" ")}
                    >
                        {value}
                    </p>
                )}

                <p className="text-sm text-muted mt-1 truncate">{label}</p>

                {hint && (
                    <p className="text-xs text-faint mt-0.5 truncate">{hint}</p>
                )}
            </div>
        </>
    );

    const classes = [
        "group block bg-surface border border-line rounded-2xl shadow-card",
        compact ? "p-4" : "p-5",
        to
            ? "transition-all duration-200 hover:shadow-md hover:border-line-strong hover:-translate-y-0.5"
            : ""
    ].join(" ");

    if (to) {
        return (
            <Link to={to} className={classes}>
                {body}
            </Link>
        );
    }

    return <div className={classes}>{body}</div>;
}
