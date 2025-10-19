import React from 'react';
import { AlertCircle } from 'lucide-react';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  options = [],
  multiple = false,
  rows = 3,
  disabled = false,
  helpText,
  className = '',
  ...props
}) => {
  const baseInputClasses = `
    w-full px-3 py-2 border rounded-lg transition-all duration-200
    focus:ring-2 focus:ring-purple-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
  `;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={baseInputClasses}
            {...props}
          />
        );

      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            multiple={multiple}
            className={baseInputClasses}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center h-11 px-3 py-2">
            <div className="relative">
              <input
                id={name}
                name={name}
                type="checkbox"
                checked={value || false}
                onChange={onChange}
                disabled={disabled}
                className="sr-only"
                {...props}
              />
              <div 
                className={`
                  w-11 h-6 rounded-full cursor-pointer transition-all duration-200 ease-in-out
                  ${value 
                    ? 'bg-purple-600 shadow-md' 
                    : 'bg-gray-200 hover:bg-gray-300'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !disabled && onChange({ target: { name, type: 'checkbox', checked: !value } })}
              >
                <div 
                  className={`
                    w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out
                    ${value ? 'translate-x-5' : 'translate-x-0.5'}
                  `}
                >
                </div>
              </div>
            </div>
            <span 
              className={`ml-3 text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'} cursor-pointer`}
              onClick={() => !disabled && onChange({ target: { name, type: 'checkbox', checked: !value } })}
            >
              {value ? 'Active' : 'Inactive'}
            </span>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${name}-${option.value}`}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  disabled={disabled}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  {...props}
                />
                <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-gray-900">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            id={name}
            name={name}
            type="file"
            onChange={onChange}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border rounded-lg transition-all duration-200
              file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
              file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100
              ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
            `}
            {...props}
          />
        );

      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={baseInputClasses}
            {...props}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center h-11 px-3 py-2">
          <div className="relative">
            <input
              id={name}
              name={name}
              type="checkbox"
              checked={value || false}
              onChange={onChange}
              disabled={disabled}
              className="sr-only"
              {...props}
            />
            <div 
              className={`
                w-11 h-6 rounded-full cursor-pointer transition-all duration-200 ease-in-out
                ${value 
                  ? 'bg-purple-600 shadow-md' 
                  : 'bg-gray-200 hover:bg-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !disabled && onChange({ target: { name, type: 'checkbox', checked: !value } })}
            >
              <div 
                className={`
                  w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out
                  ${value ? 'translate-x-5' : 'translate-x-0.5'}
                `}
              >
              </div>
            </div>
          </div>
          <span 
            className={`ml-3 text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'} cursor-pointer`}
            onClick={() => !disabled && onChange({ target: { name, type: 'checkbox', checked: !value } })}
          >
            {value ? 'Active' : 'Inactive'}
          </span>
        </div>
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
        {error && (
          <div className="mt-1 flex items-center gap-1 text-red-600">
            <AlertCircle size={14} />
            <span className="text-xs">{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
      
      {error && (
        <div className="mt-1 flex items-center gap-1 text-red-600">
          <AlertCircle size={14} />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;