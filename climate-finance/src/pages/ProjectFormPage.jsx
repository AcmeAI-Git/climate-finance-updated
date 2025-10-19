import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { agencyApi, fundingSourceApi, projectApi, pendingProjectApi } from '../services/api';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Card from '../components/ui/Card';
import PageLayout from '../components/layouts/PageLayout';
import ProjectFormSections from '../features/admin/ProjectFormSections';
import { ArrowLeft, FolderTree, CheckCircle } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

const defaultFormData = {
  project_id: '',
  title: '',
  status: '',
  total_cost_usd: '',
  gef_grant: '',
  cofinancing: '',
  beginning: '',
  closing: '',
  approval_fy: '',
  beneficiaries: '',
  objectives: '',
  agencies: [],
  funding_sources: [],
  wash_component: {
    presence: false,
    water_supply_percent: 0,
    sanitation_percent: 0,
    public_admin_percent: 0
  },
  submitter_email: '', // Added for public mode
  
  // New fields for client requirements
  hotspot_vulnerability_type: '',
  wash_component_description: '',
  direct_beneficiaries: '',
  indirect_beneficiaries: '',
  beneficiary_description: '',
  gender_inclusion: '',
  equity_marker: '',
  equity_marker_description: '',
  assessment: '',
  alignment_sdg: [],
  alignment_nap: '',
  alignment_cff: '',
  geographic_division: '',
  districts: []
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 10);
};


const ProjectFormPage = ({
  mode = 'add',
  pageTitle,
  pageSubtitle
}) => {
  const { id } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [fundingSources, setFundingSources] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Determine mode based on params, authentication, and URL query
  const urlParams = new URLSearchParams(location.search);
  const urlMode = urlParams.get('mode');
  
  let actualMode = mode;
  if (id) {
    actualMode = 'edit';
  } else if (urlMode === 'public') {
    actualMode = 'public';
  } else if (!isAuthenticated) {
    actualMode = 'public';
  } else if (mode === 'add') {
    actualMode = 'add';
  }

  // Fetch project data for edit mode
  useEffect(() => {
    if (actualMode === 'edit' && id) {
      fetchProject();
    }
  }, [actualMode, id]);

  // Fetch all required data from APIs
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchProject = async () => {
    try {
      setIsFetching(true);
      setError(null);
      const response = await projectApi.getById(id);
      if (response.status && response.data) {
        const projectData = response.data;
        setFormData({
          project_id: projectData.project_id,
          title: projectData.title,
          status: projectData.status,
          total_cost_usd: projectData.total_cost_usd,
          gef_grant: projectData.gef_grant,
          cofinancing: projectData.cofinancing,
          beginning: formatDateForInput(projectData.beginning),
          closing: formatDateForInput(projectData.closing),
          approval_fy: projectData.approval_fy,
          beneficiaries: projectData.beneficiaries || '',
          objectives: projectData.objectives || '',
          agencies: projectData.agencies || [],
          funding_sources: projectData.funding_sources || [],
          wash_component: projectData.wash_component || {
            presence: false,
            water_supply_percent: 0,
            sanitation_percent: 0,
            public_admin_percent: 0
          },
          submitter_email: projectData.submitter_email || '',
          geographic_division: projectData.geographic_division || '',
          districts: projectData.districts || []
        });
      } else {
        throw new Error('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project data');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setIsLoadingData(true);
      
      // Fetch all data in parallel
      const [agenciesResponse, fundingSourcesResponse] = await Promise.all([
        agencyApi.getAll().catch(() => ({ status: false, data: [] })),
        fundingSourceApi.getAll().catch(() => ({ status: false, data: [] }))
      ]);

      // Set data or fallback to empty arrays if API calls fail
      setAgencies(agenciesResponse.status && agenciesResponse.data ? agenciesResponse.data : []);
      setFundingSources(fundingSourcesResponse.status && fundingSourcesResponse.data ? fundingSourcesResponse.data : []);
      
    } catch (error) {
      console.error('Error fetching form data:', error);
      // Set empty arrays as fallback
      setAgencies([]);
      setFundingSources([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMultiSelectChange = (e, field) => {
    const selectedValues = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
    setFormData(prev => ({
      ...prev,
      [field]: selectedValues
    }));
  };

  const handleWashComponentChange = (washData) => {
    setFormData(prev => ({
      ...prev,
      wash_component: typeof washData === 'function' ? washData(prev.wash_component) : washData
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }


    if (!formData.geographic_division) {
      newErrors.geographic_division = 'Geographic division is required';
    }

    if (!formData.districts || formData.districts.length === 0) {
      newErrors.districts = 'At least one district must be selected';
    }

    if (!formData.status) {
      newErrors.status = 'Project status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Additional validation for public mode
    if (actualMode === 'public') {
      if (!formData.submitter_email.trim()) {
        setErrors(prev => ({ ...prev, submitter_email: 'Email is required for public submissions' }));
        return;
      }
      if (!formData.submitter_email.includes('@')) {
        setErrors(prev => ({ ...prev, submitter_email: 'Please enter a valid email address' }));
        return;
      }
      if (!formData.objectives.trim()) {
        setErrors(prev => ({ ...prev, objectives: 'Project objectives are required' }));
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const totalCost = parseFloat(formData.total_cost_usd) || 0;
      const gefGrant = parseFloat(formData.gef_grant) || 0;
      const cofinancing = parseFloat(formData.cofinancing) || 0;
      
      // Calculate WASH finance based on WASH component presence and total cost
      const washFinance = formData.wash_component.presence 
        ? totalCost * (
            (formData.wash_component.water_supply_percent || 0) + 
            (formData.wash_component.sanitation_percent || 0) + 
            (formData.wash_component.public_admin_percent || 0)
          ) / 100
        : 0;
      
      // Calculate WASH finance percentage
      const washFinancePercent = totalCost > 0 ? (washFinance / totalCost) * 100 : 0;

      // Create clean project data object
      const projectData = {
        title: formData.title,
        status: formData.status,
        total_cost_usd: totalCost,
        gef_grant: gefGrant,
        cofinancing: cofinancing,
        beginning: formData.beginning,
        closing: formData.closing,
        approval_fy: parseInt(formData.approval_fy) || new Date().getFullYear(),
        beneficiaries: formData.beneficiaries,
        objectives: formData.objectives,
        wash_finance: washFinance,
        wash_finance_percent: washFinancePercent,
        wash_component: {
          presence: formData.wash_component.presence,
          wash_percentage: formData.wash_component.wash_percentage || 0,
          description: formData.wash_component_description || ''
        },
        // Transform relationship arrays to match backend expectations
        agency_ids: formData.agencies || [],
        funding_source_ids: formData.funding_sources || [],
        focal_area_ids: formData.focal_areas || [],
        submitter_email: formData.submitter_email,
        // New geographic location fields
        geographic_division: formData.geographic_division,
        districts: formData.districts || [],
        // New fields for client requirements
        hotspot_vulnerability_type: formData.hotspot_vulnerability_type,
        wash_component_description: formData.wash_component_description,
        direct_beneficiaries: parseInt(formData.direct_beneficiaries) || 0,
        indirect_beneficiaries: parseInt(formData.indirect_beneficiaries) || 0,
        beneficiary_description: formData.beneficiary_description,
        gender_inclusion: formData.gender_inclusion,
        equity_marker: formData.equity_marker,
        equity_marker_description: formData.equity_marker_description,
        assessment: formData.assessment,
        alignment_sdg: formData.alignment_sdg || [],
        alignment_nap: formData.alignment_nap,
        alignment_cff: formData.alignment_cff
      };

      if (actualMode === 'public') {
        // Submit to pending projects for public mode
        const response = await pendingProjectApi.submit(projectData);
        if (response.status) {
          setSuccess(true);
          toast({
            title: 'Success',
            message: 'Project submitted successfully! It will be visible once approved by an administrator.',
            type: 'success'
          });
        } else {
          throw new Error(response.message || 'Failed to submit project');
        }
      } else if (actualMode === 'add') {
        await projectApi.add(projectData);
        navigate('/admin/projects');
      } else {
        await projectApi.update(id, projectData);
        navigate('/admin/projects');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setError(error.message || 'Failed to save project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData || isFetching) {
    return (
      <PageLayout bgColor="bg-gray-50">
        <div className="flex justify-center items-center min-h-64">
          <Loading size="lg" />
        </div>
      </PageLayout>
    );
  }

  // Success state for public mode
  if (success && actualMode === 'public') {
    return (
      <PageLayout bgColor="bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <Card padding="p-8">
            <div className="text-center">
              <CheckCircle size={64} className="mx-auto text-green-600 mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Project Submitted Successfully!
              </h1>
              <p className="text-gray-600 mb-6">
                Thank you for submitting your project. It has been received and will be reviewed by our administrators. 
                You will be notified at <strong>{formData.submitter_email}</strong> once the review is complete.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>What happens next?</strong><br />
                  • Your project will be reviewed by our team<br />
                  • We may contact you for additional information<br />
                  • Once approved, your project will be visible on our platform
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate(location.state?.from || '/')}
                leftIcon={<ArrowLeft size={16} />}
              >
                Back to Previous Page
              </Button>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (error && actualMode === 'edit') {
    return (
      <PageLayout bgColor="bg-gray-50">
        <Card padding={true}>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <FolderTree size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
            <p className="text-gray-500 mb-4">
              The project you're looking for could not be found.
            </p>
            <Button onClick={() => navigate('/admin/projects')} variant="primary">
              Back to Projects
            </Button>
          </div>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout bgColor="bg-gray-50" maxWidth="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(location.state?.from || (actualMode === 'public' ? '/' : '/admin/projects'))}
            leftIcon={<ArrowLeft size={16} />}
            className="text-purple-600 hover:text-purple-700"
          >
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {pageTitle || (actualMode === 'public' ? 'Submit a Project' : actualMode === 'add' ? 'Add New Project' : 'Edit Project')}
            </h2>
            <p className="text-gray-500">
              {pageSubtitle || (actualMode === 'public' ? 'Share your climate finance project with our community. All submissions are reviewed by administrators before being published.' : actualMode === 'add' ? 'Create a new climate finance project' : `Update project details${formData.title ? ` for ${formData.title}` : ''}`)}
            </p>
          </div>
        </div>
      </div>

      {/* Info Message for Public Mode */}
      {actualMode === 'public' && (
        <Card padding="p-6" className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Important:</strong> All project submissions require administrator approval before being published. 
              You will be notified via email once your project has been reviewed.
            </p>
          </div>
        </Card>
      )}

      {/* Form Card */}
      <Card padding={true} className="max-w-none">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title field - one column */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
              
              {/* Project ID: Only show in edit mode */}
              {actualMode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project ID</label>
                  <input
                    type="text"
                    name="project_id"
                    value={formData.project_id}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    disabled
                    readOnly
                  />
                  <p className="mt-1 text-xs text-gray-500">Project ID cannot be changed</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.status ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Suspended">Suspended</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
              </div>
            </div>
          </div>

          <ProjectFormSections
            formData={formData}
            handleInputChange={handleInputChange}
            handleMultiSelectChange={handleMultiSelectChange}
            handleWashComponentChange={handleWashComponentChange}
            agencies={agencies}
            fundingSources={fundingSources}
          />

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Cost (USD)</label>
                <input
                  type="number"
                  name="total_cost_usd"
                  value={formData.total_cost_usd}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GEF Grant (USD)</label>
                <input
                  type="number"
                  name="gef_grant"
                  value={formData.gef_grant}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Co-financing (USD)</label>
                <input
                  type="number"
                  name="cofinancing"
                  value={formData.cofinancing}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  step="0.01"
                  min="0"
                />
              </div>
              
              {/* Disbursement field - Only show in edit mode */}
              {actualMode === 'edit' && (
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Disbursement (USD)
                    <span className="text-sm text-gray-500 ml-1">(Amount already disbursed from funding sources)</span>
                  </label>
                  <input
                    type="number"
                    name="disbursement"
                    value={formData.disbursement || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    step="0.01"
                    min="0"
                    placeholder="Enter disbursed amount..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This field tracks the actual amount disbursed from the funding sources for this project.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Beginning Date</label>
                <input
                  type="date"
                  name="beginning"
                  value={formatDateForInput(formData.beginning)}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Closing Date</label>
                <input
                  type="date"
                  name="closing"
                  value={formatDateForInput(formData.closing)}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Approval FY</label>
                <input
                  type="number"
                  name="approval_fy"
                  value={formData.approval_fy}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  min="2000"
                  max="2030"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Objectives</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Objectives {actualMode === 'public' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleInputChange}
                  rows={3}
                  className={`mt-1 block w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.objectives ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required={actualMode === 'public'}
                />
                {errors.objectives && (
                  <p className="mt-1 text-sm text-red-600">{errors.objectives}</p>
                )}
              </div>
              
              {/* Email field for public mode */}
              {actualMode === 'public' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="submitter_email"
                    value={formData.submitter_email}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.submitter_email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    We'll notify you when your project is reviewed
                  </p>
                  {errors.submitter_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.submitter_email}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Climate Relevance */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Climate Relevance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Climate Relevance Score (%)
                </label>
                <input
                  type="number"
                  name="climate_relevance_score"
                  value={formData.climate_relevance_score || ''}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="0-100"
                />
              </div>
              
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Relevance Category
                </label>
                <select
                  name="climate_relevance_category"
                  value={formData.climate_relevance_category || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Category</option>
                  <option value="High">High</option>
                  <option value="Moderate-High">Moderate-High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Moderate-Low">Moderate-Low</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            
            {/* Justification */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Climate Relevance Justification
              </label>
              <textarea
                name="climate_relevance_justification"
                value={formData.climate_relevance_justification || ''}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Explain the climate relevance score and category..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              onClick={() => navigate(location.state?.from || (actualMode === 'public' ? '/' : '/admin/projects'))}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg hover:shadow-purple-200 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading 
                ? (actualMode === 'public' ? 'Submitting...' : actualMode === 'add' ? 'Creating...' : 'Updating...') 
                : (actualMode === 'public' ? 'Submit Project' : actualMode === 'add' ? 'Create Project' : 'Update Project')
              }
            </Button>
          </div>
        </form>
      </Card>
    </PageLayout>
  );
};

export default ProjectFormPage;
