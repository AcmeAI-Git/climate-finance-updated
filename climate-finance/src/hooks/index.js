import { useState, useEffect, useCallback, useMemo } from 'react';

// Enhanced hook for API data fetching with loading and error states
export const useApiData = (apiCall, dependencies = [], options = {}) => {
  const {
    initialData = null,
    fallbackData = null,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    let attempt = 0;
    
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      while (attempt < retryAttempts) {
        try {
          const response = await apiCall();
          const result = response.data || response;
          setData(result);
          onSuccess?.(result);
          break;
        } catch (err) {
          attempt++;
          if (attempt >= retryAttempts) {
            throw err;
          }
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      if (fallbackData) {
        setData(fallbackData);
      }
      onError?.(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [apiCall, retryAttempts, retryDelay, fallbackData, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refresh = () => fetchData(true);

  return { 
    data, 
    isLoading, 
    error, 
    isRefreshing,
    refetch: fetchData, 
    refresh 
  };
};

// Hook for multiple API calls with unified loading state
export const useMultipleApiData = (apiCalls, options = {}) => {
  const { fallbackData = {} } = options;
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const promises = Object.entries(apiCalls).map(async ([key, apiCall]) => {
        try {
          const response = await apiCall();
          return [key, response.data || response];
        } catch (err) {
          setErrors(prev => ({ ...prev, [key]: err.message }));
          return [key, fallbackData[key] || null];
        }
      });

      const results = await Promise.all(promises);
      const dataMap = Object.fromEntries(results);
      setData(dataMap);
    } catch (err) {
      console.error('Error in useMultipleApiData:', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiCalls, fallbackData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { data, isLoading, errors, refetch: fetchAllData };
};

// Hook for table state management with enhanced features
export const useTable = (initialData = [], options = {}) => {
  const { 
    defaultPageSize = 10,
    searchFields = [],
    defaultSortConfig = { key: null, direction: 'asc' }
  } = options;

  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState(defaultSortConfig);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [filters, setFilters] = useState({});

  // Enhanced filtering logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search filter
      if (searchTerm) {
        const fieldsToSearch = searchFields.length > 0 ? searchFields : Object.keys(item);
        const searchMatch = fieldsToSearch.some(field =>
          item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!searchMatch) return false;
      }

      // Custom filters
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'All' || value === '') return true;
        return item[key] === value;
      });
    });
  }, [data, searchTerm, filters, searchFields]);

  // Enhanced sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
    setCurrentPage(1);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    // Data
    data: paginatedData,
    allData: sortedData,
    totalItems: sortedData.length,
    
    // State
    searchTerm,
    sortConfig,
    currentPage,
    pageSize,
    filters,
    totalPages,
    
    // Actions
    setData,
    handleSort,
    handleSearch,
    handleFilter,
    clearFilters,
    setCurrentPage,
    setPageSize,
    resetPagination
  };
};

// Hook for form state and validation with enhanced features
export const useForm = (initialData = {}, validationRules = {}, options = {}) => {
  const { onSubmit, transformSubmitData = (data) => data } = options;
  
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(initialData));
      return updated;
    });
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors, initialData]);

  const handleMultiSelectChange = useCallback((name, selectedValues) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: selectedValues };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(initialData));
      return updated;
    });
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors, initialData]);

  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    if (rules.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${fieldName.replace(/_/g, ' ')} is required`;
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return `Must be no more than ${rules.maxLength} characters`;
    }

    if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.patternMessage || 'Invalid format';
    }

    if (rules.custom) {
      return rules.custom(value, formData);
    }

    return '';
  }, [validationRules, formData]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField, validationRules]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return false;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      
      const submitData = transformSubmitData(formData);
      
      if (onSubmit) {
        await onSubmit(submitData);
      }
      
      return true;
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: error.message || 'An error occurred' });
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialData]);

  const setFieldValue = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear field error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  return {
    // State
    formData,
    errors,
    isSubmitting,
    touched,
    isDirty,
    
    // Actions
    handleChange,
    handleMultiSelectChange,
    validateForm,
    validateField,
    handleSubmit,
    resetForm,
    setFormData,
    setErrors,
    setFieldValue
  };
};

// Hook for local storage with JSON serialization and validation
export const useLocalStorage = (key, initialValue, options = {}) => {
  const { 
    serialize = JSON.stringify, 
    deserialize = JSON.parse,
    validator 
  } = options;

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      
      const parsed = deserialize(item);
      
      // Validate if validator is provided
      if (validator && !validator(parsed)) {
        console.warn(`Invalid data in localStorage for key "${key}". Using initial value.`);
        return initialValue;
      }
      
      return parsed;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Validate before storing
      if (validator && !validator(valueToStore)) {
        throw new Error('Value failed validation');
      }
      
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, serialize(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage for key "${key}":`, error);
    }
  }, [key, serialize, storedValue, validator]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage for key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Hook for managing async operations with loading states
export const useAsync = (asyncFunction, dependencies = []) => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (...args) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await asyncFunction(...args);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, dependencies);

  return { ...state, execute };
};