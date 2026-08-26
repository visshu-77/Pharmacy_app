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

        // Always show first page
        pages.push(1);

        // --------------------------------
        // Current page near beginning
        // --------------------------------

        if (currentPage <= 4) {

            pages.push(2);
            pages.push(3);
            pages.push(4);
            pages.push(5);

            pages.push("...");

            pages.push(totalPages - 1);
            pages.push(totalPages);

        }

        // --------------------------------
        // Current page near end
        // --------------------------------

        else if (currentPage >= totalPages - 3) {

            pages.push("...");

            pages.push(totalPages - 4);
            pages.push(totalPages - 3);
            pages.push(totalPages - 2);
            pages.push(totalPages - 1);
            pages.push(totalPages);

        }

        // --------------------------------
        // Current page in middle
        // --------------------------------

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


    return (
        <div className="flex items-center gap-1">

            {/* Previous Button */}

            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>


            {/* Page Numbers */}

            {pageNumbers.map((page, index) => {

                // Ellipsis
                if (page === "...") {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-1 text-gray-500"
                        >
                            ...
                        </span>
                    );
                }


                return (
                    <button
                        type="button"
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`min-w-[32px] px-2 py-1 rounded text-sm cursor-pointer ${
                            currentPage === page
                                ? "bg-primary dark:bg-black text-white"
                                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        {page}
                    </button>
                );
            })}


            {/* Next Button */}

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

        </div>
    );
}