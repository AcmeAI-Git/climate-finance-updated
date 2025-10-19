import React from 'react';
import { User } from 'lucide-react';
import AdminFormPage from '../features/admin/AdminFormPage';
import { authApi } from '../services/api';

const UserFormPage = ({ mode = 'add' }) => {
  const fields = [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      placeholder: 'Enter username',
      required: true,
      className: 'md:col-span-1'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter email address',
      required: true,
      className: 'md:col-span-1'
    },
    {
      name: 'role',
      label: 'User Role',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Select role' },
        { value: 'Super Admin', label: 'Super Admin (Full Access)' },
        { value: 'Project Manager', label: 'Admin (Basic Access)' },
        { value: 'Finance Admin', label: 'Admin (Basic Access)' },
        { value: 'Data Manager', label: 'Admin (Basic Access)' }
      ],
      className: 'md:col-span-1'
    },
    {
      name: 'department',
      label: 'Department',
      type: 'text',
      placeholder: 'Enter department',
      required: true,
      className: 'md:col-span-1'
    },
    {
      name: 'password',
      label: mode === 'edit' ? 'New Password (leave blank to keep current)' : 'Password',
      type: 'password',
      placeholder: mode === 'edit' ? 'Enter new password (optional)' : 'Enter password',
      required: mode === 'add',
      helpText: 'Password must be at least 8 characters long',
      className: 'md:col-span-1'
    },
    {
      name: 'active',
      label: 'Active User',
      type: 'checkbox',
      helpText: 'Uncheck to deactivate user account',
      className: 'md:col-span-1'
    }
  ];

  const defaultFormData = {
    username: '',
    email: '',
    role: '',
    department: '',
    active: true,
    password: ''
  };

  const validationRules = {
    username: {
      required: true,
      minLength: 3
    },
    email: {
      required: true,
      email: true
    },
    role: {
      required: true
    },
    department: {
      required: true
    },
    password: {
      required: mode === 'add',
      minLength: mode === 'add' ? 8 : 0
    }
  };

  const transformSubmitData = (data) => {
    const userData = {
      username: data.username?.trim(),
      email: data.email?.trim(),
      role: data.role,
      department: data.department?.trim(),
      active: data.active
    };

    // Only include password if it's provided
    if (data.password) {
      userData.password = data.password;
    }

    return userData;
  };

  const transformLoadData = (data) => ({
    username: data.username || '',
    email: data.email || '',
    role: data.role || '',
    department: data.department || '',
    active: data.active !== undefined ? data.active : true,
    password: '' // Don't pre-fill password for security
  });

  return (
    <AdminFormPage
      title={mode === 'add' ? 'Add New User' : 'Edit User'}
      entityName="user"
      apiService={authApi}
      fields={fields}
      defaultFormData={defaultFormData}
      mode={mode}
      validationRules={validationRules}
      transformSubmitData={transformSubmitData}
      transformLoadData={transformLoadData}
    />
  );
};

export default UserFormPage;
