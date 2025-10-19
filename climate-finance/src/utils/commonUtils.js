import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  DollarSign,
  TrendingUp,
  Building,
  Users,
  Target
} from 'lucide-react';

// Universal status configurations
export const getStatusConfig = (status, type = 'project') => {
  const configs = {
    project: {
      'Active': { 
        label: 'Active', 
        color: 'bg-green-100 text-green-700 border-green-200', 
        icon: <Play size={12} /> 
      },
      'Completed': { 
        label: 'Completed', 
        color: 'bg-blue-100 text-blue-700 border-blue-200', 
        icon: <CheckCircle size={12} /> 
      },
      'Planning': { 
        label: 'Planning', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
        icon: <Clock size={12} /> 
      },
      'On Hold': { 
        label: 'On Hold', 
        color: 'bg-red-100 text-red-700 border-red-200', 
        icon: <Pause size={12} /> 
      },
      'Suspended': { 
        label: 'Suspended', 
        color: 'bg-gray-100 text-gray-700 border-gray-200', 
        icon: <XCircle size={12} /> 
      }
    },
    funding: {
      'Approved': { 
        label: 'Approved', 
        color: 'bg-green-100 text-green-700 border-green-200', 
        icon: <CheckCircle size={12} /> 
      },
      'Pending': { 
        label: 'Pending', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
        icon: <Clock size={12} /> 
      },
      'Rejected': { 
        label: 'Rejected', 
        color: 'bg-red-100 text-red-700 border-red-200', 
        icon: <XCircle size={12} /> 
      },
      'Disbursed': { 
        label: 'Disbursed', 
        color: 'bg-blue-100 text-blue-700 border-blue-200', 
        icon: <DollarSign size={12} /> 
      }
    },
    user: {
      'Active': { 
        label: 'Active', 
        color: 'bg-green-100 text-green-700 border-green-200', 
        icon: <CheckCircle size={12} /> 
      },
      'Inactive': { 
        label: 'Inactive', 
        color: 'bg-gray-100 text-gray-700 border-gray-200', 
        icon: <XCircle size={12} /> 
      },
      'Pending': { 
        label: 'Pending', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
        icon: <Clock size={12} /> 
      }
    }
  };

  const typeConfigs = configs[type] || configs.project;
  return typeConfigs[status] || { 
    label: status || 'Unknown', 
    color: 'bg-gray-100 text-gray-700 border-gray-200', 
    icon: <AlertTriangle size={12} /> 
  };
};

// Universal data transformation utilities
export const transformApiResponse = {
  // Standardize API response format
  normalize: (response) => {
    if (!response) return { status: false, data: null, error: 'No response' };
    
    // Handle different response formats
    if (response.status !== undefined) {
      return response;
    }
    
    if (response.data) {
      return { status: true, data: response.data, error: null };
    }
    
    return { status: true, data: response, error: null };
  },

  // Extract data with fallback
  extractData: (response, fallback = null) => {
    const normalized = transformApiResponse.normalize(response);
    return normalized.status ? normalized.data : fallback;
  },

  // Handle pagination responses
  pagination: (response, page = 1, limit = 10) => {
    const data = transformApiResponse.extractData(response, []);
    const total = Array.isArray(data) ? data.length : 0;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: Array.isArray(data) ? data.slice(startIndex, endIndex) : [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: endIndex < total,
        hasPrev: page > 1
      }
    };
  }
};

// Universal formatting utilities
export const formatters = {
  // Currency formatting with options
  currency: (amount, options = {}) => {
    const {
      currency = 'USD',
      locale = 'en-US',
      minimumFractionDigits = 0,
      maximumFractionDigits = 2,
      notation = 'standard' // 'standard' | 'compact'
    } = options;

    if (amount === null || amount === undefined || isNaN(amount)) {
      return '-';
    }

    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
      notation
    });

    return formatter.format(Number(amount));
  },

  // Number formatting
  number: (value, options = {}) => {
    const {
      locale = 'en-US',
      minimumFractionDigits = 0,
      maximumFractionDigits = 2,
      notation = 'standard'
    } = options;

    if (value === null || value === undefined || isNaN(value)) {
      return '-';
    }

    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      notation
    });

    return formatter.format(Number(value));
  },

  // Date formatting
  date: (date, options = {}) => {
    const {
      locale = 'en-US',
      dateStyle = 'medium',
      timeStyle = undefined
    } = options;

    if (!date) return '-';

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '-';

      const formatter = new Intl.DateTimeFormat(locale, {
        dateStyle,
        timeStyle
      });

      return formatter.format(dateObj);
    } catch {
      return '-';
    }
  },

  // Percentage formatting
  percentage: (value, options = {}) => {
    const { maximumFractionDigits = 1 } = options;

    if (value === null || value === undefined || isNaN(value)) {
      return '-';
    }

    return `${Number(value).toFixed(maximumFractionDigits)}%`;
  },

  // Truncate text
  truncate: (text, maxLength = 100, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }
};

// Universal validation utilities
export const validators = {
  required: (value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== '';
  },

  email: (value) => {
    if (!value) return true; // Allow empty for optional fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  minLength: (value, min) => {
    if (!value) return true;
    return value.length >= min;
  },

  maxLength: (value, max) => {
    if (!value) return true;
    return value.length <= max;
  },

  number: (value) => {
    if (!value) return true;
    return !isNaN(Number(value));
  },

  positiveNumber: (value) => {
    if (!value) return true;
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },

  url: (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  date: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
};

// Universal sort utilities
export const sorters = {
  string: (a, b, key, direction = 'asc') => {
    const aVal = String(a[key] || '').toLowerCase();
    const bVal = String(b[key] || '').toLowerCase();
    const result = aVal.localeCompare(bVal);
    return direction === 'asc' ? result : -result;
  },

  number: (a, b, key, direction = 'asc') => {
    const aVal = Number(a[key]) || 0;
    const bVal = Number(b[key]) || 0;
    const result = aVal - bVal;
    return direction === 'asc' ? result : -result;
  },

  date: (a, b, key, direction = 'asc') => {
    const aVal = new Date(a[key]).getTime() || 0;
    const bVal = new Date(b[key]).getTime() || 0;
    const result = aVal - bVal;
    return direction === 'asc' ? result : -result;
  },

  boolean: (a, b, key, direction = 'asc') => {
    const aVal = Boolean(a[key]);
    const bVal = Boolean(b[key]);
    const result = aVal === bVal ? 0 : aVal ? 1 : -1;
    return direction === 'asc' ? result : -result;
  }
};

// Universal filter utilities
export const filters = {
  search: (data, searchTerm, searchFields = []) => {
    if (!searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    
    return data.filter(item => {
      const fieldsToSearch = searchFields.length > 0 ? searchFields : Object.keys(item);
      
      return fieldsToSearch.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      });
    });
  },

  byValue: (data, key, value) => {
    if (!value || value === 'All') return data;
    return data.filter(item => item[key] === value);
  },

  byRange: (data, key, min, max) => {
    return data.filter(item => {
      const value = Number(item[key]);
      if (isNaN(value)) return false;
      if (min !== undefined && value < min) return false;
      if (max !== undefined && value > max) return false;
      return true;
    });
  },

  byDateRange: (data, key, startDate, endDate) => {
    return data.filter(item => {
      const itemDate = new Date(item[key]);
      if (isNaN(itemDate.getTime())) return false;
      
      if (startDate && itemDate < new Date(startDate)) return false;
      if (endDate && itemDate > new Date(endDate)) return false;
      return true;
    });
  }
};

// Universal error handling utilities
export const errorHandlers = {
  api: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  validation: (errors) => {
    if (typeof errors === 'string') return errors;
    if (Array.isArray(errors)) return errors.join(', ');
    if (typeof errors === 'object') {
      return Object.values(errors).join(', ');
    }
    return 'Validation failed';
  },

  network: (error) => {
    if (!navigator.onLine) {
      return 'No internet connection. Please check your network.';
    }
    if (error.code === 'NETWORK_ERROR') {
      return 'Network error. Please try again.';
    }
    return errorHandlers.api(error);
  }
};