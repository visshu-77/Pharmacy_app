import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

import BRAND from "../../config/brand";
import BusinessContext from "../../context/BusinessContext";

/** Breadcrumb trail derived from the URL. Replaces the old LastParams. */
export function Breadcrumbs({ className = "" }) {
    const location = useLocation();

    // Optional: the admin area renders outside the shop's BusinessProvider data.
    const business = useContext(BusinessContext);

    const TITLES = {
        product: business?.term.items || "Products",
        category: business?.term.categories || "Categories",
        suppliers: business?.term.suppliers || "Suppliers",
        reports: "Reports",
        billing: "New bill",
        notes: "Sales note",
        guide: "Help & guide",
        subscription: "Plans",
        settings: "Settings",
        checkout: "Checkout"
    };

    const segments = location.pathname.split("/").filter(Boolean);

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-1.5 text-xs ${className}`}
        >
            <Link
                to="/"
                className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors"
            >
                <Home className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="font-medium">{BRAND.name}</span>
            </Link>

            {segments.map((segment, index) => {
                const path = `/${segments.slice(0, index + 1).join("/")}`;
                const isLast = index === segments.length - 1;
                const label =
                    TITLES[segment.toLowerCase()] ||
                    segment.replace(/-/g, " ");

                return (
                    <span key={path} className="flex items-center gap-1.5">
                        <ChevronRight
                            className="h-3.5 w-3.5 text-faint"
                            aria-hidden="true"
                        />

                        {isLast ? (
                            <span className="font-semibold text-heading capitalize">
                                {label}
                            </span>
                        ) : (
                            <Link
                                to={path}
                                className="text-muted hover:text-primary capitalize transition-colors"
                            >
                                {label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}

/**
 * Standard page title block: heading, supporting line and an actions slot.
 */
export default function PageHeader({
    title,
    subtitle,
    icon: Icon,
    actions,
    breadcrumbs = true,
    className = ""
}) {
    return (
        <div className={className}>
            {breadcrumbs && <Breadcrumbs className="mb-4" />}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                    {Icon && (
                        <span className="shrink-0 grid place-items-center h-11 w-11 rounded-2xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                    )}

                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                            {title}
                        </h1>

                        {subtitle && (
                            <p className="text-sm text-muted mt-0.5">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
