import React from 'react';
import AdminFormPage from '../features/admin/AdminFormPage';
import { locationApi } from '../services/api';

const LocationFormPage = ({ mode = 'add' }) => {
  const fields = [
    {
      name: 'name',
      label: 'Location Name',
      type: 'text',
      placeholder: 'Enter location name',
      required: true,
      className: 'md:col-span-1'
    },
    {
      name: 'region',
      label: 'Region',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Select division' },
        { value: 'Dhaka Division', label: 'Dhaka Division' },
        { value: 'Chattogram Division', label: 'Chattogram Division' },
        { value: 'Khulna Division', label: 'Khulna Division' },
        { value: 'Barisal Division', label: 'Barisal Division' },
        { value: 'Sylhet Division', label: 'Sylhet Division' },
        { value: 'Rajshahi Division', label: 'Rajshahi Division' },
        { value: 'Rangpur Division', label: 'Rangpur Division' },
        { value: 'Mymensingh Division', label: 'Mymensingh Division' }
      ],
      className: 'md:col-span-1'
    }
  ];

  const defaultFormData = {
    name: '',
    region: ''
  };

  const validationRules = {
    name: {
      required: true,
      minLength: 2
    },
    region: {
      required: true
    }
  };

  const transformSubmitData = (data) => ({
    name: data.name?.trim(),
    region: data.region
  });

  const transformLoadData = (data) => ({
    name: data.name || '',
    region: data.region || ''
  });

  return (
    <AdminFormPage
      title={mode === 'add' ? 'Add New Location' : 'Edit Location'}
      entityName="location"
      apiService={locationApi}
      fields={fields}
      defaultFormData={defaultFormData}
      mode={mode}
      validationRules={validationRules}
      transformSubmitData={transformSubmitData}
      transformLoadData={transformLoadData}
      backPath="/admin/locations"
    />
  );
};

export default LocationFormPage;