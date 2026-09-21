import BRAND from "../../config/brand";

/**
 * StoreFlow mark: a storefront awning over a rising flow line.
 * `tone="light"` renders it for dark/gradient backgrounds.
 */
export function LogoMark({ className = "h-9 w-9", tone = "brand" }) {
    const isLight = tone === "light";

    return (
        <svg
            viewBox="0 0 40 40"
            className={className}
            role="img"
            aria-label={`${BRAND.name} logo`}
        >
            <rect
                width="40"
                height="40"
                rx="11"
                fill={isLight ? "rgba(255,255,255,0.16)" : "rgb(var(--color-primary))"}
            />

            {/* awning */}
            <path
                d="M10 15.5 12 10h16l2 5.5c0 1.9-1.6 3.5-3.5 3.5S23 17.4 23 15.5c0 1.9-1.4 3.5-3 3.5s-3-1.6-3-3.5c0 1.9-1.6 3.5-3.5 3.5S10 17.4 10 15.5Z"
                fill="#fff"
            />

            {/* flow line */}
            <path
                d="M11 29.5 16.5 24l4 3.5L29 21"
                fill="none"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <circle cx="29" cy="21" r="2" fill="#fff" />
        </svg>
    );
}

export default function Logo({
    className = "",
    tone = "brand",
    showTagline = false,
    size = "md"
}) {
    const isLight = tone === "light";

    const sizes = {
        sm: { mark: "h-8 w-8", name: "text-base" },
        md: { mark: "h-9 w-9", name: "text-lg" },
        lg: { mark: "h-11 w-11", name: "text-2xl" }
    };

    const s = sizes[size] || sizes.md;

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <LogoMark className={s.mark} tone={tone} />

            <div className="min-w-0 leading-tight">
                <p
                    className={[
                        "font-extrabold tracking-tight",
                        s.name,
                        isLight ? "text-white" : "text-heading"
                    ].join(" ")}
                >
                    {BRAND.name}
                </p>

                {showTagline && (
                    <p
                        className={[
                            "text-[11px] truncate",
                            isLight ? "text-white/70" : "text-muted"
                        ].join(" ")}
                    >
                        {BRAND.tagline}
                    </p>
                )}
            </div>
        </div>
    );
}
