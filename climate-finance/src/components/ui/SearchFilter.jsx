import React, { useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { SEARCH_CONFIGS } from '../../constants/searchConfigs';

// Advanced search function with weighted scoring
const advancedSearch = (data, searchValue, searchConfig) => {
  if (!searchValue.trim()) return data;
  
  const searchTerms = searchValue.toLowerCase().split(' ').filter(term => term.length > 0);
  
  return data.map(item => {
    let score = 0;
    let matchCount = 0;
    
    // Check each search field
    searchConfig.searchFields.forEach(field => {
      const value = getNestedValue(item, field.key);
      if (value) {
        const fieldValue = value.toString().toLowerCase();
        
        // Check for exact matches (higher score)
        if (fieldValue.includes(searchValue.toLowerCase())) {
          score += field.weight * 2;
          matchCount++;
        }
        
        // Check for individual term matches
        searchTerms.forEach(term => {
          if (fieldValue.includes(term)) {
            score += field.weight;
            matchCount++;
          }
        });
      }
    });
    
    return { ...item, _searchScore: score, _matchCount: matchCount };
  })
  .filter(item => item._searchScore > 0)
  .sort((a, b) => b._searchScore - a._searchScore);
};

// Helper function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Filter data based on active filters
const filterData = (data, activeFilters) => {
  return data.filter(item => {
    const passesAllFilters = Object.entries(activeFilters).every(([key, value]) => {
      if (!value || value === 'All') return true;
      
      const itemValue = getNestedValue(item, key);
      
      // If the field doesn't exist in the data, skip this filter
      if (itemValue === undefined || itemValue === null) {
        return true;
      }
      
      // Handle case-insensitive matching for string values
      if (typeof itemValue === 'string' && typeof value === 'string') {
        const matches = itemValue.toLowerCase() === value.toLowerCase();
        return matches;
      }
      
      // Handle numeric values (like IDs)
      if (typeof itemValue === 'number' && typeof value === 'string') {
        const matches = itemValue.toString() === value;
        return matches;
      }
      
      // Handle string values that should be compared as numbers
      if (typeof itemValue === 'string' && typeof value === 'string' && !isNaN(itemValue) && !isNaN(value)) {
        const matches = itemValue === value;
        return matches;
      }
      
      const matches = itemValue === value;
      return matches;
    });
    
    return passesAllFilters;
  });
};

const SearchFilter = ({
  data = [],
  onFilteredData,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  entityType = 'projects',
  customConfig = null,
  activeFilters = {},
  onFiltersChange,
  filters = [], // Legacy support
  className = '',
  showAdvancedSearch = false,
  onClearAll = null
}) => {
  // Get search configuration
  const searchConfig = useMemo(() => {
    if (customConfig) return customConfig;
    if (filters.length > 0) {
      // Legacy support - use passed filters directly
      return { 
        searchFields: [{ key: 'name', weight: 1 }, { key: 'title', weight: 1 }], 
        filters 
      };
    }
    return SEARCH_CONFIGS[entityType] || SEARCH_CONFIGS.projects;
  }, [entityType, customConfig, filters]);

  // Process data with search and filters
  useEffect(() => {
    let result = [...data]; // Create a copy to avoid mutation issues
    
    // Apply filters first
    if (Object.keys(activeFilters).length > 0) {
      result = filterData(result, activeFilters);
    }
    
    // Apply search with scoring
    if (searchValue) {
      result = advancedSearch(result, searchValue, searchConfig);
    }
    
    // Always call onFilteredData when data changes or when filters/search change
    if (onFilteredData) {
      onFilteredData(result);
    }
  }, [data, searchValue, activeFilters, searchConfig, onFilteredData]);

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...activeFilters, [filterKey]: value };
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      onSearchChange('');
      if (onFiltersChange) {
        onFiltersChange({});
      }
    }
  };

  const hasActiveFilters = searchValue || Object.values(activeFilters).some(v => v && v !== 'All');

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-4">
        {/* Enhanced Search Input */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Filter Dropdowns Grid */}
        {searchConfig.filters && searchConfig.filters.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {searchConfig.filters.map((filter) => (
              <select
                key={filter.key}
                value={activeFilters[filter.key] || 'All'}
                onChange={(e) => {
                  handleFilterChange(filter.key, e.target.value);
                }}
                className={`px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${filter.selectProps?.className || ''}`}
                translate={filter.selectProps?.translate || undefined}
              >
                {filter.options.map((option, index) => (
                  <option key={`${filter.key}-${option.value}-${index}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>

      {/* Search Tips (when advanced search is enabled) */}
      {showAdvancedSearch && searchValue && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
          <strong>Search tips:</strong> Use multiple words for better results. 
          Searching in: {searchConfig.searchFields.slice(0, 3).map(f => f.label).join(', ')}
          {searchConfig.searchFields.length > 3 && ` and ${searchConfig.searchFields.length - 3} more fields`}
        </div>
      )}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 underline"
          >
            <X size={12} />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;