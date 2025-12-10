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
    {
      name: 'type',
      label: 'Category',
      type: 'select',
      placeholder: 'Select funding source category',
      required: true,
      options: [
        { value: 'UNFCCC', label: 'UNFCCC Climate Funds' },
        { value: 'Multilateral/Bilateral', label: 'Multilateral/Bilateral' },
        { value: 'Domestic', label: 'Domestic Fund' },
      ],
      className: 'md:col-span-2'
    },
    // Note: grant_amount, loan_amount, counterpart_funding are now
    // calculated automatically from linked projects - not editable here
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

  const transformSubmitData = (data) => ({
    name: data.name?.trim(),
    type: data.type || null
  });

  const transformLoadData = (data) => ({
    name: data.name || '',
    type: data.type || ''
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
