import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Button from "./Button";
import Loading from "./Loading";
import ErrorState from "./ErrorState";

const DataTable = ({
    data = [], // This should now be filteredData from parent
    columns = [],
    sortable = true,
    pagination = true,
    pageSize = 10,
    actions = [],
    onRowClick = null,
    loading = false,
    error = null,
    emptyState = null,
    className = "",
    // Removed searchable and searchPlaceholder props
}) => {
    // Removed search-related state
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });
    const [currentPage, setCurrentPage] = useState(1);

    // Use data directly as it's already filtered by parent
    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    // Paginate data
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = pagination
        ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : sortedData;

    const handleSort = (key) => {
        if (!sortable) return;

        setSortConfig((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const renderCell = (row, column) => {
        if (column.render) {
            return column.render(row[column.key], row);
        }
        return row[column.key] || "-";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loading size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorState
                title="Failed to load data"
                message={error}
                showRefresh={false}
            />
        );
    }

    return (
        <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
        >
            {/* Removed search section */}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${
                        sortable && column.sortable !== false
                            ? "cursor-pointer hover:bg-gray-100"
                            : ""
                    }
                  `}
                                    onClick={() =>
                                        sortable &&
                                        column.sortable !== false &&
                                        handleSort(column.key)
                                    }
                                >
                                    <div className="flex items-center gap-1">
                                        {column.header}
                                        {sortable &&
                                            column.sortable !== false &&
                                            sortConfig.key === column.key &&
                                            (sortConfig.direction === "asc" ? (
                                                <ChevronUp size={14} />
                                            ) : (
                                                <ChevronDown size={14} />
                                            ))}
                                    </div>
                                </th>
                            ))}
                            {actions.length > 0 && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={
                                        columns.length +
                                        (actions.length > 0 ? 1 : 0)
                                    }
                                    className="px-6 py-12 text-center"
                                >
                                    {emptyState || (
                                        <ErrorState
                                            type="empty"
                                            title="No data found"
                                            message="No records match your criteria."
                                            showRefresh={false}
                                        />
                                    )}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => (
                                <tr
                                    key={index}
                                    className={`
                    hover:bg-gray-50 transition-colors
                    ${onRowClick ? "cursor-pointer" : ""}
                  `}
                                    onClick={() =>
                                        onRowClick && onRowClick(row)
                                    }
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[400px] overflow-hidden text-ellipsis"
                                        >
                                            {renderCell(row, column)}
                                        </td>
                                    ))}
                                    {actions.length > 0 && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                {actions.map(
                                                    (action, actionIndex) => (
                                                        <Button
                                                            key={actionIndex}
                                                            variant={
                                                                action.variant ||
                                                                "outline"
                                                            }
                                                            size="sm"
                                                            leftIcon={
                                                                action.icon
                                                            }
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                action.onClick(
                                                                    row
                                                                );
                                                            }}
                                                            className={
                                                                action.className
                                                            }
                                                            disabled={
                                                                action.disabled
                                                            }
                                                        >
                                                            {action.label}
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
                        {sortedData.length} results
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="px-3 py-1 text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
