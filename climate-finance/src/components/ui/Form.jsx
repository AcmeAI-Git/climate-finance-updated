import React from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const Form = ({
  title,
  subtitle,
  backPath,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText = 'Save',
  cancelText = 'Cancel',
  children,
  className = '',
  showHeader = true,
  showBackButton = true, // Fix: Add showBackButton prop
  layout = 'single' // 'single' | 'grid' | 'sections'
}) => {
  const navigate = useNavigate();

  const layoutClasses = {
    single: 'space-y-6',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    sections: 'space-y-8'
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (backPath) {
      navigate(backPath);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="mb-8">
          {backPath && showBackButton && ( // Fix: Only show back button if showBackButton is true
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(backPath)}
              className="mb-4 text-gray-600 hover:text-gray-800"
            >
              Back
            </Button>
          )}
          
          {title && (
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          )}
          
          {subtitle && (
            <p className="text-gray-600 text-lg">{subtitle}</p>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className={layoutClasses[layout]}>
          {children}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            leftIcon={<X size={16} />}
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save size={16} />}
            loading={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {submitText}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Form;