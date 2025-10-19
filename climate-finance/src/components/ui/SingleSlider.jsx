import React from 'react';

const SingleSlider = ({ 
  label, 
  value, 
  onChange, 
  description,
  onDescriptionChange,
  className = '',
  max = 100,
  min = 0,
  step = 0.1
}) => {
  const handleSliderChange = (newValue) => {
    onChange(parseFloat(newValue) || 0);
  };

  const handleDescriptionChange = (e) => {
    onDescriptionChange(e.target.value);
  };

  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            value > 0 ? 'bg-green-400' : 'bg-gray-300'
          }`}></div>
          <span className="text-xs font-medium text-gray-500">
            {value > 0 ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      <div className="space-y-5">
        
        <div className="group">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors duration-200">
              WASH Component Percentage
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => handleSliderChange(e.target.value)}
                className="w-16 px-2 py-1 text-xs font-semibold text-center bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              <span className="text-xs text-gray-400 min-w-[8px]">%</span>
            </div>
          </div>
          
          {/* Modern slider with visible thumb */}
          <div className="relative h-3 bg-gray-200 rounded-full">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(value / max) * 100}%` }}
            ></div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => handleSliderChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {/* Clean modern thumb indicator */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-700 rounded-full shadow-md transition-all duration-200 ease-out pointer-events-none hover:scale-110"
              style={{ 
                left: `calc(${(value / max) * 100}% - 12px)`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div className="absolute inset-2 bg-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Description field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WASH Component Description
          </label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

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

export default SingleSlider;
