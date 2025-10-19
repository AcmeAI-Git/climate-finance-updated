import React from 'react';

const Button = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  ...props 
}) => {
  const baseStyles = `
    inline-flex items-center justify-center 
    rounded-xl font-medium 
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    active:scale-95 transform
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    relative overflow-hidden
    select-none
  `;
  
  const variantStyles = {    
    primary: `
      bg-purple-600 hover:bg-purple-700 
      text-white shadow-lg hover:shadow-xl
      focus:ring-purple-200 focus:ring-4
      border-0
    `,
    export: `
      bg-gradient-to-r from-purple-600 to-purple-700
      hover:from-purple-700 hover:to-purple-800
      text-white shadow-medium hover:shadow-large hover:shadow-purple-200/50
      focus:ring-purple-200
      transition-all duration-200
      hover:scale-105 active:scale-95
    `,
    secondary: `
      bg-white border-2 border-gray-200
      hover:border-purple-300 hover:bg-purple-50
      text-gray-700 hover:text-purple-700
      shadow-soft hover:shadow-medium
      focus:ring-purple-200
    `,    
    outline: `
      border-2 border-purple-500 bg-transparent
      hover:bg-purple-50 hover:border-purple-600
      text-purple-600 hover:text-purple-700
      focus:ring-purple-200
      shadow-none hover:shadow-medium
      transition-all duration-200
    `,
    ghost: `
      bg-transparent border-none
      hover:bg-purple-50 hover:text-purple-700
      text-gray-600 
      focus:ring-purple-200
      shadow-none
    `,
    danger: `
      bg-red-500 hover:bg-red-600
      text-white shadow-medium hover:shadow-large
      focus:ring-red-200
    `,
    success: `
      bg-green-500 hover:bg-green-600
      text-white shadow-medium hover:shadow-large
      focus:ring-green-200
    `,
  };
  
  const sizeStyles = {
    xs: 'py-1.5 px-3 text-xs gap-1',
    sm: 'py-2 px-4 text-sm gap-2',
    md: 'py-2.5 px-6 text-base gap-2',
    lg: 'py-3 px-8 text-lg gap-3',
    xl: 'py-4 px-10 text-xl gap-3',
  };

  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
  
  return (
    <button 
      className={`
        ${baseStyles} 
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span className="flex-1">{children}</span>
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;