import React, { useRef, useState, useEffect } from "react";
import {
    VictoryChart,
    VictoryBar,
    VictoryAxis,
    VictoryTooltip,
    VictoryTheme,
} from "victory";
import { formatCurrency } from "../../utils/formatters";
import { useLanguage } from "../../context/LanguageContext";

const Transliteration = (type, language) => {
    if (language === "bn") {
        if (type === "Adaptation") return "অ্যাডাপটেশন";
        if (type === "Mitigation") return "মিটিগেশন";
        if (type === "Trend" || type === "trend") return "ট্রেন্ড";
    }
    return type;
};

const BarChartComponent = ({
    data,
    title,
    xAxisKey,
    bars,
    formatYAxis = false,
}) => {
    const { language } = useLanguage();
    const displayTitle = Transliteration(title, language);

    // ✅ Responsive width tracking
    const containerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(800);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setChartWidth(containerRef.current.offsetWidth - 40); // 40px padding margin
            }
        };
        handleResize(); // initial
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Prepare chart data
    const chartData = data.map((item) => {
        const dataPoint = { x: item[xAxisKey] };
        bars.forEach((bar) => {
            dataPoint[bar.dataKey] = item[bar.dataKey];
        });
        return dataPoint;
    });

    return (
        <div ref={containerRef} className="w-full overflow-hidden">
            <div
                className="relative w-full h-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-300 select-none"
                style={{ minHeight: "380px" }}
            >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-start">
                    {displayTitle}
                </h3>

                {/* ✅ Chart auto-resizes based on container width */}
                <div style={{ height: "320px", width: "100%" }}>
                    <VictoryChart
                        theme={VictoryTheme.material}
                        width={chartWidth}
                        domainPadding={{ x: 60, y: 20 }}
                        padding={{ left: 50, top: 20, right: 50, bottom: 80 }}
                        domain={{
                            y: [
                                0,
                                Math.max(
                                    ...data.flatMap((item) =>
                                        bars.map((bar) => item[bar.dataKey])
                                    )
                                ) + 1,
                            ],
                        }}
                    >
                        <VictoryAxis
                            dependentAxis
                            tickFormat={(t) =>
                                formatYAxis ? formatCurrency(t) : Math.floor(t)
                            }
                            style={{
                                axis: { stroke: "#E5E7EB" },
                                grid: { stroke: "#F3F4F6" },
                                tickLabels: {
                                    fontSize: 11,
                                    fill: "#6B7280",
                                },
                            }}
                        />
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
                        {bars.map((bar, index) => (
                            <VictoryBar
                                key={index}
                                data={chartData}
                                x="x"
                                y={bar.dataKey}
                                barRatio={0.8}
                                style={{
                                    data: {
                                        fill: bar.fill,
                                        stroke: bar.fill,
                                    },
                                }}
                                labels={({ datum }) =>
                                    `${Transliteration(
                                        bar.name || bar.dataKey,
                                        language
                                    )}: ${
                                        formatYAxis
                                            ? formatCurrency(datum.y)
                                            : datum.y
                                    }`
                                }
                                labelComponent={
                                    <VictoryTooltip
                                        flyoutStyle={{
                                            fill: "rgba(17, 24, 39, 0.95)",
                                            stroke: "#7C65C1",
                                        }}
                                        style={{
                                            fontSize: 13,
                                            fill: "#F9FAFB",
                                        }}
                                    />
                                }
                            />
                        ))}
                    </VictoryChart>
                </div>
            </div>
        </div>
    );
};

export default BarChartComponent;
