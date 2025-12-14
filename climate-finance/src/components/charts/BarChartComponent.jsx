import React, { useRef, useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
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
    const containerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState("100%");

    useEffect(() => {
        if (scrollable && containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth - 40;
            // For bar charts, estimate ~40px per data point
            const minBarWidth = 40;
            const requiredWidth = Math.max(data.length * minBarWidth, 600);
            setChartWidth(Math.max(containerWidth, requiredWidth));
        } else {
            setChartWidth("100%");
        }
    }, [data, scrollable]);

    const formatYAxisMillion = (value) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${value}`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || payload.length === 0) return null;
        return (
            <div
                className="notranslate"
                translate="no"
                style={{
                    background: "white",
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >
                <div className="font-semibold mb-1">{label}</div>
                {payload.map((entry, idx) => {
                    const barName = Transliteration(
                        entry.name || entry.dataKey,
                        language
                    );
                    const formattedValue = formatYAxis
                        ? formatCurrency(entry.value)
                        : entry.value;
                    return (
                        <div
                            key={idx}
                            style={{ color: entry.color, marginBottom: 4 }}
                        >
                            {barName}: {formattedValue}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderChart = () => (
        <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
                dataKey={xAxisKey}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
            />
            <YAxis
                tickFormatter={
                    formatYAxis ? formatYAxisMillion : (value) => value
                }
                width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            {bars.length > 1 && (
                <Legend
                    formatter={(value) => Transliteration(value, language)}
                />
            )}
            {bars.map((bar, idx) => (
                <Bar
                    key={idx}
                    dataKey={bar.dataKey}
                    name={bar.name || bar.dataKey}
                    fill={bar.fill}
                />
            ))}
        </BarChart>
    );

    return (
        <div ref={containerRef} className="w-full">
            <div
                className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-300"
                style={{ minHeight: "440px" }}
            >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-start">
                    {displayTitle}
                </h3>

                {scrollable ? (
                    <div
                        style={{
                            overflowX: "auto",
                            overflowY: "hidden",
                            WebkitOverflowScrolling: "touch",
                        }}
                    >
                        <div
                            style={{
                                width:
                                    typeof chartWidth === "number"
                                        ? chartWidth
                                        : "100%",
                                minHeight: "340px",
                                display: "inline-block",
                            }}
                        >
                            <ResponsiveContainer width="100%" height={340}>
                                {renderChart()}
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={340}>
                        {renderChart()}
                    </ResponsiveContainer>
                )}
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
