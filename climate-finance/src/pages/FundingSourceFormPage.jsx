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
      name: 'dev_partner',
      label: 'Development Partner',
      type: 'text',
      placeholder: 'Enter development partner',
      required: true,
      className: 'md:col-span-1'
    },
    {
      name: 'grant_amount',
      label: 'Grant Amount (USD)',
      type: 'number',
      placeholder: '0.00',
      step: '0.01',
      min: '0',
      className: 'md:col-span-1'
    },
    {
      name: 'loan_amount',
      label: 'Loan Amount (USD)',
      type: 'number',
      placeholder: '0.00',
      step: '0.01',
      min: '0',
      className: 'md:col-span-1'
    },
    {
      name: 'counterpart_funding',
      label: 'Counterpart Funding (USD)',
      type: 'number',
      placeholder: '0.00',
      step: '0.01',
      min: '0',
      className: 'md:col-span-1'
    },
  ];

  const defaultFormData = {
    name: '',
    dev_partner: '',
    grant_amount: '',
    loan_amount: '',
    counterpart_funding: ''
  };

  const validationRules = {
    name: {
      required: true,
      minLength: 2
    },
    dev_partner: {
      required: true,
      minLength: 2
    },
    grant_amount: {
      min: 0
    },
    loan_amount: {
      min: 0
    },
    counterpart_funding: {
      min: 0
    },
    disbursement: {
      min: 0
    }
  };

  const transformSubmitData = (data) => ({
    name: data.name?.trim(),
    dev_partner: data.dev_partner?.trim(),
    grant_amount: parseFloat(data.grant_amount) || 0,
    loan_amount: parseFloat(data.loan_amount) || 0,
    counterpart_funding: parseFloat(data.counterpart_funding) || 0,
    disbursement: parseFloat(data.disbursement) || 0,
    non_grant_instrument: data.non_grant_instrument?.trim() || null
  });

  const transformLoadData = (data) => ({
    name: data.name || '',
    dev_partner: data.dev_partner || '',
    grant_amount: data.grant_amount || '',
    loan_amount: data.loan_amount || '',
    counterpart_funding: data.counterpart_funding || '',
    disbursement: data.disbursement || '',
    non_grant_instrument: data.non_grant_instrument || ''
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
