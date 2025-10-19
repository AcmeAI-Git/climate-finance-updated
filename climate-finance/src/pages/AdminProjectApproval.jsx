import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FolderTree } from 'lucide-react';
import PageLayout from '../components/layouts/PageLayout';
import AdminPageHeader from '../components/layouts/AdminPageHeader';
import AdminEmptyState from '../components/layouts/AdminEmptyState';
import AdminListItem from '../components/layouts/AdminListItem';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { pendingProjectApi } from '../services/api';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatters';

const AdminProjectApproval = () => {
  const [pendingProjects, setPendingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const { toast } = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pendingProjectApi.getAll();
      if (response.status) {
        setPendingProjects(response.data);
      } else {
        setError('Failed to fetch pending projects');
      }
    } catch (err) {
      setError('Error loading pending projects');
      console.error('Error fetching pending projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId) => {
    try {
      setProcessingId(projectId);
      
      // Optimistically remove the project immediately
      setPendingProjects(prev => prev.filter(p => p.pending_id !== projectId));
      
      // Make the backend API call to actually approve the project
      const response = await pendingProjectApi.approve(projectId);
      if (response.status) {
        toast({
          title: 'Success',
          message: 'Project approved successfully',
          type: 'success'
        });
      } else {
        // If backend call fails, show error but project is already removed from UI
        toast({
          title: 'Warning',
          message: 'Project approved in UI but backend update failed. Please refresh to see current state.',
          type: 'warning'
        });
      }
      
    } catch (err) {
      // If backend call fails, show error but project is already removed from UI
      toast({
        title: 'Warning',
        message: 'Project approved in UI but backend update failed. Please refresh to see current state.',
        type: 'warning'
      });
      console.error('Error approving project:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (projectId) => {
    try {
      setProcessingId(projectId);
      
      // Optimistically remove the project immediately
      setPendingProjects(prev => prev.filter(p => p.pending_id !== projectId));
      
      // Make the backend API call to actually reject the project
      const response = await pendingProjectApi.reject(projectId);
      if (response.status) {
        toast({
          title: 'Success',
          message: 'Project rejected successfully',
          type: 'success'
        });
      } else {
        // If backend call fails, show error but project is already removed from UI
        toast({
          title: 'Warning',
          message: 'Project rejected in UI but backend update failed. Please refresh to see current state.',
          type: 'warning'
        });
      }
      
    } catch (err) {
      // If backend call fails, show error but project is already removed from UI
      toast({
        title: 'Warning',
        message: 'Project rejected in UI but backend update failed. Please refresh to see current state.',
        type: 'warning'
      });
      console.error('Error rejecting project:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <PageLayout bgColor="bg-gray-50">
        <div className="flex justify-center items-center min-h-64">
          <Loading size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout bgColor="bg-gray-50">
      <AdminPageHeader
        title="Project Approval"
        subtitle="Review and approve pending project submissions"
        onLogout={handleLogout}
      />

      {/* Controls Section - Matching other admin pages */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Pending Projects ({pendingProjects.length})
          </h3>
        </div>
      </div>

      {error && (
        <Card padding="p-6" className="mb-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={fetchPendingProjects}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {pendingProjects.length === 0 ? (
        <Card padding="p-8">
          <AdminEmptyState
            icon={<Clock size={48} className="text-gray-400" />}
            title="No Pending Projects"
            description="All project submissions have been reviewed."
          />
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {pendingProjects.map((project, index) => {
            const dataFields = [
              {
                label: 'Total Cost',
                value: project.total_cost_usd ? formatCurrency(project.total_cost_usd) : 'N/A'
              },
              {
                label: 'GEF Grant',
                value: project.gef_grant ? formatCurrency(project.gef_grant) : 'N/A'
              },
              {
                label: 'Timeline',
                value: project.beginning && project.closing 
                  ? `${formatDate(project.beginning)} - ${formatDate(project.closing)}`
                  : 'N/A'
              },
              {
                label: 'Submitted',
                value: formatDate(project.submitted_at)
              }
            ];

            const customActions = [
              {
                label: processingId === project.pending_id ? 'Approving...' : 'Approve',
                icon: <CheckCircle size={14} />,
                onClick: () => handleApprove(project.pending_id),
                disabled: processingId === project.pending_id,
                className: "text-purple-600 border-purple-300 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition-all duration-200"
              },
              {
                label: processingId === project.pending_id ? 'Rejecting...' : 'Reject',
                icon: <XCircle size={14} />,
                onClick: () => handleReject(project.pending_id),
                disabled: processingId === project.pending_id,
                className: "text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-all duration-200"
              }
            ];

            return (
              <AdminListItem
                key={project.pending_id}
                id={project.pending_id}
                icon={<FolderTree size={20} className="text-purple-600" />}
                title={project.title}
                subtitle={`By: ${project.submitter_email}`}
                badge={
                  <div className="flex flex-wrap gap-1">
                    {project.type && (
                      <Badge variant="info" size="sm">
                        {project.type}
                      </Badge>
                    )}
                    {project.sector && (
                      <Badge variant="success" size="sm">
                        {project.sector}
                      </Badge>
                    )}
                    {project.status && (
                      <Badge variant="warning" size="sm">
                        {project.status}
                      </Badge>
                    )}
                  </div>
                }
                dataFields={dataFields}
                customActions={customActions}
                index={index}
              />
            );
          })}
        </div>
      )}
    </PageLayout>
  );
};

export default AdminProjectApproval; 