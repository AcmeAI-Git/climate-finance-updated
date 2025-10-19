import React from 'react';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryLabel,
} from 'victory';
import { formatCurrency } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';

const Transliteration = (type, language) => {
  if (language === 'bn') {
    if (type === 'Adaptation') return 'অ্যাডাপটেশন';
    if (type === 'Mitigation') return 'মিটিগেশন';
    if (type === 'Trend' || type === 'trend') return 'ট্রেন্ড';
  }
  return type;
};

const BarChartComponent = ({ data, title, xAxisKey, bars, formatYAxis = false }) => {
  const { language } = useLanguage();
  const displayTitle = Transliteration(title, language);

  // Prepare data for Victory - combine all bars into single dataset
  const chartData = data.map((item) => {
    const dataPoint = { x: item[xAxisKey] };
    bars.forEach((bar) => {
      dataPoint[bar.dataKey] = item[bar.dataKey];
    });
    return dataPoint;
  });

  return (
    <div className="w-full">
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-300" style={{ minHeight: '380px' }}>
        <div style={{ height: '350px', width: '100%' }}>
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={50}
            padding={{ left: 20, top: 50, right: 20, bottom: 80 }}
            domain={{ y: [0, Math.max(...data.flatMap(item => bars.map(bar => item[bar.dataKey]))) + 1] }}
          >
            <VictoryLabel
              text={displayTitle}
              x={170}
              y={20}
              textAnchor="middle"
              style={{
                fontSize: 18,
                fontWeight: 600,
                fill: '#111827'
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => formatYAxis ? formatCurrency(t) : Math.floor(t)}
              style={{
                axis: { stroke: '#E5E7EB', strokeWidth: 1 },
                grid: { stroke: '#F3F4F6', strokeWidth: 1 },
                ticks: { stroke: '#E5E7EB', strokeWidth: 1 },
                tickLabels: { 
                  fontSize: 11, 
                  fill: '#6B7280',
                  fontFamily: 'inherit'
                }
              }}
            />
            <VictoryAxis
              tickFormat={(t) => t}
              style={{
                axis: { stroke: '#E5E7EB', strokeWidth: 1 },
                ticks: { stroke: '#E5E7EB', strokeWidth: 1 },
                tickLabels: { 
                  fontSize: 10, 
                  fill: '#6B7280',
                  fontFamily: 'inherit',
                  angle: -45,
                  textAnchor: 'end'
                }
              }}
            />
            {bars.map((bar, index) => (
              <VictoryBar
                key={index}
                data={chartData}
                x="x"
                y={bar.dataKey}
                barWidth={25}
                style={{
                  data: { 
                    fill: bar.fill,
                    stroke: bar.fill,
                    strokeWidth: 0
                  }
                }}
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{
                      fill: 'rgba(17, 24, 39, 0.95)',
                      stroke: '#7C65C1',
                      strokeWidth: 1
                    }}
                    style={{
                      fontSize: 13,
                      fill: '#F9FAFB',
                      fontFamily: 'inherit'
                    }}
                    flyoutPadding={{ top: 8, bottom: 8, left: 12, right: 12 }}
                    cornerRadius={8}
                    labelComponent={
                      <div style={{ color: '#F9FAFB' }}>
                        {({ datum }) => (
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                              {datum.x}
                            </div>
                            <div style={{ color: bar.fill }}>
                              {Transliteration(bar.name || bar.dataKey, language)}: {formatYAxis ? formatCurrency(datum.y) : datum.y}
                            </div>
                          </div>
                        )}
                      </div>
                    }
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