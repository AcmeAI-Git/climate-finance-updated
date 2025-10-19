import React from 'react';
import { MapPin } from 'lucide-react';
import AdminListPage from '../features/admin/AdminListPage';
import { locationApi } from '../services/api';
import Badge from '../components/ui/Badge';
import { getStatusConfig } from '../utils/statusConfig';

const AdminLocations = () => {
  const columns = [
    {
      key: 'location_id',
      header: 'Location ID',
      searchKey: 'location_id'
    },
    {
      key: 'name',
      header: 'Name',
      searchKey: 'name'
    },
    {
      key: 'region',
      header: 'Region',
      render: (value) => {
        const config = getStatusConfig(value, 'region');
        return <Badge variant="custom" className={config.color}>{config.label}</Badge>;
      }
    }
  ];

  const filters = [
    {
      key: 'region',
      defaultValue: 'All',
      options: [
        { value: 'All', label: 'All Regions' },
        { value: 'Central', label: 'Central' },
        { value: 'Northeast', label: 'Northeast' },
        { value: 'Northwest', label: 'Northwest' },
        { value: 'Southwest', label: 'Southwest' },
        { value: 'Southeast', label: 'Southeast' },
        { value: 'Chattogram', label: 'Chattogram' }
      ]
    }
  ];

  return (
    <AdminListPage
      title="Locations Management"
      subtitle="Manage project locations and regions"
      apiService={locationApi}
      entityName="location"
      columns={columns}
      searchPlaceholder="Search locations..."
      filters={filters}
    />
  );
};

export default AdminLocations;