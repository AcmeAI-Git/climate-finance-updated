import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = true, // Boolean: true = default padding, false = none, or string for custom
  hover = false,
  interactive = false,
  loading = false,
  gradient = false,
  ...props 
}) => {
  const baseStyles = `
    bg-white rounded-2xl shadow-soft 
    transition-all duration-300 ease-out
    relative overflow-hidden
    border border-gray-200
    w-full
  `;

  const hoverStyles = hover || interactive ? `
    hover:shadow-large hover:-translate-y-1
    hover:border-primary-300
    cursor-pointer
    transform
  ` : '';

  const gradientStyles = gradient ? `
    bg-gradient-to-br from-white to-primary-50/30
    border-primary-100
  ` : '';

  // Improved padding logic for better space utilization
  const getPaddingClasses = () => {
    if (padding === false) return '';
    if (typeof padding === 'string') return padding;
    // Default: more conservative padding that adapts better
    return 'p-3 sm:p-4 lg:p-6';
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  ); 

  if (loading) {
    return (
      <div className={`${baseStyles} ${className}`} {...props}>
        <div className={getPaddingClasses()}>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        ${baseStyles} 
        ${hoverStyles}
        ${gradientStyles}
        ${className}
      `} 
      {...props}
    >
      {gradient && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-transparent opacity-50 rounded-full -mr-16 -mt-16"></div>
      )}
      <div className={`relative z-10 w-full overflow-hidden ${getPaddingClasses()}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;