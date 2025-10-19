// Import mock data service for fallback
import { 
  projectService, 
  agencyService, 
  fundingSourceService, 
  authService, 
  getOverviewStats 
} from './mockDataService.js';

// Helper function to create API response format (for mock data fallback)
const createResponse = (data, message = 'Success') => ({
  status: true,
  message,
  data
});

// Helper function to check if mock data exists for an endpoint
const hasMockDataForEndpoint = (endpoint) => {
  const mockEndpoints = [
    '/project/all-project',
    '/project/get/',
    '/project/projectsOverviewStats',
    '/project/get-project-by-status',
    '/project/get-project-by-trend',
    '/project/get-regional-distribution',
    '/project/get-overview-stat',
    '/project/add-project',
    '/project/update/',
    '/project/delete/',
    '/agency/all',
    '/agency/get/',
    '/funding-source/all',
    '/funding-source/get/',
    '/project/get-funding-source-by-type',
    '/project/get-funding-source-overview',
    '/project/get-funding-source-trend',
    '/project/get-funding-source',
    '/auth/login'
  ];
  
  return mockEndpoints.some(mockEndpoint => endpoint.includes(mockEndpoint));
};

// Helper function to check if backend response contains actual data
const hasData = (responseData) => {
  if (!responseData || !responseData.status) return false;
  
  const data = responseData.data;
  if (!data) return false;
  
  // Check if it's an array with items
  if (Array.isArray(data)) {
    return data.length > 0;
  }
  
  // Check if it's an object with meaningful content
  if (typeof data === 'object') {
    return Object.keys(data).length > 0;
  }
  
  // Check if it's a primitive value that's not null/undefined
  return data !== null && data !== undefined;
};

// Base API configuration
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://climate-finance.onrender.com';
// const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

// Environment configuration
const USE_BACKEND_ONLY = import.meta.env.VITE_USE_BACKEND_ONLY === 'true';

// Mock data fallback control - ENABLED for development (no database yet)
const ENABLE_MOCK_FALLBACK = true;

// Generic API request function with mock data first, then backend fallback
const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}/api${endpoint}`;
  
  // If USE_BACKEND_ONLY is true, skip mock data entirely
  if (USE_BACKEND_ONLY) {
    return await makeBackendRequest(url, endpoint, options);
  }
  
  // Check if mock data exists for this endpoint
  if (ENABLE_MOCK_FALLBACK && hasMockDataForEndpoint(endpoint)) {
    try {
      // Get mock data first
      const mockData = await getMockDataForEndpoint(endpoint, options);
      
      // Check if backend is available and has data
      try {
        const backendData = await makeBackendRequest(url, endpoint, options);
        
        // If backend has actual data, use it instead of mock
        if (hasData(backendData)) {
          console.log(`Backend has data for ${endpoint}, using backend data`);
          return backendData;
        }
      } catch (backendError) {
        // Backend not available or has no data, use mock
        console.log(`Backend unavailable for ${endpoint}, using mock data:`, backendError.message);
      }
      
      // Use mock data
      return mockData;
    } catch (mockError) {
      console.error(`Mock data failed for ${endpoint}:`, mockError.message);
      // Fallback to backend attempt
      return await makeBackendRequest(url, endpoint, options);
    }
  }
  
  // For endpoints without mock data, try backend directly
  return await makeBackendRequest(url, endpoint, options);
};

// Helper function to make backend requests
const makeBackendRequest = async (url, endpoint, options = {}) => {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: controller.signal,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Clear timeout if request completes successfully
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status message
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Clear timeout on error
    clearTimeout(timeoutId);
    throw error;
  }
};

// Helper function to get mock data based on endpoint
const getMockDataForEndpoint = async (endpoint, options = {}) => {
  // Project endpoints
  if (endpoint.includes('/project/all-project')) {
    return projectService.getAll();
  }
  if (endpoint.includes('/project/get/')) {
    const id = endpoint.split('/').pop();
    return projectService.getById(id);
  }
  if (endpoint.includes('/project/projectsOverviewStats')) {
    return projectService.getOverviewStats();
  }
  if (endpoint.includes('/project/get-project-by-status')) {
    return projectService.getByStatus();
  }
  if (endpoint.includes('/project/get-project-by-trend')) {
    return projectService.getTrend();
  }
  if (endpoint.includes('/project/get-regional-distribution')) {
    // Calculate from mockProjects
    const { mockProjects } = await import('../data/mockProjects.js');
    const divisions = {};
    mockProjects.forEach(p => {
      const div = p.geographic_division;
      if (!div) return;
      if (!divisions[div]) {
        divisions[div] = { active_projects: 0, completed_projects: 0, total_projects: 0, total_funding: 0 };
      }
      divisions[div].total_projects++;
      divisions[div].total_funding += p.total_cost_usd || 0;
      if (p.status === 'Completed' || p.status === 'Implemented') divisions[div].completed_projects++;
      else if (p.status === 'Active') divisions[div].active_projects++;
    });
    return {
      status: true,
      data: Object.keys(divisions).map(location_name => ({
        location_name,
        ...divisions[location_name]
      }))
    };
  }
  if (endpoint.includes('/project/get-overview-stat')) {
    return getOverviewStats();
  }
  if (endpoint.includes('/project/add-project')) {
    const data = JSON.parse(options.body || '{}');
    return projectService.add(data);
  }
  if (endpoint.includes('/project/update/')) {
    const id = endpoint.split('/').pop();
    const data = JSON.parse(options.body || '{}');
    return projectService.update(id, data);
  }
  if (endpoint.includes('/project/delete/')) {
    const id = endpoint.split('/').pop();
    return projectService.delete(id);
  }
  
  // Agency endpoints
  if (endpoint.includes('/agency/all')) {
    return agencyService.getAll();
  }
  if (endpoint.includes('/agency/get/')) {
    const id = endpoint.split('/').pop();
    return agencyService.getById ? agencyService.getById(id) : createResponse({}, 'Agency not found');
  }
  
  // Funding source endpoints
  if (endpoint.includes('/funding-source/all')) {
    return fundingSourceService.getAll();
  }
  if (endpoint.includes('/funding-source/get/')) {
    const id = endpoint.split('/').pop();
    return fundingSourceService.getById(id);
  }
  if (endpoint.includes('/project/get-funding-source-by-type')) {
    return fundingSourceService.getByType();
  }
  if (endpoint.includes('/project/get-funding-source-overview')) {
    return fundingSourceService.getOverview();
  }
  if (endpoint.includes('/project/get-funding-source-trend')) {
    return fundingSourceService.getTrend();
  }
  if (endpoint.includes('/project/get-funding-source')) {
    return fundingSourceService.getAll();
  }
  
  
  // Auth endpoints
  if (endpoint.includes('/auth/login')) {
    const data = JSON.parse(options.body || '{}');
    return authService.login(data);
  }
  
  // Default fallback
  console.warn(`No mock data available for endpoint: ${endpoint}`);
  return { status: false, message: 'Service unavailable', data: null };
};

// Project API endpoints
export const projectApi = {
  // Basic CRUD Operations
  getAll: (query = '') => apiRequest(`/project/all-project${query}`),
  getById: (id) => {
    if (!id) throw new Error('Project ID is required');
    return apiRequest(`/project/get/${id}`);
  },
  add: (projectData) => {
    if (!projectData) throw new Error('Project data is required');
    return apiRequest('/project/add-project', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },
  update: (id, projectData) => {
    if (!id) throw new Error('Project ID is required');
    if (!projectData) throw new Error('Project data is required');
    return apiRequest(`/project/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },
  delete: (id) => {
    if (!id) throw new Error('Project ID is required');
    return apiRequest(`/project/delete/${id}`, {
      method: 'DELETE',
    });
  },
  getByStatus: () => apiRequest('/project/get-project-by-status'),
  getTrend: () => apiRequest('/project/get-project-by-trend'),
  getOverviewStats: () => apiRequest('/project/get-overview-stat'),
  getProjectsOverviewStats: () => apiRequest('/project/projectsOverviewStats'),
  getRegionalDistribution: () => apiRequest('/project/get-regional-distribution'),

  // Dashboard Data
  getDashboardOverviewStats: () => apiRequest('/project/get-overview-stat'),
};

// Pending Project API endpoints
export const pendingProjectApi = {
  // Public submission
  submit: (projectData) => {
    if (!projectData) throw new Error('Project data is required');
    return apiRequest('/pending-project/submit', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },
  
  // Admin operations
  getAll: () => apiRequest('/pending-project/all'),
  getById: (id) => {
    if (!id) throw new Error('Pending project ID is required');
    return apiRequest(`/pending-project/${id}`);
  },
  approve: (id) => {
    if (!id) throw new Error('Pending project ID is required');
    return apiRequest(`/pending-project/approve/${id}`, {
      method: 'PUT',
    });
  },
  reject: (id) => {
    if (!id) throw new Error('Pending project ID is required');
    return apiRequest(`/pending-project/reject/${id}`, {
      method: 'DELETE',
    });
  },
};

// Location API endpoints
export const locationApi = {
  getAll: () => apiRequest('/location/all'),
  getById: (id) => {
    if (!id) throw new Error('Location ID is required');
    return apiRequest(`/location/get/${id}`);
  },
  add: (locationData) => {
    if (!locationData || !locationData.name) throw new Error('Location name is required');
    return apiRequest('/location/add-location', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  },
  update: (id, locationData) => {
    if (!id) throw new Error('Location ID is required');
    if (!locationData) throw new Error('Location data is required');
    return apiRequest(`/location/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  },
  delete: (id) => {
    if (!id) throw new Error('Location ID is required');
    return apiRequest(`/location/delete/${id}`, {
      method: 'DELETE',
    });
  },
};

// Agency API endpoints
export const agencyApi = {
  getAll: () => apiRequest('/agency/all'),
  getById: (id) => {
    if (!id) throw new Error('Agency ID is required');
    return apiRequest(`/agency/get/${id}`);
  },
  add: (agencyData) => {
    if (!agencyData || !agencyData.name) throw new Error('Agency name is required');
    return apiRequest('/agency/add-agency', {
      method: 'POST',
      body: JSON.stringify(agencyData),
    });
  },
  update: (id, agencyData) => {
    if (!id) throw new Error('Agency ID is required');
    if (!agencyData) throw new Error('Agency data is required');
    return apiRequest(`/agency/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agencyData),
    });
  },
  delete: (id) => {
    if (!id) throw new Error('Agency ID is required');
    return apiRequest(`/agency/delete/${id}`, {
      method: 'DELETE',
    });
  },
};

// Funding Source API endpoints
export const fundingSourceApi = {
  getAll: () => apiRequest('/funding-source/all'),
  getById: (id) => {
    if (!id) throw new Error('Funding source ID is required');
    return apiRequest(`/funding-source/get/${id}`);
  },
  add: (fundingSourceData) => {
    if (!fundingSourceData || !fundingSourceData.name) throw new Error('Funding source name is required');
    return apiRequest('/funding-source/add-funding-source', {
      method: 'POST',
      body: JSON.stringify(fundingSourceData),
    });
  },
  update: (id, fundingSourceData) => {
    if (!id) throw new Error('Funding source ID is required');
    if (!fundingSourceData) throw new Error('Funding source data is required');
    return apiRequest(`/funding-source/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fundingSourceData),
    });
  },
  delete: (id) => {
    if (!id) throw new Error('Funding source ID is required');
    return apiRequest(`/funding-source/delete/${id}`, {
      method: 'DELETE',
    });
  },
  // Funding Source Analytics (reverted to use project routes)
  getFundingSourceByType: () => apiRequest('/project/get-funding-source-by-type'),
  getFundingSourceOverview: () => apiRequest('/project/get-funding-source-overview'),
  getFundingSourceTrend: () => apiRequest('/project/get-funding-source-trend'),
  getFundingSource: () => apiRequest('/project/get-funding-source'),
};


// Auth API endpoints
export const authApi = {
  register: (userData) => {
    if (!userData || !userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  login: (credentials) => {
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  getAllUsers: () => apiRequest('/auth/get-all-user'),
  getUserById: (id) => {
    if (!id) throw new Error('User ID is required');
    return apiRequest(`/auth/user/${id}`);
  },
  updateUser: (id, userData) => {
    if (!id) throw new Error('User ID is required');
    if (!userData) throw new Error('User data is required');
    return apiRequest(`/auth/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  deleteUser: (id) => {
    if (!id) throw new Error('User ID is required');
    return apiRequest(`/auth/user/${id}`, {
      method: 'DELETE',
    });
  },
  // Compatibility methods for AdminFormPage and AdminListPage
  getAll: () => apiRequest('/auth/get-all-user'),
  getById: (id) => {
    if (!id) throw new Error('User ID is required');
    return apiRequest(`/auth/user/${id}`);
  },
  update: (id, userData) => {
    if (!id) throw new Error('User ID is required');
    if (!userData) throw new Error('User data is required');
    return apiRequest(`/auth/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  delete: (id) => {
    if (!id) throw new Error('User ID is required');
    return apiRequest(`/auth/user/${id}`, {
      method: 'DELETE',
    });
  },
  add: (userData) => {
    if (!userData || !userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

export default apiRequest;