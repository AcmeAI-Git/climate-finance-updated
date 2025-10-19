import React, { useState, useEffect, useMemo } from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminListPage from '../features/admin/AdminListPage';
import { agencyApi } from '../services/api';

const AdminAgencies = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [agenciesList, setAgenciesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch agencies data for dynamic filters
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setIsLoading(true);
        const response = await agencyApi.getAll();
        if (response?.status && Array.isArray(response.data)) {
          setAgenciesList(response.data);
        } else {
          setAgenciesList([]);
        }
      } catch (error) {
        console.error('Error fetching agencies for filters:', error);
        setAgenciesList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  const columns = [
    {
      key: 'agency_id',
      header: 'Agency ID',
      searchKey: 'agency_id'
    },
    {
      key: 'name',
      header: 'Name',
      searchKey: 'name'
    },
    {
      key: 'type',
      header: 'Type',
      type: 'status',
      statusType: 'agency'
    }
  ];

  // Generate dynamic filters from actual agency data
  const filters = useMemo(() => {
    if (!agenciesList || agenciesList.length === 0) {
      return [];
    }

    // Create unique option arrays using the actual fields available
    const types = Array.from(new Set(agenciesList.map(a => a.type).filter(Boolean))).sort();

    return [
      {
        key: 'type',
        defaultValue: 'All',
        options: [
          { value: 'All', label: 'All Types' },
          ...types.map(type => ({ value: type, label: type }))
        ]
      }
    ];
  }, [agenciesList]);

  const handleAddAgency = () => {
    navigate('/admin/agencies/new');
  };

  const customGetRowActions = (defaultActions) => [
    {
      ...defaultActions[0],
      onClick: (row) => {
        if (!row.agency_id) {
          setError('Error: No agency ID found for this record');
          return;
        }
        navigate(`/admin/agencies/${row.agency_id}/edit`);
      }
    },
    defaultActions[1] // Keep delete action as is
  ];

  const handleError = (errorMessage) => {
    setError(errorMessage);
    console.error('Agency management error:', errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading agency data...</p>
        </div>
      </div>
    );
  }

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
        title="Agencies Management"
        subtitle="Manage implementing and executing agencies"
        apiService={agencyApi}
        entityName="agency"
        columns={columns}
        searchPlaceholder="Search agencies..."
        filters={filters}
        getRowActions={customGetRowActions}
        onAddNew={handleAddAgency}
        onError={handleError}
      />
    </>
  );
};

export default AdminAgencies;