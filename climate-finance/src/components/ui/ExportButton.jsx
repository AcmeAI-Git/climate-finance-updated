import React, { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import Button from "./Button";
import { useToast } from "./Toast";

const ExportButton = ({
    data,
    filename = "report",
    title = "Report",
    subtitle = "",
    variant = "outline",
    size = "sm",
    className = "",
    exportFormats = ["json", "csv"],
    ...props
}) => {
    const [isExporting, setIsExporting] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const dropdownRef = useRef(null);
    const { success: showSuccess, error: showError } = useToast();

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowOptions(false);
            }
        };

        if (showOptions) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showOptions]);

    const handleExport = async (format) => {
        if (!data) {
            showError("No data available to export");
            return;
        }

        setIsExporting(true);
        setShowOptions(false);

        try {
            if (format === "csv") {
                // Flatten all dashboard data into a single array of objects for CSV
                let allRows = [];
                Object.entries(data).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach((row) => {
                            allRows.push({ section: key, ...row });
                        });
                    }
                });
                if (!allRows.length) {
                    showError("No data available to export");
                    setIsExporting(false);
                    return;
                }
                const headers = Object.keys(allRows[0]);
                const escapeCSV = (str) => String(str ?? "").replace(/"/g, '""');
                const formatCell = (value) => {
                    if (value === null || value === undefined) return "";
                    if (Array.isArray(value)) return value.join("; ");
                    if (typeof value === "object") return JSON.stringify(value);
                    return String(value);
                };
                const csvRows = [
                    headers.join(","),
                    ...allRows.map((row) =>
                        headers.map((h) => `"${escapeCSV(formatCell(row[h]))}"`).join(",")
                    ),
                ];
                const csvContent = csvRows.join("\n");
                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                showSuccess("CSV exported successfully");
                setIsExporting(false);
            } else if (format === "json") {
                const exportData = {
                    ...data,
                    exportDate: new Date().toISOString(),
                    title,
                    subtitle,
                };

                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], {
                    type: "application/json",
                });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${filename}_${
                    new Date().toISOString().split("T")[0]
                }.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                showSuccess("JSON exported successfully");
            }
        } catch (error) {
            console.error("Export failed:", error);
            showError(`Export failed: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    // If only one format, export directly
    if (exportFormats.length === 1) {
        return (
            <Button
                variant={variant}
                size={size}
                onClick={() => handleExport(exportFormats[0])}
                leftIcon={<Download size={16} />}
                loading={isExporting}
                className={className}
                {...props}
            >
                {isExporting ? "Downloading..." : "Download"}
            </Button>
        );
    }

    // Multiple formats - show dropdown
    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant={variant}
                size={size}
                onClick={() => setShowOptions(!showOptions)}
                leftIcon={<Download size={16} />}
                loading={isExporting}
                className={className}
                {...props}
            >
                {isExporting ? "Downloading..." : "Download"}
            </Button>

            {showOptions && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                    {exportFormats.includes("csv") && (
                        <button
                            onClick={() => handleExport("csv")}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <FileSpreadsheet size={14} />
                            Download CSV
                        </button>
                    )}
                    {exportFormats.includes("json") && (
                        <button
                            onClick={() => handleExport("json")}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
                        >
                            <FileText size={14} />
                            Download JSON
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExportButton;
