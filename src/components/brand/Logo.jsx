import { useId } from "react";

import BRAND from "../../config/brand";

/**
 * StoreFlow mark: a storefront awning over a rising flow line.
 * `tone="light"` renders it for dark/gradient backgrounds.
 */
export function LogoMark({ className = "h-9 w-9", tone = "brand" }) {
    const isLight = tone === "light";
    // Unique per instance: several marks can share a page.
    const gradientId = `storeflow-mark-${useId()}`;

    return (
        <svg
            viewBox="0 0 40 40"
            className={className}
            role="img"
            aria-label={`${BRAND.name} logo`}
        >
            {!isLight && (
                <defs>
                    {/* Same blue -> indigo as the favicon and app icons. */}
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#2563eb" />
                        <stop offset="1" stopColor="#4f46e5" />
                    </linearGradient>
                </defs>
            )}

            <rect
                width="40"
                height="40"
                rx="11"
                fill={isLight ? "rgba(255,255,255,0.16)" : `url(#${gradientId})`}
            />

            {/* awning — same geometry as public/ icons, so the mark is
                identical in the tab, on the home screen and in the app */}
            <path
                d="M12.5 9h15l2.5 5c0 1.85-1.48 3.3-3.3 3.3S23.4 15.85 23.4 14c0 1.85-1.48 3.3-3.3 3.3S16.7 15.85 16.7 14c0 1.85-1.48 3.3-3.3 3.3S10 15.85 10 14Z"
                fill="#fff"
            />

            {/* flow line */}
            <path
                d="M10 31 17 24l4.5 4 8-7"
                fill="none"
                stroke="#fff"
                strokeWidth="3.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
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
