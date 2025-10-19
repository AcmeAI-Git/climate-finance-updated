import React from 'react';
import Card from './Card';
import PieChartComponent from '../charts/PieChartComponent';
import LineChartComponent from '../charts/LineChartComponent';
import BarChartComponent from '../charts/BarChartComponent';
import { useLanguage } from '../../context/LanguageContext';
import { translateChartData, getChartTitle } from '../../utils/chartTranslations';

// Universal chart grid for consistent chart layouts
const ChartGrid = ({
  charts = [],
  columns = 2, // 1 | 2 | 3
  gap = 'md',
  animated = true,
  animationDelay = 100,
  cardProps = {},
  className = ''
}) => {
  const { language } = useLanguage();
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
  };

  const renderChart = (chart) => {
    const { type, data, title, translationCategory, ...chartProps } = chart;
    
    // Handle translations for chart data and titles
    const translatedData = translationCategory ? translateChartData(data, language, translationCategory) : data;
    const translatedTitle = title && typeof title === 'string' && title.includes('By') ? 
      getChartTitle(language, title.toLowerCase().replace(/\s+/g, '')) : title;
    
    switch (type) {
      case 'pie':
        return (
          <PieChartComponent
            title={translatedTitle}
            data={translatedData}
            {...chartProps}
          />
        );
      case 'line':
        return (
          <LineChartComponent
            title={translatedTitle}
            data={translatedData}
            {...chartProps}
          />
        );
      case 'bar':
        return (
          <BarChartComponent
            title={translatedTitle}
            data={translatedData}
            {...chartProps}
          />
        );
      case 'custom':
        return chart.render ? chart.render(translatedData) : null;
      default:
        return <div>Unknown chart type: {type}</div>;
    }
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {charts.map((chart, index) => (
        <div 
          key={chart.id || index}
          className={animated ? "animate-fade-in-up" : ""}
          style={animated ? { animationDelay: `${400 + (index * animationDelay)}ms` } : {}}
        >
          <Card hover padding={true} {...cardProps}>
            {renderChart(chart)}
          </Card>
        </div>
      ))}
    </div>
  );
};

export default ChartGrid;