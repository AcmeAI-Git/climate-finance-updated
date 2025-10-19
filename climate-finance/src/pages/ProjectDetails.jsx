import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Building,
  CheckCircle,
  TrendingUp,
  Droplets
} from 'lucide-react';
import PageLayout from '../components/layouts/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ExportButton from '../components/ui/ExportButton';
import Loading from '../components/ui/Loading';
import ProgressBar from '../components/ui/ProgressBar';
import FinancialSummaryCard from '../components/ui/FinancialSummaryCard';
import { formatCurrency } from '../utils/formatters';
import { projectApi } from '../services/api';

const ProjectDetails = () => {
  const { id, projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const actualId = id || projectId;

  const fetchProjectWithRelatedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const projectResponse = await projectApi.getById(actualId);
      if (!projectResponse?.status || !projectResponse.data) {
        setError('Project not found');
        return;
      }

      const projectData = projectResponse.data;

      // Since mock data already contains complete objects, use them directly
      const enrichedProject = {
        ...projectData,
        projectAgencies: projectData.agencies || [],
        projectLocations: projectData.locations || [],
        projectFundingSources: projectData.funding_sources || [],
      };

      setProject(enrichedProject);
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.message || 'Error loading project data');
    } finally {
      setLoading(false);
    }
  }, [actualId]);

  useEffect(() => {
    if (actualId) {
      fetchProjectWithRelatedData();
    } else {
      setError('No project ID provided');
      setLoading(false);
    }
  }, [actualId, fetchProjectWithRelatedData]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchProjectWithRelatedData();
  };

  if (loading) {
    return (
      <PageLayout bgColor="bg-gray-50">
        <div className="flex flex-col justify-center items-center min-h-64">
          <Loading size="lg" />
          <p className="mt-4 text-gray-600">Loading project details...</p>
          {retryCount > 0 && (
            <p className="mt-2 text-sm text-gray-500">Retry attempt: {retryCount}</p>
          )}
        </div>
      </PageLayout>
    );
  }

  if (error || !project) {
    return (
      <PageLayout bgColor="bg-gray-50">
        <Card padding={true}>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <AlertCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Project Not Found'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {error === 'No project ID provided' 
                ? 'Invalid project ID provided in the URL.'
                : 'The project you\'re looking for doesn\'t exist or couldn\'t be loaded.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleRetry}
                leftIcon={<RefreshCw size={16} />}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Retry
              </Button>
              <Button
                onClick={() => navigate('/projects')}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back to Projects
              </Button>
            </div>
            {retryCount > 2 && (
              <p className="mt-4 text-sm text-gray-500">
                If the problem persists, please contact the system administrator.
              </p>
            )}
          </div>
        </Card>
      </PageLayout>
    );
  }

  const getTimeline = (proj) => {
    if (proj.beginning && proj.closing) {
      return `${new Date(proj.beginning).toLocaleDateString()} - ${new Date(proj.closing).toLocaleDateString()}`;
    }
    return proj.timeline || 'Not specified';
  };

  const getLocation = (proj) => {
    if (Array.isArray(proj.projectLocations) && proj.projectLocations.length > 0) {
      return proj.projectLocations.map(loc => loc.name).join(', ');
    }
    return proj.location || 'Not specified';
  };

  const getTotalBudget = (proj) => {
    return proj.total_cost_usd || proj.totalFunding || proj.totalBudget || 0;
  };


  const exportData = {
    projectId: project?.project_id,
    title: project?.title,
    status: project?.status,
    description: project?.objectives,
    totalBudget: getTotalBudget(project),
    location: getLocation(project),
    timeline: getTimeline(project),
    beneficiaries: project?.beneficiaries,
    agencies: project?.projectAgencies?.map(a => a.name) || [],
    fundingSources: project?.projectFundingSources?.map(f => f.name) || []
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Planning': return 'bg-yellow-100 text-yellow-700';
      case 'On Hold': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <PageLayout bgColor="bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            to="/projects"
            className="flex items-center text-purple-600 hover:text-purple-700 transition-colors group"
          >
            <ArrowLeft
              size={18}
              className="mr-2 group-hover:-translate-x-1 transition-transform"
            />
            Back to Projects
          </Link>
        </div>

        {/* Main Project Card - Fixed Typography & Colors */}
        <Card className="mb-6" padding="p-4 sm:p-6">
          {/* Top Bar: Status, ID, Export */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              <span className="text-sm text-gray-500 font-medium">#{project.project_id}</span>
            </div>
            <ExportButton
              data={exportData}
              filename={`${project.project_id}_report`}
              title={`${project.title} - Project Report`}
              subtitle={`Generated on ${new Date().toLocaleDateString()}`}
              variant="primary"
              size="sm"
              className="bg-primary-600 hover:bg-primary-700 text-white"
              exportFormats={['pdf', 'json', 'csv']}
            />
          </div>

          {/* Title and Description */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
              {project.title || 'Untitled Project'}
            </h1>
            <p className="text-base text-gray-600 leading-relaxed">
              {project.objectives || project.description || 'No description available'}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Total Budget</div>
              <div className="text-base sm:text-lg font-bold text-gray-900">{formatCurrency(getTotalBudget(project))}</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Grant</div>
              <div className="text-base sm:text-lg font-bold text-success-600">{formatCurrency(project.gef_grant || 0)}</div>
            </div>
            
          </div>


          {/* Timeline and Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
            <div>
              <span className="font-semibold text-gray-800">Timeline:</span>
              <span className="text-gray-600 ml-2">{getTimeline(project)}</span>
            </div>
            
            {project.approval_fy && (
              <div>
                <span className="font-semibold text-gray-800">Approval FY:</span>
                <span className="text-gray-600 ml-2">{project.approval_fy}</span>
              </div>
            )}
            
            {project.beneficiaries && (
              <div>
                <span className="font-semibold text-gray-800">Beneficiaries:</span>
                <span className="text-gray-600 ml-2">{project.beneficiaries}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Secondary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Agencies */}
          <Card padding="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementing Agencies</h3>
            {Array.isArray(project.projectAgencies) && project.projectAgencies.length > 0 ? (
              <div className="space-y-3">
                {project.projectAgencies.slice(0, 4).map((agency, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-900">{agency.name}</div>
                    <div className="text-sm text-gray-500 font-medium">{agency.type}</div>
                  </div>
                ))}
                {project.projectAgencies.length > 4 && (
                  <div className="text-sm text-gray-500 text-center font-medium">
                    +{project.projectAgencies.length - 4} more agencies
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building size={24} className="mx-auto mb-2" />
                <p className="font-medium">No agencies data</p>
              </div>
            )}
          </Card>

          {/* Funding Sources */}
          <Card padding="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Sources</h3>
            {Array.isArray(project.projectFundingSources) && project.projectFundingSources.length > 0 ? (
              <div className="space-y-3">
                {project.projectFundingSources.slice(0, 4).map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100">
                    <div className="font-medium text-gray-900">{source.name}</div>
                    <div className="text-sm text-primary-700 font-medium">{source.dev_partner}</div>
                  </div>
                ))}
                {project.projectFundingSources.length > 4 && (
                  <div className="text-sm text-gray-500 text-center font-medium">
                    +{project.projectFundingSources.length - 4} more sources
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign size={24} className="mx-auto mb-2" />
                <p className="font-medium">No funding sources</p>
              </div>
            )}
          </Card>

        </div>


        {/* WASH Component and Financial Summary - Side by Side */}
        <div className={`grid grid-cols-1 ${project.wash_component?.presence ? 'lg:grid-cols-2' : ''} gap-6 mb-6`}>
          {/* WASH Component */}
          {project.wash_component?.presence && (
            <Card padding="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">WASH Component</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg border border-primary-100">
                  <div className="text-sm text-gray-600 font-medium mb-1">WASH Percentage</div>
                  <div className="text-2xl font-bold text-primary-700">
                    {project.wash_component.wash_percentage || 0}%
                  </div>
                </div>
                {project.wash_component.description && (
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-1">Description</div>
                    <div className="text-sm text-gray-700">{project.wash_component.description}</div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Financial Summary */}
          <Card padding="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="text-center p-4 bg-primary-50 rounded-lg border border-primary-100">
                <div className="text-sm text-gray-600 font-medium mb-2">Total Cost</div>
                <div className="text-xl font-bold text-primary-700">
                  {formatCurrency(getTotalBudget(project))}
                </div>
              </div>
              <div className="text-center p-4 bg-success-50 rounded-lg border border-success-100">
                <div className="text-sm text-gray-600 font-medium mb-2">Grant</div>
                <div className="text-xl font-bold text-success-700">
                  {formatCurrency(project.gef_grant || 0)}
                </div>
              </div>
              <div className="text-center p-4 bg-warning-50 rounded-lg border border-warning-100">
                <div className="text-sm text-gray-600 font-medium mb-2">Co-financing</div>
                <div className="text-xl font-bold text-warning-700">
                  {formatCurrency(project.cofinancing || 0)}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* New Project Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Beneficiaries and Vulnerability */}
          <Card padding="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Beneficiaries & Vulnerability</h3>
            <div className="space-y-4">
              {project.direct_beneficiaries && (
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">Direct Beneficiaries</div>
                  <div className="text-lg font-semibold text-gray-900">{project.direct_beneficiaries.toLocaleString()}</div>
                </div>
              )}
              {project.indirect_beneficiaries && (
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">Indirect Beneficiaries</div>
                  <div className="text-lg font-semibold text-gray-900">{project.indirect_beneficiaries.toLocaleString()}</div>
                </div>
              )}
              {project.hotspot_vulnerability_type && (
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">Vulnerability Type</div>
                  <div className="text-sm text-gray-700">{project.hotspot_vulnerability_type}</div>
                </div>
              )}
              {project.beneficiary_description && (
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">Beneficiary Description</div>
                  <div className="text-sm text-gray-700">{project.beneficiary_description}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Gender & Equity */}
          <Card padding="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender & Equity</h3>
            <div className="space-y-4">
              {project.gender_inclusion && (
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">Gender Inclusion</div>
                  <div className="text-sm text-gray-700">{project.gender_inclusion}</div>
                </div>
              )}
              {project.equity_marker && (
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">Equity Marker</div>
                  <div className="text-sm text-gray-700 capitalize">{project.equity_marker}</div>
                </div>
              )}
              {project.equity_marker_description && (
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">Equity Description</div>
                  <div className="text-sm text-gray-700">{project.equity_marker_description}</div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Geographic Information and Alignment - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Geographic Information */}
          {(project.geographic_division || (project.districts && project.districts.length > 0)) && (
            <Card padding="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Information</h3>
              <div className="space-y-4">
                {project.geographic_division && (
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-1">Division</div>
                    <div className="text-sm text-gray-700">{project.geographic_division}</div>
                  </div>
                )}
                {project.districts && project.districts.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-1">Districts</div>
                    <div className="flex flex-wrap gap-1">
                      {project.districts.map((district, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium"
                        >
                          {district}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Alignment */}
          <Card padding="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alignment</h3>
            <div className="space-y-3">
              {project.alignment_nap && (
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">NAP Alignment</div>
                  <div className="text-sm text-gray-700">{project.alignment_nap}</div>
                </div>
              )}
              {project.alignment_cff && (
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">CFF Alignment</div>
                  <div className="text-sm text-gray-700">{project.alignment_cff}</div>
                </div>
              )}
              {project.alignment_sdg && project.alignment_sdg.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">SDG Alignment</div>
                  <div className="flex flex-wrap gap-1">
                    {project.alignment_sdg.map((sdg, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium"
                      >
                        SDG {sdg}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Climate Relevance */}
        {(project.climate_relevance_score || project.climate_relevance_category || project.climate_relevance_justification) && (
          <Card padding="p-4 sm:p-6" className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Climate Relevance</h3>
            <div className="space-y-4">
              {project.climate_relevance_score && (
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-2">Climate Relevance Score</div>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-blue-600">{project.climate_relevance_score}%</div>
                    {project.climate_relevance_category && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        project.climate_relevance_category === 'High' ? 'bg-green-100 text-green-800' :
                        project.climate_relevance_category === 'Moderate-High' ? 'bg-blue-100 text-blue-800' :
                        project.climate_relevance_category === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                        project.climate_relevance_category === 'Moderate-Low' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {project.climate_relevance_category}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {project.climate_relevance_justification && (
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">Justification</div>
                  <div className="text-sm text-gray-700">{project.climate_relevance_justification}</div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Assessment - Full Width at End */}
        {project.assessment && (
          <Card padding="p-4 sm:p-6" className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment</h3>
            <div className="text-sm text-gray-700">{project.assessment}</div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default ProjectDetails;

