import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon = null,
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-purple-100 text-purple-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    // Status-specific variants
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    // Type-specific variants
    adaptation: 'bg-blue-100 text-blue-800',
    mitigation: 'bg-green-100 text-green-800',
    crosscutting: 'bg-purple-100 text-purple-800',
    // Funding type variants
    multilateral: 'bg-blue-100 text-blue-800',
    bilateral: 'bg-green-100 text-green-800',
    private: 'bg-purple-100 text-purple-800',
    climatefund: 'bg-yellow-100 text-yellow-800'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const baseStyles = `
    inline-flex items-center font-semibold rounded-full
    transition-all duration-200 hover:shadow-sm
  `;

  return (
    <span
      className={`
        ${baseStyles}
        ${variants[variant] || variants.default}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;