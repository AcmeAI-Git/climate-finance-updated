import React from 'react';
import AdminFormPage from '../features/admin/AdminFormPage';
import { fundingSourceApi } from '../services/api';

const FundingSourceFormPage = ({ mode = 'add' }) => {
  const fields = [
    {
      name: 'name',
      label: 'Funding Source Name',
      type: 'text',
      placeholder: 'Enter funding source name',
      required: true,
      className: 'md:col-span-2'
    },
    // Note: grant_amount, loan_amount, counterpart_funding are now
    // calculated automatically from linked projects - not editable here
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

  const transformSubmitData = (data) => ({
    name: data.name?.trim()
  });

  const transformLoadData = (data) => ({
    name: data.name || ''
  });

  return (
    <AdminFormPage
      title={mode === 'add' ? 'Add New Funding Source' : 'Edit Funding Source'}
      entityName="funding-source"
      apiService={fundingSourceApi}
      fields={fields}
      defaultFormData={defaultFormData}
      mode={mode}
      validationRules={validationRules}
      transformSubmitData={transformSubmitData}
      transformLoadData={transformLoadData}
      backPath="/admin/funding-sources"
    />
  );
};

export default FundingSourceFormPage;
