import React from 'react';
import AdminFormPage from '../features/admin/AdminFormPage';
import { agencyApi } from '../services/api';

const AgencyFormPage = ({ mode = 'add' }) => {
  const fields = [
    {
      name: 'name',
      label: 'Agency Name',
      type: 'text',
      placeholder: 'Enter agency name',
      required: true,
      className: 'md:col-span-2'
    },
    {
      name: 'type',
      label: 'Agency Type',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Select agency type' },
        { value: 'Implementing', label: 'Implementing' },
        { value: 'Executing', label: 'Executing' },
        { value: 'Accredited', label: 'Accredited' }
      ],
      className: 'md:col-span-1'
    }
  ];

  const defaultFormData = {
    name: '',
    type: ''
  };

  const validationRules = {
    name: {
      required: true,
      minLength: 2
    },
    type: {
      required: true
    }
  };

  const transformSubmitData = (data) => {
    const transformed = {
      name: data.name?.trim(),
      type: data.type
    };
    return transformed;
  };

  const transformLoadData = (data) => {
    const transformed = {
      name: data.name || '',
      type: data.type || ''
    };
    return transformed;
  };

  return (
    <AdminFormPage
      title={mode === 'add' ? 'Add New Agency' : 'Edit Agency'}
      entityName="agency"
      apiService={agencyApi}
      fields={fields}
      defaultFormData={defaultFormData}
      mode={mode}
      validationRules={validationRules}
      transformSubmitData={transformSubmitData}
      transformLoadData={transformLoadData}
      backPath="/admin/agencies"
    />
  );
};

export default AgencyFormPage;
