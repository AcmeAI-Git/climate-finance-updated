import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import PageLayout from '../../components/layouts/PageLayout';
import AdminPageHeader from '../../components/layouts/AdminPageHeader';
import DataTable from '../../components/ui/DataTable';
import ErrorState from '../../components/ui/ErrorState';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { getStatusConfig } from '../../utils/statusConfig';
import SearchFilter from '../../components/ui/SearchFilter';

const AdminListPage = ({
  title,
  subtitle,
  apiService,
  entityName, // 'project', 'agency', etc.
  columns,
  searchPlaceholder = 'Search...',
  filters = [],
  getRowActions = () => [],
  onRowClick = null,
  additionalFilters = null,
  customEmptyState = null,
  onAddNew = null // Add this prop
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState(
    filters.reduce((acc, filter) => ({ ...acc, [filter.key]: filter.defaultValue || 'All' }), {})
  );
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  // Create custom config for SearchFilter
  const customConfig = useMemo(() => {
    if (!filters || filters.length === 0) {
      return {
        searchFields: columns.map(col => ({ key: col.searchKey || col.key, label: col.header, weight: 1 })),
        filters: []
      };
    }

    return {
      searchFields: columns.map(col => ({ key: col.searchKey || col.key, label: col.header, weight: 1 })),
      filters: filters
    };
  }, [filters, columns]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAll();
      
      // Handle different API response formats
      if (response.status) {
        // All APIs now return: { status: true, data: [...] }
        if (Array.isArray(response.data)) {
          setData(response.data);
          setFilteredData(response.data);
        } else {
          console.warn('No data received from API or invalid format:', response);
          setData([]);
          setFilteredData([]);
        }
      } else if (Array.isArray(response)) {
        // Fallback for direct array response
        setData(response);
        setFilteredData(response);
      } else {
        console.warn('No data received from API or invalid format:', response);
        setData([]);
        setFilteredData([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || `Failed to fetch ${entityName}s`);
      setData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  // Handle search changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handle delete
  const handleDelete = async (item) => {
    try {
      // Handle different ID field names for different entities
      const id = item.id || item[`${entityName}_id`] || item.project_id || item.agency_id || item.location_id || item.focal_area_id || item.funding_source_id;
      await apiService.delete(id);
      await fetchData();
      setDeleteModal({ isOpen: false, item: null });
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Prepare table columns with status rendering
  const tableColumns = columns.map(col => {
    // If column already has a custom render function, preserve it
    if (col.render) {
      return col;
    }
    
    // Otherwise, apply default rendering based on type
    return {
      ...col,
      render: (value) => {
        if (col.type === 'status') {
          const config = getStatusConfig(value, col.statusType || 'project');
          return <Badge variant="custom" className={config.color} icon={config.icon}>{config.label}</Badge>;
        }
        if (col.type === 'currency') {
          return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 0 
          }).format(value);
        }
        if (col.type === 'date') {
          return value ? new Date(value).toLocaleDateString() : '-';
        }
        return value || '-';
      }
    };
  });

  // Prepare table actions
  const defaultActions = [
    {
      label: 'Edit',
      icon: <Edit size={14} />,
      variant: 'outline',
      onClick: (row) => {
        let id;
        if (entityName === 'agency') {
          id = row.agency_id;
        } else if (entityName === 'project') {
          id = row.project_id;
        } else if (entityName === 'location') {
          id = row.location_id;
        } else if (entityName === 'funding-source') {
          id = row.funding_source_id;
        } else if (entityName === 'focal-area') {
          id = row.focal_area_id;
        } else if (entityName === 'user') {
          id = row.id;
        } else {
          id = row.id || row[`${entityName}_id`];
        }
        if (!id) {
          alert(`Cannot edit ${entityName}: No valid ID found`);
          return;
        }
        navigate(`/admin/${entityName}s/${id}/edit`);
      }
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      variant: 'outline',
      onClick: (row) => setDeleteModal({ isOpen: true, item: row }),
      className: 'text-red-600 border-red-300 hover:bg-red-50'
    }
  ];

  // If getRowActions is provided and returns actions, use those; otherwise use defaultActions
  const customActions = getRowActions(defaultActions);
  const tableActions = customActions.length > 0 ? customActions : defaultActions;

  if (isLoading) {
    return (
      <PageLayout bgColor="bg-gray-50">
        <div className="flex justify-center items-center min-h-64">
          <Loading size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout bgColor="bg-gray-50">
        <ErrorState
          title={`Failed to load ${entityName}s`}
          message={error}
          onRefresh={fetchData}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout bgColor="bg-gray-50">
      <AdminPageHeader 
        title={title}
        subtitle={subtitle}
        onLogout={logout}
      />

      {/* Controls */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            All {title} ({filteredData.length})
          </h3>
          <Button 
            onClick={onAddNew || (() => navigate(`/admin/${entityName}s/new`))}
            variant="primary"
            leftIcon={<Plus size={16} />}
            className="bg-purple-600 hover:bg-purple-700 text-white mt-4 md:mt-0"
          >
            Add {entityName.charAt(0).toUpperCase() + entityName.slice(1)}
          </Button>
        </div>

        <SearchFilter
          data={data}
          onFilteredData={setFilteredData}
          searchValue={searchTerm}
          onSearchChange={handleSearchChange}
          searchPlaceholder={searchPlaceholder}
          customConfig={customConfig}
          activeFilters={activeFilters}
          onFiltersChange={handleFilterChange}
          className="mb-4"
        />

        {additionalFilters}
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={tableColumns}
        actions={tableActions}
        searchable={false} // We handle search above
        onRowClick={onRowClick}
        emptyState={customEmptyState || (
          <ErrorState
            type="empty"
            title={`No ${entityName}s found`}
            message={`No ${entityName}s match your search criteria.`}
            showRefresh={false}
          />
        )}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={() => handleDelete(deleteModal.item)}
        title={`Delete ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`}
        message={`Are you sure you want to delete this ${entityName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </PageLayout>
  );
};

export default AdminListPage;