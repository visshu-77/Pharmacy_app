/**
 * Surface primitives. Everything that sits on the page background is a Card,
 * so radius, border and elevation stay identical across the app.
 */
export default function Card({
    children,
    className = "",
    padded = true,
    hover = false,
    as: Tag = "div",
    ...props
}) {
    return (
        <Tag
            className={[
                "bg-surface border border-line rounded-2xl shadow-card",
                padded ? "p-5" : "",
                hover
                    ? "transition-all duration-200 hover:shadow-md hover:border-line-strong"
                    : "",
                className
            ]
                .filter(Boolean)
                .join(" ")}
            {...props}
        >
            {children}
        </Tag>
    );
}

export function CardHeader({
    title,
    subtitle,
    icon: Icon,
    action,
    className = ""
}) {
    return (
        <div
            className={[
                "flex items-start justify-between gap-4",
                className
            ].join(" ")}
        >
            <div className="flex items-start gap-3 min-w-0">
                {Icon && (
                    <span className="shrink-0 grid place-items-center h-9 w-9 rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                )}

                <div className="min-w-0">
                    <h3 className="font-semibold text-base truncate">
                        {title}
                    </h3>

                    {subtitle && (
                        <p className="text-xs text-muted mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

/** Divider that respects card padding. */
export function CardDivider({ className = "" }) {
    return <div className={`h-px bg-line my-4 ${className}`} />;
}
