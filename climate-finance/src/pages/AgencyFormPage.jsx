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
    }
  ];

  const defaultFormData = {
    name: ''
  };

  const validationRules = {
    name: {
      required: true,
      minLength: 2
    }
  };

  const transformSubmitData = (data) => {
    return {
      name: data.name?.trim()
    };
  };

  const transformLoadData = (data) => {
    return {
      name: data.name || ''
    };
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
