import React, { useState, useMemo } from 'react';
import { Plus, Search, X } from 'lucide-react';

const CheckboxGroup = ({ 
  label, 
  options = [], 
  selectedValues = [], 
  onChange, 
  className = '',
  getOptionId = (option) => option.id,
  getOptionLabel = (option) => option.name,
  getOptionSubtext = () => null,
  onAddNew = null,
  addButtonText = "Add New",
  // When true, mark option label/subtext with translate="no" and the notranslate class
  preventTranslate = false,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return options;
    }
    const searchLower = searchTerm.toLowerCase();
    return options.filter(option => {
      const label = getOptionLabel(option);
      const subtext = getOptionSubtext(option);
      return (
        label?.toLowerCase().includes(searchLower) ||
        (subtext && subtext.toLowerCase().includes(searchLower))
      );
    });
  }, [options, searchTerm, getOptionLabel, getOptionSubtext]);

  const handleCheckboxChange = (optionId, isChecked) => {
    let newSelectedValues;
    if (isChecked) {
      // Ensure we don't add duplicates - use String conversion for consistent comparison
      const alreadySelected = selectedValues.some(id => String(id) === String(optionId));
      if (!alreadySelected) {
        newSelectedValues = [...selectedValues, optionId];
      } else {
        newSelectedValues = selectedValues;
      }
    } else {
      newSelectedValues = selectedValues.filter(id => {
        // Use String conversion to handle type mismatches (number vs string)
        return String(id) !== String(optionId);
      });
    }
    onChange(newSelectedValues);
  };

  return (
    <div className={`bg-white border border-gray-300 rounded-xl p-4 ${className}`}>
      {/* Header with label and optional add button */}
      <div className="flex items-center justify-between mb-3">
        {label && (
          <label className="block text-sm font-medium text-gray-700 notranslate" translate="no">{label}</label>
        )}
        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-all duration-200 notranslate"
            translate="no"
          >
            <Plus size={12} />
            {addButtonText}
          </button>
        )}
      </div>

      {/* Search Bar */}
      {options.length > 0 && (
        <div className="mb-3 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              disabled={disabled}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={disabled}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}
      
      {filteredOptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {filteredOptions.map(option => {
            const optionId = getOptionId(option);
            // Use String conversion for consistent comparison
            const isSelected = selectedValues.some(id => String(id) === String(optionId));
            const subtext = getOptionSubtext(option);
            
            return (
              <label 
                key={optionId} 
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 group ${
                  disabled 
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
                    : isSelected 
                      ? 'bg-purple-50 border-purple-200 shadow-sm cursor-pointer' 
                      : 'bg-gray-50 border-gray-300 hover:bg-purple-25 hover:border-purple-200 cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => !disabled && handleCheckboxChange(optionId, e.target.checked)}
                  disabled={disabled}
                  className="mt-0.5 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-400 rounded transition-colors duration-200 disabled:cursor-not-allowed"
                />
                <div className="flex-1 min-w-0">
                  <span
                    translate={preventTranslate ? 'no' : undefined}
                    className={`${preventTranslate ? 'notranslate ' : ''}text-sm font-medium block transition-colors duration-200 leading-relaxed wrap-break-word whitespace-normal ${
                      isSelected ? 'text-purple-800' : 'text-gray-900 group-hover:text-purple-700'
                    }`}
                  >
                    {getOptionLabel(option)}
                  </span>
                  {subtext && (
                    <span
                      translate={preventTranslate ? 'no' : undefined}
                      className={`${preventTranslate ? 'notranslate ' : ''}text-xs block mt-1 transition-colors duration-200 leading-snug wrap-break-word whitespace-normal ${
                        isSelected ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-500'
                      }`}
                    >
                      {subtext}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            {searchTerm ? 'No options found matching your search' : 'No options available'}
          </p>
          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="mt-3 inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-all duration-200"
            >
              <Plus size={14} />
              {addButtonText}
            </button>
          )}
        </div>
      )}
      
    </div>
  );
};

export default CheckboxGroup;