import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import Badge from './Badge';

const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = 'Select options...',
  searchable = true,
  disabled = false,
  maxDisplay = 3,
  className = '',
  error = false,
  dropdownMinWidth = 'min-w-[300px]',
  dropdownMaxHeight = 'max-h-96',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Check if "All" option exists and get its value
  const allOption = options.find(opt => opt.value === "All" || opt.label.toLowerCase().includes("all"));
  const allOptionValue = allOption?.value;

  // Filter options based on search term, but always show "All" first if it exists
  const filteredOptions = useMemo(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Ensure "All" option appears first if it exists and matches search
    if (allOption && (searchTerm === '' || allOption.label.toLowerCase().includes(searchTerm.toLowerCase()))) {
      const withoutAll = filtered.filter(opt => opt.value !== allOptionValue);
      return [allOption, ...withoutAll];
    }
    return filtered;
  }, [options, searchTerm, allOption, allOptionValue]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggleOption = (optionValue) => {
    // Handle "All" option specially
    if (optionValue === allOptionValue) {
      // If "All" is selected, clear all other selections
      if (value.includes(allOptionValue)) {
        // Deselecting "All" - do nothing (keep empty array)
        onChange([]);
      } else {
        // Selecting "All" - clear all other selections
        onChange([allOptionValue]);
      }
    } else {
      // Handle regular options
      let newValue;
      if (value.includes(optionValue)) {
        // Deselecting a regular option
        newValue = value.filter(v => v !== optionValue);
        // If "All" was selected, remove it when selecting a specific option
        if (allOptionValue && newValue.includes(allOptionValue)) {
          newValue = newValue.filter(v => v !== allOptionValue);
        }
      } else {
        // Selecting a regular option
        newValue = [...value, optionValue];
        // If "All" was selected, remove it when selecting a specific option
        if (allOptionValue && newValue.includes(allOptionValue)) {
          newValue = newValue.filter(v => v !== allOptionValue);
        }
      }
      onChange(newValue);
    }
  };

  const handleRemoveOption = (optionValue, e) => {
    e.stopPropagation();
    const newValue = value.filter(v => v !== optionValue);
    onChange(newValue);
  };

  const getSelectedLabels = () => {
    return options
      .filter(option => value.includes(option.value))
      .map(option => option.label);
  };

  const selectedLabels = getSelectedLabels();
  // If "All" is selected, show only "All" in the display
  const isAllSelected = allOptionValue && value.includes(allOptionValue);
  const displayedLabels = isAllSelected 
    ? [allOption?.label || "All"]
    : selectedLabels.slice(0, maxDisplay);
  const remainingCount = isAllSelected ? 0 : selectedLabels.length - maxDisplay;

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Main Input */}
      <div
        className={`
          min-h-[2.5rem] px-3 py-2 border rounded-lg cursor-pointer
          flex items-center justify-between gap-2
          transition-all duration-200
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
          ${isOpen ? 'ring-2 ring-purple-500 border-transparent' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        {...props}
      >
        <div className="flex-1 flex flex-wrap gap-1 min-h-[1.5rem] items-center">
          {selectedLabels.length === 0 && !isAllSelected ? (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          ) : (
            <>
              {displayedLabels.map((label) => {
                const option = options.find(opt => opt.label === label);
                if (!option) return null;
                return (
                  <Badge
                    key={option.value}
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {label}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveOption(option.value, e)}
                        className="hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </Badge>
                );
              })}
              {remainingCount > 0 && (
                <Badge variant="default" size="sm">
                  +{remainingCount} more
                </Badge>
              )}
            </>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className={`absolute top-full left-0 ${dropdownMinWidth} w-max max-w-[500px] mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 ${dropdownMaxHeight} overflow-hidden`}>
          {/* Search */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options */}
          <div className={`${dropdownMaxHeight === 'max-h-96' ? 'max-h-80' : 'max-h-64'} overflow-y-auto`}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={`
                      px-3 py-2 text-sm cursor-pointer flex items-center justify-between
                      hover:bg-gray-50 transition-colors
                      ${isSelected ? 'bg-purple-50 text-purple-700' : 'text-gray-700'}
                    `}
                    onClick={() => handleToggleOption(option.value)}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <Check size={16} className="text-purple-600" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;