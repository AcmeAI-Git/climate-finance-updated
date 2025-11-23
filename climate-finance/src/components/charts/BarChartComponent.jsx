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
}) => {
    const { language } = useLanguage();
    const displayTitle = Transliteration(title, language);

    // ---------- responsive width ----------
    const containerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(800);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setChartWidth(containerRef.current.offsetWidth - 40); // 40px padding
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
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
        <div ref={containerRef} className="w-full overflow-hidden">
            <div
                className="relative w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-300 select-none"
                style={{ minHeight: "440px" }} // extra room for legend
            >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-start">
                    {displayTitle}
                </h3>

                {/* Chart */}
                <div style={{ height: "340px", width: "100%" }}>
                    <VictoryChart
                        theme={VictoryTheme.material}
                        width={chartWidth}
                        domainPadding={{ x: 60, y: 20 }}
                        padding={{ left: 60, top: 20, right: 60, bottom: 80 }}
                        domain={{ y: [0, maxY] }}
                    >
                        {/* Y Axis */}
                        <VictoryAxis
                            dependentAxis
                            tickFormat={(t) =>
                                formatYAxis ? formatCurrency(t) : Math.floor(t)
                            }
                            style={{
                                axis: { stroke: "#E5E7EB" },
                                grid: { stroke: "#F3F4F6" },
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
