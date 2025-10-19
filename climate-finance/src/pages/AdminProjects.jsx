import React, { useState, useEffect, useMemo } from 'react';
import { FolderTree, CheckCircle } from 'lucide-react';
import AdminListPage from '../features/admin/AdminListPage';
import { projectApi } from '../services/api';
import { getChartTranslation } from '../utils/chartTranslations';

const AdminProjects = () => {
  const [projectsList, setProjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects data for dynamic filters
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await projectApi.getAll();
        if (response?.status && Array.isArray(response.data)) {
          setProjectsList(response.data);
        } else {
          setProjectsList([]);
        }
      } catch (error) {
        console.error('Error fetching projects for filters:', error);
        setProjectsList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const columns = [
    {
      key: 'project_id',
      header: 'Project ID',
      searchKey: 'project_id'
    },
    {
      key: 'title',
      header: 'Title',
      searchKey: 'title'
    },
    {
      key: 'status',
      header: 'Status',
      type: 'status',
      statusType: 'project'
    },
    {
      key: 'total_cost_usd',
      header: 'Total Cost',
      type: 'currency'
    },
    {
      key: 'beginning',
      header: 'Start Date',
      type: 'date'
    },
    {
      key: 'closing',
      header: 'End Date',
      type: 'date'
    }
  ];

  // Generate dynamic filters from actual project data
  const filters = useMemo(() => {
    if (!projectsList || projectsList.length === 0) {
      return [];
    }

    // Create unique option arrays using the actual fields available
    const divisions = Array.from(new Set(projectsList.map(p => p.geographic_division).filter(Boolean))).sort();
    const statuses = Array.from(new Set(projectsList.map(p => p.status).filter(Boolean))).sort();

    return [
      {
        key: 'status',
        defaultValue: 'All',
        options: [
          { value: 'All', label: 'All Status' },
          ...statuses.map(status => ({ value: status, label: status }))
        ]
      },
      {
        key: 'geographic_division',
        defaultValue: 'All',
        options: [
          { value: 'All', label: 'All Divisions' },
          ...divisions.map(division => ({ value: division, label: division }))
        ]
      }
    ];
  }, [projectsList]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>

      <AdminListPage
        title="Project Management"
        subtitle="Add, edit, and manage climate projects"
        apiService={projectApi}
        entityName="project"
        columns={columns}
        searchPlaceholder="Search projects..."
        filters={filters}
      />
    </div>
  );
};

export default AdminProjects;