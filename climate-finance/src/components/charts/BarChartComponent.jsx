import React, { useRef, useState, useEffect } from "react";
import {
    VictoryChart,
    VictoryBar,
    VictoryAxis,
    VictoryTooltip,
    VictoryTheme,
    VictoryLegend,
} from "victory";
import { formatCurrency } from "../../utils/formatters";
import { useLanguage } from "../../context/LanguageContext";

const Transliteration = (type, language) => {
    if (language === "bn") {
        const bnMap = {
            Adaptation: "অ্যাডাপটেশন",
            Mitigation: "মিটিগেশন",
            Trend: "ট্রেন্ড",
            trend: "ট্রেন্ড",
            Active: "সক্রিয়",
            Completed: "সম্পন্ন",
            Total: "মোট",
        };
        return bnMap[type] || type;
    }
    return type;
};

const BarChartComponent = ({
    data,
    title,
    xAxisKey,
    bars, // [{ dataKey, name?, fill, totalKey? }]
    formatYAxis = false,
    description,
    scrollable = false, // Enable horizontal scrolling for charts with many data points
}) => {
    const { language } = useLanguage();
    const displayTitle = Transliteration(title, language);

    // ---------- responsive width ----------
    const containerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(800);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth - 40;
                // Calculate minimum viable width for chart to be readable
                // Each bar group needs ~25-30px minimum
                const minBarWidth = 25;
                const requiredWidth = data.length * minBarWidth + 200; // 200 for axes/labels
                
                // If scrollable is enabled, always allow the chart to be wider if needed
                if (scrollable) {
                    // Scrollable mode: always use required width or container width, whichever is larger
                    setChartWidth(Math.max(containerWidth, requiredWidth));
                } else {
                    // Default responsive mode
                    if (containerWidth < 500) {
                        // Mobile: Use container width
                        setChartWidth(containerWidth);
                    } else {
                        // Desktop: Use max of container or required, but be smart about it
                        setChartWidth(Math.max(containerWidth, requiredWidth));
                    }
                }
            }
        };
        
        // Call on mount
        handleResize();
        
        // Debounce resize events
        let timeout;
        const debouncedResize = () => {
            clearTimeout(timeout);
            timeout = setTimeout(handleResize, 150);
        };
        
        window.addEventListener("resize", debouncedResize);
        return () => {
            window.removeEventListener("resize", debouncedResize);
            clearTimeout(timeout);
        };
    }, [data, scrollable]);

    // Inject custom scrollbar styles for better visibility on mobile
    useEffect(() => {
        if (!document.getElementById("bar-chart-scrollbar-style")) {
            const style = document.createElement("style");
            style.id = "bar-chart-scrollbar-style";
            style.innerHTML = `
                .bar-chart-scrollable {
                    scrollbar-width: thick;
                    scrollbar-color: #888 #f1f1f1;
                    -webkit-overflow-scrolling: touch;
                    touch-action: pan-x;
                    overscroll-behavior-x: contain;
                }
                .bar-chart-scrollable::-webkit-scrollbar {
                    height: 24px !important;
                }
                .bar-chart-scrollable::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 12px;
                }
                .bar-chart-scrollable::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 12px;
                    min-height: 24px;
                }
                .bar-chart-scrollable::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    // ---------- prepare data for Victory ----------
    const chartData = data.map((item) => {
        const point = { x: item[xAxisKey] };
        bars.forEach((bar) => {
            point[bar.dataKey] = item[bar.dataKey];
            // expose total for every bar (tooltip will read it)
            point.total = item[bar.totalKey ?? "total"];
        });
        return point;
    });

    // ---------- Y-domain ----------
    const maxY =
        Math.max(...data.flatMap((item) => bars.map((b) => item[b.dataKey]))) +
        1;

    return (
        <div ref={containerRef} className="w-full">
            <div
                className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-300 select-none"
                style={{ minHeight: "440px" }}
            >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-start">
                    {displayTitle}
                </h3>

                {/* Chart wrapper - scrollable only when needed */}
                <div 
                    className={scrollable ? "bar-chart-scrollable" : ""}
                    style={{ 
                        height: "340px", 
                        overflowX: scrollable ? "auto" : "visible",
                        overflowY: "hidden",
                        WebkitOverflowScrolling: scrollable ? "touch" : "auto",
                        touchAction: scrollable ? "pan-x" : "auto"
                    }}
                >
                    <div style={{ width: chartWidth, height: "100%", display: scrollable ? "inline-block" : "block" }}>
                    <VictoryChart
                        theme={VictoryTheme.material}
                        width={chartWidth}
                        domainPadding={{ x: 60, y: 20 }}
                        padding={{ left: 60, top: 20, right: 60, bottom: 80 }}
                        domain={{ y: [0, maxY] }}
                    >
                        {/* Legend */}
                        {bars.length > 1 && (
                            <VictoryLegend
                                x={chartWidth / 2 - 100}
                                y={10}
                                orientation="horizontal"
                                gutter={20}
                                style={{
                                    labels: { fontSize: 11, fill: "#6B7280" },
                                }}
                                data={bars.map((bar) => ({
                                    name: Transliteration(
                                        bar.name ?? bar.dataKey,
                                        language
                                    ),
                                    symbol: { fill: bar.fill, type: "square" },
                                }))}
                            />
                        )}

                        {/* Y Axis */}
                        <VictoryAxis
                            dependentAxis
                            tickFormat={(t) =>
                                formatYAxis ? formatCurrency(t) : Math.floor(t)
                            }
                            style={{
                                axis: { stroke: "#E5E7EB" },
                                grid: { stroke: "none" },
                                tickLabels: { fontSize: 11, fill: "#6B7280" },
                            }}
                        />

                        {/* X Axis */}
                        <VictoryAxis
                            tickFormat={(t) => t}
                            style={{
                                axis: { stroke: "#E5E7EB" },
                                tickLabels: {
                                    fontSize: 10,
                                    fill: "#6B7280",
                                    angle: -45,
                                    textAnchor: "end",
                                },
                            }}
                        />

                        {/* Bars */}
                        {bars.map((bar, idx) => (
                            <VictoryBar
                                key={idx}
                                data={chartData}
                                x="x"
                                y={bar.dataKey}
                                barRatio={0.8}
                                style={{ data: { fill: bar.fill } }}
                                labels={({ datum }) => {
                                    const barVal = datum[bar.dataKey];
                                    const barName = Transliteration(
                                        bar.name ?? bar.dataKey,
                                        language
                                    );
                                    const formattedBar = formatYAxis
                                        ? formatCurrency(barVal)
                                        : barVal;
                                    // Only show the finance value for trend chart
                                    return `${barName}: ${formattedBar}`;
                                }}
                                labelComponent={
                                    <VictoryTooltip
                                        flyoutStyle={{
                                            fill: "rgba(17,24,39,0.95)",
                                            stroke: "#7C65C1",
                                        }}
                                        style={{
                                            fontSize: 13,
                                            fill: "#F9FAFB",
                                        }}
                                        cornerRadius={4}
                                        pointerLength={8}
                                    />
                                }
                            />
                        ))}
                    </VictoryChart>
                    </div>
                </div>
                {description && (
                    <p className="text-sm text-gray-500 mt-2 text-center italic">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default BarChartComponent;
