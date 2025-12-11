import React from 'react';
import AdminFormPage from '../features/admin/AdminFormPage';
import { deliveryPartnerApi } from '../services/api';

const DeliveryPartnerFormPage = ({ mode = 'add' }) => {
  const fields = [
    {
      name: 'name',
      label: 'Delivery Partner Name',
      type: 'text',
      placeholder: 'Enter delivery partner name',
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

  const transformSubmitData = (data) => ({
    name: data.name?.trim()
  });

  const transformLoadData = (data) => ({
    name: data.name || ''
  });

  return (
    <AdminFormPage
      title={mode === 'add' ? 'Add New Delivery Partner' : 'Edit Delivery Partner'}
      entityName="delivery-partner"
      apiService={deliveryPartnerApi}
      fields={fields}
      defaultFormData={defaultFormData}
      mode={mode}
      validationRules={validationRules}
      transformSubmitData={transformSubmitData}
      transformLoadData={transformLoadData}
      backPath="/admin/delivery-partners"
    />
  );
};

export default DeliveryPartnerFormPage;

