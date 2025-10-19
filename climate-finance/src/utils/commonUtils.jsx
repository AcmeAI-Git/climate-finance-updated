// Function to validate required props
export const validateRequiredProps = (props, required, componentName) => {
  const missing = required.filter(prop => props[prop] === undefined);
  if (missing.length > 0) {
    console.warn(`${componentName}: Missing required props: ${missing.join(', ')}`);
  }
};

// Function to clean object props (remove undefined/null)
export const cleanProps = (props) => {
  return Object.fromEntries(
    Object.entries(props).filter((entry) => entry[1] !== undefined && entry[1] !== null)
  );
};

// Function to safely access nested object properties
export const safeGet = (obj, path, defaultValue = null) => {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// Function to debounce API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Function to format error messages consistently
export const formatErrorMessage = (error, fallback = 'An unexpected error occurred') => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return fallback;
}; 