import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';

const StatCard = ({ title, value, change, icon = null, color = 'primary', locale = 'en-US', currency = 'USD' }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const isPositive = change.startsWith('+');
  const isNumericValue = typeof value === 'number' || (!isNaN(parseFloat(value)) && !value.toString().includes('$'));
  
  const changeColorClass = isPositive 
    ? 'text-success-600 bg-success-50' 
    : 'text-error-600 bg-error-50';

  const colorVariants = {
    primary: 'text-primary-600 bg-primary-50',
    success: 'text-success-600 bg-success-50',
    warning: 'text-warning-600 bg-warning-50',
    error: 'text-error-600 bg-error-50',
  };

  const iconColorVariants = {
    primary: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
  };

  // Helper function to clone icon with color classes
  const renderIconWithColor = (iconElement) => {
    if (!iconElement) return null;
    
    // Get the color value for inline styles as fallback - using actual Tailwind values
    const colorMap = {
      primary: '#7C65C1', // primary-600 from your config
      success: '#059669', // success-600 
      warning: '#D97706', // warning-600
      error: '#DC2626',   // error-600
    };
    
    // If it's a React element, clone it with both className and style
    if (React.isValidElement(iconElement)) {
      return React.cloneElement(iconElement, {
        className: `${iconElement.props.className || ''} ${iconColorVariants[color]}`.trim(),
        style: { 
          color: colorMap[color],
          stroke: 'currentColor',
          ...iconElement.props.style 
        }
      });
    }
    
    // Fallback: wrap in span with both class and inline style
    return (
      <span 
        className={iconColorVariants[color]}
        style={{ color: colorMap[color] }}
      >
        {iconElement}
      </span>
    );
  };

  // Animation for numeric values
  useEffect(() => {
    if (isNumericValue && typeof value === 'number') {
      const timer = setTimeout(() => {
        setIsVisible(true);
        const duration = 1500;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        
        const counter = setInterval(() => {
          current += increment;
          if (current >= value) {
            setAnimatedValue(value);
            clearInterval(counter);
          } else {
            setAnimatedValue(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(counter);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
      setAnimatedValue(value);
    }
  }, [value, isNumericValue]);

  const formatDisplayValue = (val) => {
    if (typeof val === 'number') {
      // Check if the value looks like currency (has decimal places or is large)
      const isCurrency = val % 1 !== 0 || val >= 1000;
      
      if (isCurrency) {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(val);
      } else {
        return new Intl.NumberFormat(locale).format(val);
      }
    }
    return val;
  };

  return (
    <Card 
      hover 
      className={`
        group
        h-full min-h-[140px]
        ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
        transition-all duration-300
      `}
      padding={true}
    >
      <div className="flex flex-col h-full text-center">
        {/* Icon and Title - Centered */}
        <div className="flex flex-col items-center mb-4">
          {icon && (
            <div className={`
              p-2 rounded-xl 
              ${colorVariants[color]}
              group-hover:scale-110 
              transition-transform duration-300
              mb-2
            `}>
              {renderIconWithColor(icon)}
            </div>
          )}
          <p className="text-gray-600 text-sm font-medium leading-tight text-center">{title}</p>
        </div>
        
        {/* Value - Centered and taking available space */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <h3 className="text-3xl font-bold text-gray-900 tracking-tight text-center" translate="no">
            {formatDisplayValue(animatedValue)}
          </h3>
        </div>
        
        {/* Change indicator - Centered at bottom */}
        <div className="flex justify-center">
          <div className={`
            inline-flex items-center gap-1 px-3 py-1.5 
            rounded-full text-xs font-semibold
            ${changeColorClass}
          `}>
            {isPositive ? (
              <TrendingUp size={12} className="text-success-600" />
            ) : (
              <TrendingDown size={12} className="text-error-600" />
            )}
            <span className="leading-none">{change}</span>
          </div>
        </div>
        
        {/* Progress indicator for percentage values */}
        {change.includes('%') && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`
                  h-1.5 rounded-full transition-all duration-1000 ease-out
                  ${isPositive ? 'bg-success-500' : 'bg-error-500'}
                `}
                style={{ 
                  width: `${Math.min(parseFloat(change.match(/(\d+(?:\.\d+)?)%/)?.[1] || 0), 100)}%`,
                  transitionDelay: '500ms'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;