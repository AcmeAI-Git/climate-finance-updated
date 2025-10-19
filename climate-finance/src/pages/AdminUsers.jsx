import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'lucide-react';
import AdminListPage from '../features/admin/AdminListPage';
import { authApi } from '../services/api';
import Badge from '../components/ui/Badge';
import { getStatusConfig } from '../utils/statusConfig';

const AdminUsers = () => {
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users data for dynamic filters
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await authApi.getAll();
        if (response?.status && Array.isArray(response.data)) {
          setUsersList(response.data);
        } else {
          setUsersList([]);
        }
      } catch (error) {
        console.error('Error fetching users for filters:', error);
        setUsersList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    {
      key: 'username',
      header: 'Username',
      searchKey: 'username'
    },
    {
      key: 'email',
      header: 'Email',
      searchKey: 'email'
    },
    {
      key: 'role',
      header: 'Role',
      render: (value) => {
        const config = getStatusConfig(value, 'user');
        return <Badge variant="custom" className={config.color} icon={config.icon}>{config.label}</Badge>;
      }
    },
    {
      key: 'department',
      header: 'Department',
      searchKey: 'department'
    },
    {
      key: 'active',
      header: 'Status',
      render: (value) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  // Generate dynamic filters from actual user data
  const filters = useMemo(() => {
    if (!usersList || usersList.length === 0) {
      return [];
    }

    // Create unique option arrays using the actual fields available
    const roles = Array.from(new Set(usersList.map(u => u.role).filter(Boolean))).sort();
    const departments = Array.from(new Set(usersList.map(u => u.department).filter(Boolean))).sort();

    return [
      {
        key: 'role',
        defaultValue: 'All',
        options: [
          { value: 'All', label: 'All Roles' },
          ...roles.map(role => ({ value: role, label: role }))
        ]
      },
      {
        key: 'department',
        defaultValue: 'All',
        options: [
          { value: 'All', label: 'All Departments' },
          ...departments.map(dept => ({ value: dept, label: dept }))
        ]
      }
    ];
  }, [usersList]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminListPage
      title="User Management"
      subtitle="Manage admin users and permissions"
      apiService={authApi}
      entityName="user"
      columns={columns}
      searchPlaceholder="Search users..."
      filters={filters}
    />
  );
};

export default AdminUsers;