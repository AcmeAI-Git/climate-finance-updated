import jsPDF from "jspdf";
import { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { formatDate } from "../utils/formatDate";

const usePDFExport = () => {
    const [isExporting, setIsExporting] = useState(false);

    const exportPDF = useCallback(
        async ({ data, fileName, title, useI18n }) => {
            setIsExporting(true);

            // --- Determine custom page width for wide tables ---
            const unit = "pt";
            const size = "A4";
            const orientation = "landscape";
            const marginLeft = 40;
            const doc = new jsPDF(orientation, unit, size);

            doc.setFontSize(15);

            // --- Simple, fixed PDF export layout ---
            function titleCase(str) {
                return str
                    .replace(/_/g, " ")
                    .replace(/([a-z])([A-Z])/g, "$1 $2")
                    .replace(
                        /\w\S*/g,
                        (txt) =>
                            txt.charAt(0).toUpperCase() +
                            txt.substr(1).toLowerCase()
                    );
            }

            function formatValue(val) {
                if (Array.isArray(val)) {
                    if (val.length === 0) return "";
                    if (typeof val[0] === "object") {
                        // Array of objects: handled elsewhere
                        return JSON.stringify(val);
                    }
                    return val.join(", ");
                }
                if (typeof val === "object" && val !== null) {
                    return JSON.stringify(val);
                }
                return val !== undefined && val !== null ? val : "";
            }

            function renderKeyValueList(obj, startY, indent = 0) {
                const lineHeight = 16;
                const indentOffset = indent * 20;
                const valueOffset = 180;
                Object.entries(obj).forEach(([k, v]) => {
                    // Check if we need a new page
                    if (
                        startY + lineHeight >
                        doc.internal.pageSize.getHeight() - 40
                    ) {
                        doc.addPage();
                        startY = 40;
                    }
                    doc.setFont("helvetica", "bold");
                    doc.text(
                        titleCase(k) + ":",
                        marginLeft + indentOffset,
                        startY
                    );
                    doc.setFont("helvetica", "");
                    if (typeof v === "object" && v !== null) {
                        if (Array.isArray(v)) {
                            startY += lineHeight;
                            startY = renderArrayAsLists(v, startY, indent + 1);
                        } else {
                            startY += lineHeight;
                            startY = renderKeyValueList(v, startY, indent + 1);
                        }
                    } else {
                        doc.text(
                            String(formatValue(v)),
                            marginLeft + indentOffset + valueOffset,
                            startY
                        );
                        startY += lineHeight;
                    }
                });
                return startY + 6;
            }

            function renderArrayAsLists(arr, startY, indent = 0) {
                if (!Array.isArray(arr) || arr.length === 0) return startY;
                arr.forEach((obj) => {
                    if (typeof obj === "object" && obj !== null) {
                        startY = renderKeyValueList(obj, startY, indent);
                        // Draw a separator line between objects
                        if (
                            startY + 10 >
                            doc.internal.pageSize.getHeight() - 40
                        ) {
                            doc.addPage();
                            startY = 40;
                        }
                        doc.setDrawColor(200, 200, 200);
                        doc.line(
                            marginLeft + indent * 20,
                            startY,
                            doc.internal.pageSize.getWidth() - marginLeft,
                            startY
                        );
                        startY += 10;
                    } else {
                        if (
                            startY + 16 >
                            doc.internal.pageSize.getHeight() - 40
                        ) {
                            doc.addPage();
                            startY = 40;
                        }
                        doc.text(
                            String(formatValue(obj)),
                            marginLeft + indent * 20,
                            startY
                        );
                        startY += 16;
                    }
                });
                return startY;
            }

            // Start PDF
            let startY = 40;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            const pageWidth = doc.internal.pageSize.getWidth();
            const titleWidth = doc.getTextWidth(title);
            doc.text(title, (pageWidth - titleWidth) / 2, startY);
            doc.setFont("helvetica", "");
            doc.setFontSize(12);
            startY += 20;

            if (Array.isArray(data)) {
                startY = renderArrayAsLists(data, startY);
            } else if (data && typeof data === "object") {
                Object.entries(data).forEach(([key, value]) => {
                    if (
                        Array.isArray(value) &&
                        value.length > 0 &&
                        typeof value[0] === "object"
                    ) {
                        startY = renderArrayAsLists(value, startY);
                    } else if (Array.isArray(value)) {
                        startY = renderArrayAsLists(value, startY);
                    } else if (typeof value === "object" && value !== null) {
                        startY = renderKeyValueList(value, startY);
                    } else {
                        if (
                            startY + 22 >
                            doc.internal.pageSize.getHeight() - 40
                        ) {
                            doc.addPage();
                            startY = 40;
                        }
                        doc.setFont("helvetica", "bold");
                        doc.text(titleCase(key) + ":", marginLeft, startY);
                        doc.setFont("helvetica", "");
                        doc.text(
                            String(formatValue(value)),
                            marginLeft + 120,
                            startY
                        );
                        startY += 22;
                    }
                });
            } else {
                if (startY + 16 > doc.internal.pageSize.getHeight() - 40) {
                    doc.addPage();
                    startY = 40;
                }
                doc.text(String(formatValue(data)), marginLeft, startY);
            }

            // Footer (draw after all content, on every page)
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);

                const pageSize = doc.internal.pageSize;
                const pageHeight = pageSize.height
                    ? pageSize.height
                    : pageSize.getHeight();
                const pageWidth = pageSize.width
                    ? pageSize.width
                    : pageSize.getWidth();

                doc.setFontSize(10);
                doc.setTextColor(74, 74, 74);

                // Footer text content
                const footerLeft = `Generated on ${formatDate(
                    new Date()
                )} | Climate Finance`;
                const footerRight = `Page ${i} of ${pageCount}`;

                // Draw text
                doc.text(footerLeft, marginLeft, pageHeight - 20);
                doc.text(
                    footerRight,
                    pageWidth - marginLeft - 50,
                    pageHeight - 20
                );
            }

            const pdfBlob = doc.output("blob");
            saveAs(pdfBlob, `${fileName}.pdf`);
            setIsExporting(false);
        },
        []
    );

    return { exportPDF, isExporting };
};

export default usePDFExport;
