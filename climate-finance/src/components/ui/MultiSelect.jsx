import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, dropdownWidth: 0 });

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

  // Calculate dropdown position when it opens or window scrolls/resizes
  const updateDropdownPosition = useCallback(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Extract numeric min width from dropdownMinWidth prop (e.g., "min-w-[350px]" -> 350)
      const minWidthMatch = dropdownMinWidth.match(/\[(\d+)px\]/);
      const propMinWidth = minWidthMatch ? parseInt(minWidthMatch[1], 10) : 300;
      
      // Responsive min width based on screen size
      const isMobile = viewportWidth < 640; // sm breakpoint
      const isTablet = viewportWidth < 1024; // lg breakpoint
      const minDropdownWidth = isMobile ? Math.min(rect.width, viewportWidth - 16) : isTablet ? 300 : propMinWidth;
      
      // For fixed positioning, getBoundingClientRect() already gives viewport coordinates
      let top = rect.bottom + 4; // 4px gap
      let left = rect.left;
      
      // Calculate dropdown width - ensure it doesn't exceed viewport
      const dropdownWidth = Math.max(rect.width, minDropdownWidth);
      const maxDropdownWidth = viewportWidth - 16; // 8px padding on each side
      const finalDropdownWidth = Math.min(dropdownWidth, maxDropdownWidth);
      
      // Adjust if dropdown would go off-screen to the right
      if (left + finalDropdownWidth > viewportWidth - 8) {
        left = viewportWidth - finalDropdownWidth - 8; // 8px padding from edge
      }
      
      // Adjust if dropdown would go off-screen to the left
      if (left < 8) {
        left = 8;
      }
      
      // On mobile, center align if trigger is very wide
      if (isMobile && rect.width > viewportWidth * 0.8) {
        left = (viewportWidth - finalDropdownWidth) / 2;
      }
      
      // Adjust if dropdown would go off-screen at the bottom
      const estimatedDropdownHeight = isMobile ? 250 : 300; // Smaller height estimate on mobile
      if (top + estimatedDropdownHeight > viewportHeight) {
        // Position above the trigger instead
        top = rect.top - estimatedDropdownHeight - 4;
        // But don't go above viewport
        if (top < 8) {
          top = 8;
        }
      }
      
      setDropdownPosition({
        top,
        left,
        width: rect.width,
        dropdownWidth: finalDropdownWidth,
      });
    }
  }, [isOpen, dropdownMinWidth]);

  useEffect(() => {
    updateDropdownPosition();
    
    if (isOpen) {
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

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
    <React.Fragment>
      <div className={`relative ${className}`}>
        {/* Main Input */}
        <div
          ref={triggerRef}
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
      </div>

      {/* Dropdown - Using portal and fixed positioning to avoid overflow issues */}
      {isOpen && !disabled && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className={`fixed bg-white border border-gray-300 rounded-lg shadow-xl z-[9999] ${dropdownMaxHeight} overflow-hidden`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: dropdownPosition.dropdownWidth > 0 ? `${dropdownPosition.dropdownWidth}px` : 'auto',
            minWidth: dropdownPosition.dropdownWidth > 0 ? `${dropdownPosition.dropdownWidth}px` : 'auto',
            maxWidth: 'calc(100vw - 16px)',
          }}
        >
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
        </div>,
        document.body
      )}
    </React.Fragment>
  );
};

export default MultiSelect;