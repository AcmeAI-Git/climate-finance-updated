import React from 'react';
import { MapPin, Building, Tag, DollarSign, Calendar, Users } from 'lucide-react';
import Badge from './Badge';

const InfoGrid = ({
  items = [],
  columns = 2, // 1 | 2 | 3 | 4
  gap = 'md', // 'sm' | 'md' | 'lg'
  variant = 'default', // 'default' | 'cards' | 'compact'
  className = ''
}) => {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  const renderItem = (item, index) => {
    switch (variant) {
      case 'cards':
        return (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              {item.icon && <div className="text-purple-600">{item.icon}</div>}
              <div className="flex-1">
                <div className="font-medium text-sm">{item.label}</div>
                {item.value && <div className="text-xs text-gray-600 mt-0.5">{item.value}</div>}
              </div>
              {item.badge && <Badge variant={item.badgeVariant}>{item.badge}</Badge>}
            </div>
          </div>
        );
      
      case 'compact':
        return (
          <div key={index} className="flex items-start gap-2">
            {item.icon && <div className="mt-0.5 text-purple-600">{item.icon}</div>}
            <div className="min-w-0">
              <span className="font-semibold text-sm">{item.label}</span>
              {item.value && <div className="text-xs text-gray-600">{item.value}</div>}
            </div>
          </div>
        );
      
      default:
        return (
          <div key={index} className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {item.icon && <div className="text-purple-600">{item.icon}</div>}
              <span className="text-sm text-gray-600">{item.label}:</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
              {item.badge && <Badge variant={item.badgeVariant} size="sm" className="ml-2">{item.badge}</Badge>}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {items.map(renderItem)}
    </div>
  );
};

// Common icon mappings for consistent usage
export const getInfoIcon = (type) => {
  const iconMap = {
    location: <MapPin size={16} />,
    agency: <Building size={16} />,
    tag: <Tag size={16} />,
    money: <DollarSign size={16} />,
    date: <Calendar size={16} />,
    people: <Users size={16} />
  };
  return iconMap[type] || null;
};

export default InfoGrid;