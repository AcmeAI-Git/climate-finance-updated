import React from 'react';
import { useForm } from '../../hooks';
import DataStateWrapper from './DataStateWrapper';
import Form from './Form';

// Universal form wrapper that handles common form patterns
const FormManager = ({
  initialData = {},
  validationRules = {},
  fields = [],
  entityName,
  mode = 'add', // 'add' | 'edit'
  apiService,
  onSuccess,
  transformSubmitData = (data) => data,
  isLoading = false,
  error = null,
  backPath,
  children,
  ...formProps
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    isDirty,
    handleChange,
    handleMultiSelectChange,
    handleSubmit,
    resetForm,
    setFieldValue
  } = useForm(initialData, validationRules, {
    transformSubmitData,
    onSubmit: async (data) => {
      if (mode === 'edit') {
        await apiService.update(data.id, data);
      } else {
        await apiService.create(data);
      }
      onSuccess?.(data, mode);
    }
  });

  const isEditMode = mode === 'edit';

  return (
    <DataStateWrapper
      isLoading={isLoading}
      error={error && isEditMode ? error : null}
      data={isEditMode ? formData : true}
    >
      <Form
        title={`${isEditMode ? 'Edit' : 'Add'} ${entityName?.charAt(0).toUpperCase() + entityName?.slice(1) || 'Item'}`}
        subtitle={isEditMode ? `Update ${entityName} information` : `Add a new ${entityName} to the system`}
        backPath={backPath}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitText={isEditMode ? 'Update' : 'Create'}
        {...formProps}
      >
        {children || (
          fields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              value={formData[field.name] || ''}
              onChange={handleChange}
              error={errors[field.name]}
            />
          ))
        )}
        
        {/* Form context for custom fields */}
        {typeof children === 'function' && children({
          formData,
          errors,
          handleChange,
          handleMultiSelectChange,
          setFieldValue,
          isDirty,
          resetForm
        })}
      </Form>
    </DataStateWrapper>
  );
};

export default FormManager;