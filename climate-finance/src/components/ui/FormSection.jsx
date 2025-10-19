import React from 'react';
import Input from './Input';

const FormSection = ({
  title,
  subtitle,
  fields = [],
  formData = {},
  onChange,
  errors = {},
  layout = 'grid', // 'grid' | 'single' | 'inline'
  className = ''
}) => {
  const getLayoutClasses = () => {
    switch (layout) {
      case 'single':
        return 'space-y-6';
      case 'inline':
        return 'flex flex-wrap gap-4';
      case 'grid':
      default:
        return 'grid grid-cols-1 md:grid-cols-2 gap-6';
    }
  };

  const getFieldClasses = (field) => {
    if (layout === 'inline') return 'flex-1 min-w-[200px]';
    if (field.fullWidth) return 'md:col-span-2';
    return '';
  };

  return (
    <div className={className}>
      {/* Section Header */}
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      )}

      {/* Fields */}
      <div className={getLayoutClasses()}>
        {fields.map((field, index) => {
          // Handle custom field rendering
          if (field.type === 'custom' && field.render) {
            return (
              <div key={field.name || index} className={getFieldClasses(field)}>
                {field.render(formData, onChange, errors)}
              </div>
            );
          }

          // Handle select options transformation
          const options = field.options || [];
          const transformedOptions = Array.isArray(options) 
            ? options.map(opt => 
                typeof opt === 'string' 
                  ? { value: opt, label: opt }
                  : opt
              )
            : [];

          return (
            <Input
              key={field.name || index}
              label={field.label}
              name={field.name}
              type={field.type || 'text'}
              value={formData[field.name] || ''}
              onChange={onChange}
              placeholder={field.placeholder}
              required={field.required}
              disabled={field.disabled}
              error={errors[field.name]}
              helpText={field.helpText}
              options={transformedOptions}
              rows={field.rows}
              step={field.step}
              min={field.min}
              max={field.max}
              containerClassName={getFieldClasses(field)}
              {...(field.props || {})}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FormSection;