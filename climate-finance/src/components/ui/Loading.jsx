import React from 'react';

const Loading = ({ 
  type = 'spinner', 
  size = 'md', 
  color = 'primary',
  text = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'text-primary-600',
    gray: 'text-gray-400',
    white: 'text-white',
  };

  const Spinner = () => (
    <div className="flex flex-col items-center gap-3">
      <svg 
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
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
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
    </div>
  );

  const Dots = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`
              ${sizeClasses[size]} rounded-full
              ${colorClasses[color] === 'text-primary-600' ? 'bg-primary-600' : 'bg-gray-400'}
              animate-bounce
            `}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
    </div>
  );

  const Pulse = () => (
    <div className="flex flex-col items-center gap-3">
      <div className={`
        ${sizeClasses[size]} rounded-full
        ${colorClasses[color] === 'text-primary-600' ? 'bg-primary-600' : 'bg-gray-400'}
        animate-pulse-soft
      `} />
      {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
    </div>
  );

  const Skeleton = () => (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      case 'skeleton':
        return <Skeleton />;
      default:
        return <Spinner />;
    }
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          {renderLoader()}
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{renderLoader()}</div>;
};

export default Loading;
