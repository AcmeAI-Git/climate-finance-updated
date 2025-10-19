import React from 'react';

const ProgressBar = ({ 
  label = "Progress",
  percentage = 0, 
  current = 0, 
  total = 0, 
  formatValue = (value) => value,
  color = "purple",
  showValues = true,
  className = "",
  warning = ""
}) => {
  const colorClasses = {
    purple: {
      gradient: "from-purple-500 to-purple-600",
      text: "text-purple-600",
      bg: "from-gray-50 to-purple-50"
    },
    green: {
      gradient: "from-green-500 to-green-600", 
      text: "text-green-600",
      bg: "from-gray-50 to-green-50"
    },
    blue: {
      gradient: "from-blue-500 to-blue-600",
      text: "text-blue-600", 
      bg: "from-gray-50 to-blue-50"
    },
    orange: {
      gradient: "from-orange-500 to-orange-600",
      text: "text-orange-600",
      bg: "from-gray-50 to-orange-50"
    },
    primary: {
      gradient: "from-primary-500 to-primary-600",
      text: "text-primary-600",
      bg: "from-gray-50 to-primary-50"
    },
    warning: {
      gradient: "from-red-500 to-red-600",
      text: "text-red-600",
      bg: "from-gray-50 to-red-50"
    }
  };

  const selectedColor = colorClasses[color] || colorClasses.purple;

  return (
    <div className={`bg-gradient-to-r ${selectedColor.bg} rounded-lg p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-700 font-semibold">
          {label}
        </div>
        <div className={`text-sm ${selectedColor.text} font-bold`}>
          {percentage.toFixed(1)}%
        </div>
      </div>
      
      {showValues && (
        <div className="text-sm text-gray-500 mb-4">
          {formatValue(current)} of {formatValue(total)}
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
        <div
          className={`bg-gradient-to-r ${selectedColor.gradient} h-4 rounded-full transition-all duration-700 ease-out shadow-sm`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      {warning && (
        <div className="mt-2 text-xs text-red-600 font-semibold flex items-center gap-1">
          <svg xmlns='http://www.w3.org/2000/svg' className='inline w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z' /></svg>
          {warning}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;