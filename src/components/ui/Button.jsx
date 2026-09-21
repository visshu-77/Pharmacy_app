import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const VARIANTS = {
    primary:
        "bg-primary text-white border-transparent hover:bg-primary-strong hover:shadow-md active:translate-y-px",
    secondary:
        "bg-surface text-heading border-line hover:bg-surface-hover hover:border-line-strong",
    soft:
        "bg-primary/10 text-primary border-transparent hover:bg-primary/15",
    success:
        "bg-secondary text-white border-transparent hover:opacity-90 active:translate-y-px",
    danger:
        "bg-danger text-white border-transparent hover:opacity-90 active:translate-y-px",
    "danger-soft":
        "bg-danger/10 text-danger border-danger/20 hover:bg-danger/15",
    ghost:
        "bg-transparent text-muted border-transparent hover:bg-surface-hover hover:text-heading"
};

const SIZES = {
    sm: "h-9 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-sm gap-2"
};

/**
 * The one button in the app. Renders as <button>, <Link> (`to`) or <a>
 * (`href`) depending on what it is given.
 */
export default function Button({
    children,
    variant = "primary",
    size = "md",
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    fullWidth = false,
    to,
    href,
    className = "",
    type = "button",
    ...props
}) {
    const classes = [
        "inline-flex items-center justify-center whitespace-nowrap",
        "rounded-lg border font-semibold",
        "transition-all duration-150",
        "disabled:opacity-50 disabled:pointer-events-none",
        SIZES[size] || SIZES.md,
        VARIANTS[variant] || VARIANTS.primary,
        fullWidth ? "w-full" : "",
        className
    ]
        .filter(Boolean)
        .join(" ");

    const content = (
        <>
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
                Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}

            {children}

            {IconRight && !loading && (
                <IconRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
        </>
    );

    if (to) {
        return (
            <Link to={to} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    if (href) {
        return (
            <a href={href} className={classes} {...props}>
                {content}
            </a>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {content}
        </button>
    );
}

/** Square icon-only button, for table row actions and toolbars. */
export function IconButton({
    icon: Icon,
    label,
    variant = "ghost",
    size = "md",
    className = "",
    ...props
}) {
    const sizes = {
        sm: "h-8 w-8",
        md: "h-9 w-9",
        lg: "h-10 w-10"
    };

    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            className={[
                "inline-flex items-center justify-center rounded-lg border",
                "transition-all duration-150",
                "disabled:opacity-50 disabled:pointer-events-none",
                sizes[size] || sizes.md,
                VARIANTS[variant] || VARIANTS.ghost,
                className
            ].join(" ")}
            {...props}
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
    );
}
