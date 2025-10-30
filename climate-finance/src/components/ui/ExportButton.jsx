import React, { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import Button from "./Button";
import usePDFExport from "../../hooks/usePDFExport";
import { useToast } from "./Toast";

const ExportButton = ({
    data,
    filename = "report",
    title = "Report",
    subtitle = "",
    variant = "outline",
    size = "sm",
    className = "",
    exportFormats = ["pdf"],
    customPDFTemplate = null,
    ...props
}) => {
    const [isExporting, setIsExporting] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const dropdownRef = useRef(null);
    const { exportPDF } = usePDFExport();
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
            if (format === "pdf") {
                await exportPDF({
                    data,
                    fileName: filename,
                    title,
                    // You may want to add headers, columnStyles, etc. here if needed
                    customStyles: customPDFTemplate,
                });
                showSuccess("PDF exported successfully");
            } // … inside the ExportButton component …
            else if (format === "csv") {
                const keysToExport = Object.keys(data ?? {});

                console.log(data);

                const escapeCSV = (str) =>
                    String(str ?? "").replace(/"/g, '""');

                const formatCell = (value) => {
                    if (value === null || value === undefined) return "";

                    // ---- array ------------------------------------------------
                    if (Array.isArray(value)) {
                        if (!value.length) return "";
                        if (value.every((v) => typeof v !== "object"))
                            return value.join("; ");

                        // array of objects → join a “display” field
                        return value
                            .map((v) => {
                                if (!v) return "";
                                if (typeof v === "string") return v;
                                if (v.name) return v.name;
                                if (v.title) return v.title;
                                // fallback identifiers
                                if (v.agency_id)
                                    return v.name ?? String(v.agency_id);
                                if (v.funding_source_id)
                                    return (
                                        v.name ?? String(v.funding_source_id)
                                    );
                                if (v.sdg_number)
                                    return v.title ?? String(v.sdg_number);
                                return JSON.stringify(v);
                            })
                            .filter(Boolean)
                            .join("; ");
                    }

                    if (typeof value === "object") {
                        if (value.name) return value.name;
                        if (value.title) return value.title;
                        try {
                            return JSON.stringify(value);
                        } catch {
                            return String(value);
                        }
                    }

                    return String(value);
                };

                for (const key of keysToExport) {
                    let arrayData = data[key];

                    // Convert a single object (e.g. `summary`) into a one-row array
                    if (!Array.isArray(arrayData)) {
                        arrayData = [arrayData];
                    }

                    if (!arrayData.length) continue; // skip empty tables

                    const headers = Object.keys(arrayData[0]);

                    const csvRows = [
                        headers.join(","), // header line
                        ...arrayData.map((row) =>
                            headers
                                .map(
                                    (h) => `"${escapeCSV(formatCell(row[h]))}"`
                                )
                                .join(",")
                        ),
                    ];

                    const csvContent = csvRows.join("\n");

                    const blob = new Blob([csvContent], {
                        type: "text/csv;charset=utf-8;",
                    });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `${filename}_${key}_${
                        new Date().toISOString().split("T")[0]
                    }.csv`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }

                showSuccess("CSV exported successfully");
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
                    {exportFormats.includes("pdf") && (
                        <button
                            onClick={() => handleExport("pdf")}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                        >
                            <FileText size={14} />
                            Download PDF
                        </button>
                    )}
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
