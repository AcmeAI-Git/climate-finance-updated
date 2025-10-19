import React from 'react';

const Skeleton = ({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'rounded', // 'rounded' | 'circular' | 'rectangular'
  animation = 'pulse', // 'pulse' | 'wave' | 'none'
  lines = 1,
  spacing = '0.5rem'
}) => {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    rounded: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could be enhanced with wave animation
    none: ''
  };

  if (lines === 1) {
    return (
      <div
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${animationClasses[animation]}
          ${className}
        `}
        style={{ width, height }}
      />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            ${baseClasses}
            ${variantClasses[variant]}
            ${animationClasses[animation]}
            ${className}
          `}
          style={{
            width: index === lines - 1 ? '75%' : width,
            height,
            marginBottom: index === lines - 1 ? 0 : spacing
          }}
        />
      ))}
    </div>
  );
};

// Preset skeleton components for common use cases
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <Skeleton lines={lines} height="1rem" className={className} />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
    <Skeleton height="1.5rem" width="60%" className="mb-3" />
    <SkeletonText lines={2} />
    <div className="flex gap-2 mt-4">
      <Skeleton height="2rem" width="4rem" variant="rounded" />
      <Skeleton height="2rem" width="4rem" variant="rounded" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {/* Header */}
    <div className="flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} height="1rem" width="8rem" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} height="1rem" width="8rem" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <Skeleton
      variant="circular"
      className={`${sizes[size]} ${className}`}
    />
  );
};

export default Skeleton;