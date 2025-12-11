import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminListPage from '../features/admin/AdminListPage';
import { deliveryPartnerApi } from '../services/api';

const AdminDeliveryPartners = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const columns = [
    {
      key: 'id',
      header: 'Partner ID',
      searchKey: 'id'
    },
    {
      key: 'name',
      header: 'Name',
      searchKey: 'name'
    }
  ];

  const handleAddDeliveryPartner = () => {
    navigate('/admin/delivery-partners/new');
  };

  const customGetRowActions = (defaultActions) => [
    {
      ...defaultActions[0],
      onClick: (row) => {
        if (!row.id) {
          setError('Error: No delivery partner ID found for this record');
          return;
        }
        navigate(`/admin/delivery-partners/${row.id}/edit`);
      }
    },
    defaultActions[1] // Keep delete action as is
  ];

  const handleError = (errorMessage) => {
    setError(errorMessage);
    console.error('Delivery partner management error:', errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle size={20} className="text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <button 
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <AdminListPage
        title="Delivery Partners Management"
        subtitle="Manage delivery partners"
        apiService={deliveryPartnerApi}
        entityName="delivery-partner"
        columns={columns}
        searchPlaceholder="Search delivery partners..."
        filters={[]}
        getRowActions={customGetRowActions}
        onAddNew={handleAddDeliveryPartner}
        onError={handleError}
      />
    </>
  );
};

export default AdminDeliveryPartners;

