import React from 'react';

const FinancialSummaryCard = ({ 
  title, 
  value, 
  subtitle, 
  color = 'purple', 
  className = '' 
}) => {
  const colorClasses = {
    purple: 'text-purple-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    gray: 'text-gray-600'
  };

  return (
    <div className={`text-center p-6 bg-gray-50 rounded-lg border border-gray-100 ${className}`}>
      <div className={`text-3xl font-bold mb-2 ${colorClasses[color] || colorClasses.purple}`}>
        {value}
      </div>
      <div className="text-sm font-medium text-gray-800 mb-1">
        {title}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default FinancialSummaryCard;