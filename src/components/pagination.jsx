import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}) {

    const getPageNumbers = () => {

        // No pages
        if (totalPages <= 0) {
            return [];
        }

        // If pages are 7 or less, show all
        if (totalPages <= 7) {
            return Array.from(
                { length: totalPages },
                (_, i) => i + 1
            );
        }

        const pages = [];
        pages.push(1);
        if (currentPage <= 4) {

            pages.push(2);
            pages.push(3);
            pages.push(4);
            pages.push(5);

            pages.push("...");

            pages.push(totalPages - 1);
            pages.push(totalPages);

        }
        else if (currentPage >= totalPages - 3) {

            pages.push("...");

            pages.push(totalPages - 4);
            pages.push(totalPages - 3);
            pages.push(totalPages - 2);
            pages.push(totalPages - 1);
            pages.push(totalPages);

        }
        else {

            pages.push("...");

            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);

            pages.push("...");

            pages.push(totalPages);
        }

        return pages;
    };


    const pageNumbers = getPageNumbers();


    const navButton =
        "grid place-items-center h-8 w-8 rounded-lg border border-line text-muted " +
        "hover:bg-surface-hover hover:text-heading transition-colors " +
        "disabled:opacity-40 disabled:pointer-events-none";

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav className="flex items-center gap-1" aria-label="Pagination">

            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className={navButton}
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers.map((page, index) => {

                if (page === "...") {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-1.5 text-faint text-sm"
                            aria-hidden="true"
                        >
                            …
                        </span>
                    );
                }

                const active = currentPage === page;

                return (
                    <button
                        type="button"
                        key={page}
                        onClick={() => onPageChange(page)}
                        aria-current={active ? "page" : undefined}
                        className={[
                            "min-w-[32px] h-8 px-2 rounded-lg text-sm font-semibold tabular transition-colors",
                            active
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted hover:bg-surface-hover hover:text-heading"
                        ].join(" ")}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className={navButton}
            >
                <ChevronRight className="w-4 h-4" />
            </button>

        </nav>
    );
}