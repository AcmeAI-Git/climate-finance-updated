import { useState, useMemo } from 'react';

export const useSearchAndFilter = (data, searchFields = [], initialFilters = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState(initialFilters);

  // Helper function to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Search function
  const searchInData = (data, searchValue, searchFields) => {
    if (!searchValue.trim()) return data;
    
    const searchTermLower = searchValue.toLowerCase();
    
    return data.filter(item => {
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        return value && value.toString().toLowerCase().includes(searchTermLower);
      });
    });
  };

  // Filter function
  const filterData = (data, activeFilters) => {
    return data.filter(item => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value || value === 'All' || value === '') return true;
        const itemValue = getNestedValue(item, key);
        return itemValue === value;
      });
    });
  };

  const filteredData = useMemo(() => {
    let result = data;
    
    // Apply search
    if (searchTerm) {
      result = searchInData(result, searchTerm, searchFields);
    }
    
    // Apply filters
    if (Object.keys(activeFilters).length > 0) {
      result = filterData(result, activeFilters);
    }
    
    return result;
  }, [data, searchTerm, activeFilters, searchFields]);

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveFilters(initialFilters);
  };

  return {
    searchTerm,
    setSearchTerm,
    activeFilters,
    setActiveFilters,
    filteredData,
    handleFilterChange,
    clearFilters
  };
};
