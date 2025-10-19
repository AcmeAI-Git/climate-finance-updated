import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TOOLTIP_STYLES } from '../../utils/constants';
import { useLanguage } from '../../context/LanguageContext';

const LineChartComponent = ({ 
  data, 
  title, 
  xAxisKey, 
  yAxisKey, 
  lineColor = '#7C65C1',
  formatYAxis = false,
  lineName = 'Value'
}) => {
  const formatYAxisMillion = value => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const Transliteration = (type, language) => {
    if (language === 'bn') {
      if (type === 'Adaptation') return 'অ্যাডাপটেশন';
      if (type === 'Mitigation') return 'মিটিগেশন';
    }
    return type;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    const { language } = useLanguage();
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="notranslate" translate="no" style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div className="font-semibold mb-1">{label}</div>
        {payload.map((entry, idx) => (
          <div key={idx} style={{ color: entry.color, marginBottom: 4 }}>
            {Transliteration(entry.name, language)}: {entry.value}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }} // ✅ Increased margins
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xAxisKey}
            fontSize={12}
            interval={0} // ✅ Show all year labels
          />
          <YAxis 
            tickFormatter={formatYAxis ? formatYAxisMillion : (value) => value}
            width={100} // ✅ Increased width for better label fit
          />
          <Tooltip 
            content={<CustomTooltip />}
          />
          <Line 
            type="monotone" 
            dataKey={yAxisKey} 
            stroke={lineColor} 
            strokeWidth={2} 
            dot={{ fill: lineColor }} 
            activeDot={{ r: 6 }}
            name={lineName}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;