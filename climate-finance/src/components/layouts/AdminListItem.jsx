import React from 'react';
import Button from '../ui/Button';
import { Edit, Trash2 } from 'lucide-react';

const AdminListItem = ({ 
  id,
  icon,
  title,
  subtitle,
  badge,
  dataFields,
  onEdit,
  onDelete,
  customActions = [],
  index = 0,
  isInactive = false
}) => {
  return (
    <div 
      className={`p-6 hover:bg-purple-50 transition-all duration-200 group animate-fade-in-up border border-gray-200 rounded-lg ${isInactive ? 'opacity-60' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        {/* Left Section: Icon, Title, and Badge */}
        <div className="flex items-center justify-between xl:justify-start flex-wrap gap-4 min-w-0 xl:w-[300px]">
          {/* Icon and Title */}
          <div className="flex items-center min-w-0 flex-1 xl:flex-initial">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <div className="ml-4 min-w-0">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                {title}
              </div>
              {subtitle && (
                <div className="text-sm text-gray-500 mt-0.5">{subtitle}</div>
              )}
            </div>
          </div>
          
          {/* Badge Section */}
          {badge && (
            <div className="flex-shrink-0 mt-2 xl:mt-0">
              {badge}
            </div>
          )}
        </div>
        
        {/* Middle Section: Data Fields */}
        {dataFields && dataFields.length > 0 && (
          <div className="flex-1 min-w-0 flex justify-center xl:justify-center">
            <div className={`grid gap-x-6 gap-y-4 ${
              dataFields.length === 1 
                ? 'grid-cols-1 max-w-xs text-center'
                : dataFields.length <= 2 
                ? 'grid-cols-1 sm:grid-cols-2 max-w-md'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {dataFields.map((field, idx) => (
                <div key={idx} className={`min-w-0 ${dataFields.length === 1 ? 'text-center' : 'text-center xl:text-left'}`}>
                  <p className="text-xs text-gray-500 font-medium mb-1.5 tracking-wide">
                    {field.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 leading-tight break-words" title={field.value}>
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Right Section: Actions */}
        <div className="flex flex-wrap gap-2 flex-shrink-0 xl:ml-4 justify-start xl:justify-end">
          {onEdit && (
            <Button
              onClick={() => onEdit(id)}
              size="sm"
              variant="outline"
              leftIcon={<Edit size={14} />}
              className="text-purple-600 border-purple-300 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition-all duration-200"
            >
              Edit
            </Button>
          )}
          
          {customActions.map((action, idx) => (
            <Button
              key={idx}
              onClick={() => action.onClick(id)}
              size="sm"
              variant="outline"
              leftIcon={action.icon}
              className={action.className || "text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all duration-200"}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
          
          {onDelete && (
            <Button
              onClick={() => onDelete(id)}
              size="sm"
              variant="outline"
              leftIcon={<Trash2 size={14} />}
              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-all duration-200"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminListItem;