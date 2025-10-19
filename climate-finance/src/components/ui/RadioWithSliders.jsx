import React from 'react';

const RadioWithSliders = ({ 
  label, 
  value, 
  onChange, 
  sliderConfigs = [],
  className = '' 
}) => {
  const handleRadioChange = (hasComponent) => {
    if (hasComponent) {
      // Initialize with default values when enabling WASH component
      const initialValues = { presence: true };
      sliderConfigs.forEach(config => {
        initialValues[config.key] = value[config.key] || 0;
      });
      onChange(initialValues);
    } else {
      // Reset all values when disabling WASH component
      const resetValues = { presence: false };
      sliderConfigs.forEach(config => {
        resetValues[config.key] = 0;
      });
      onChange(resetValues);
    }
  };

  const handleSliderChange = (key, newValue) => {
    onChange(prev => ({
      ...prev,
      [key]: newValue
    }));
  };

  const totalPercentage = sliderConfigs.reduce((sum, config) => sum + (value[config.key] || 0), 0);
  const isOverLimit = totalPercentage > 100;

  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            value.presence ? 'bg-green-400' : 'bg-gray-300'
          }`}></div>
          <span className="text-xs font-medium text-gray-500">
            {value.presence ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      {/* Modern toggle-style radio buttons */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6 relative">
        <div 
          className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-lg shadow-sm transition-transform duration-300 ease-out ${
            value.presence ? 'transform translate-x-full' : 'transform translate-x-0'
          }`}
        ></div>
        
        <label className="flex-1 flex items-center justify-center p-2 cursor-pointer relative z-10">
          <input
            type="radio"
            name="wash_presence"
            checked={!value.presence}
            onChange={() => handleRadioChange(false)}
            className="sr-only"
          />
          <span className={`font-medium text-sm transition-colors duration-300 ${
            !value.presence ? 'text-gray-900' : 'text-gray-500'
          }`}>
            No
          </span>
        </label>
        
        <label className="flex-1 flex items-center justify-center p-2 cursor-pointer relative z-10">
          <input
            type="radio"
            name="wash_presence"
            checked={value.presence}
            onChange={() => handleRadioChange(true)}
            className="sr-only"
          />
          <span className={`font-medium text-sm transition-colors duration-300 ${
            value.presence ? 'text-gray-900' : 'text-gray-500'
          }`}>
            Yes
          </span>
        </label>
      </div>

      {/* Sleek sliders - only show when WASH component is present */}
      {value.presence && (
        <div className="space-y-5 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">Component Distribution</h4>
            <div className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors duration-300 ${
              isOverLimit 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : totalPercentage > 0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-gray-50 text-gray-600 border border-gray-200'
            }`}>
              {totalPercentage.toFixed(1)}%
            </div>
          </div>
          
          <div className="space-y-4">
            {sliderConfigs.map(({ key, label: sliderLabel, max = 100 }) => {
              const currentValue = value[key] || 0;
              
              return (
                <div key={key} className="group">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors duration-200">
                      {sliderLabel}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={max}
                        step="0.1"
                        value={currentValue}
                        onChange={(e) => handleSliderChange(key, parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs font-semibold text-center bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                      <span className="text-xs text-gray-400 min-w-[8px]">%</span>
                    </div>
                  </div>
                  
                  {/* Modern slider with visible thumb */}
                  <div className="relative h-3 bg-gray-200 rounded-full">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${(currentValue / max) * 100}%` }}
                    ></div>
                    <input
                      type="range"
                      min="0"
                      max={max}
                      step="0.1"
                      value={currentValue}
                      onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {/* Clean modern thumb indicator */}
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-700 rounded-full shadow-md transition-all duration-200 ease-out pointer-events-none hover:scale-110"
                      style={{ 
                        left: `calc(${(currentValue / max) * 100}% - 12px)`,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      <div className="absolute inset-2 bg-purple-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Modern warning message */}
          {isOverLimit && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg animate-in slide-in-from-left-2 duration-300">
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs font-medium text-red-700">
                Total percentage exceeds 100%. Please adjust the values.
              </p>
            </div>
          )}
        </div>
      )}

      <style jsx="true">{`
        .slider-input::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          border: 2px solid #9333ea;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          opacity: 1;
        }
        
        .slider-input::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          border: 2px solid #9333ea;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default RadioWithSliders;