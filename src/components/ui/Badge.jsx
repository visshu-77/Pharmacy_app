const TONES = {
    neutral: "bg-surface-hover text-muted border-line",
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/25",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-info/10 text-info border-info/20"
};

const SIZES = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1"
};

/** Small status pill. `dot` adds the leading indicator used in stock states. */
export default function Badge({
    children,
    tone = "neutral",
    size = "md",
    dot = false,
    icon: Icon,
    className = ""
}) {
    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap",
                SIZES[size] || SIZES.md,
                TONES[tone] || TONES.neutral,
                className
            ].join(" ")}
        >
            {dot && (
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            )}

            {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}

            {children}
        </span>
    );
}
