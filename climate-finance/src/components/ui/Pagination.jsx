import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
    onItemsPerPageChange,
    itemsPerPageOptions = [6, 9, 12, 24, 48],
    showItemsPerPage = true,
    className = "",
}) => {
    // Calculate the range of items being displayed
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push("...");
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (currentPage < totalPages - 2) {
                pages.push("...");
            }

            // Always show last page
            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalItems === 0) {
        return null;
    }

    return (
        <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}
        >
            {/* Items per page selector */}
            {showItemsPerPage && onItemsPerPageChange && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Show</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            onItemsPerPageChange(Number(e.target.value));
                            onPageChange(1); // Reset to first page when changing items per page
                        }}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                        {itemsPerPageOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <span>per page</span>
                </div>
            )}

            {/* Page info */}
            <div className="text-sm text-gray-600">
                Showing {startItem} - {endItem} of {totalItems} items
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1">
                {/* First page button */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    title="First page"
                >
                    <ChevronsLeft size={16} />
                </button>

                {/* Previous page button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    title="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === "number" && onPageChange(page)}
                            disabled={page === "..."}
                            className={`min-w-[36px] h-9 px-3 rounded-md text-sm font-medium transition-colors ${
                                page === currentPage
                                    ? "bg-purple-600 text-white border border-purple-600"
                                    : page === "..."
                                    ? "cursor-default border border-transparent"
                                    : "border border-gray-300 hover:bg-gray-100"
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                {/* Mobile page indicator */}
                <div className="sm:hidden px-3 py-2 text-sm font-medium text-gray-700">
                    {currentPage} / {totalPages}
                </div>

                {/* Next page button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    title="Next page"
                >
                    <ChevronRight size={16} />
                </button>

                {/* Last page button */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    title="Last page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
