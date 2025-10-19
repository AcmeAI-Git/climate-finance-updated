// Frontend mock data service - simulates backend API responses
import { mockProjects, mockAgencies, mockFundingSources } from '../data/mockProjects.js';

// Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to create API response format
const createResponse = (data, message = 'Success') => ({
  status: true,
  message,
  data
});

// Helper function to calculate statistics
const calculateStats = (projects) => {
  const totalProjects = projects.length;
  const totalCost = projects.reduce((sum, p) => sum + (p.total_cost_usd || 0), 0);
  const totalGefGrant = projects.reduce((sum, p) => sum + (p.gef_grant || 0), 0);
  const totalCofinancing = projects.reduce((sum, p) => sum + (p.cofinancing || 0), 0);
  const totalDisbursement = projects.reduce((sum, p) => sum + (p.disbursement || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  
  return {
    total_projects: totalProjects,
    total_investment: totalCost,
    total_cost_usd: totalCost,
    totalGefGrant,
    totalCofinancing,
    totalDisbursement,
    active_projects: activeProjects,
    completed_projects: completedProjects
  };
};

// Project-related endpoints
export const projectService = {
  // Get all projects
  getAll: async () => {
    await delay();
    return createResponse(mockProjects);
  },

  // Get project by ID
  getById: async (id) => {
    await delay();
    const project = mockProjects.find(p => p.project_id === id);
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Enrich project with full objects instead of just IDs
    const enrichedProject = {
      ...project,
      // Add aliases for ProjectDetails compatibility
      projectAgencies: project.agencies || [],
      projectFundingSources: project.funding_sources || [],
      projectFocalAreas: project.focal_areas || [],
      projectLocations: project.districts ? project.districts.map(district => ({ name: district })) : []
    };
    
    return createResponse(enrichedProject);
  },

  // Get projects overview stats
  getOverviewStats: async () => {
    await delay();
    const stats = calculateStats(mockProjects);
    
    // Add current_year and previous_year structure for LandingPage compatibility
    
    const response = {
      ...stats,
      current_year: {
        total_projects: Math.floor(stats.total_projects * 0.6),
        active_projects: Math.floor(stats.active_projects * 0.7),
        completed_projects: Math.floor(stats.completed_projects * 0.5),
        total_climate_finance: Math.floor(stats.total_investment * 0.4),
        adaptation_finance: Math.floor(stats.total_investment * 0.25),
        mitigation_finance: Math.floor(stats.total_investment * 0.15)
      },
      previous_year: {
        total_projects: Math.floor(stats.total_projects * 0.4),
        active_projects: Math.floor(stats.active_projects * 0.3),
        completed_projects: Math.floor(stats.completed_projects * 0.5),
        total_climate_finance: Math.floor(stats.total_investment * 0.6),
        adaptation_finance: Math.floor(stats.total_investment * 0.35),
        mitigation_finance: Math.floor(stats.total_investment * 0.25)
      }
    };
    
    return createResponse(response);
  },

  // Get projects by status
  getByStatus: async () => {
    await delay();
    const statusData = mockProjects.reduce((acc, project) => {
      const status = project.status || 'Unknown';
      if (!acc[status]) {
        acc[status] = { count: 0, projects: [] };
      }
      acc[status].count++;
      acc[status].projects.push(project);
      return acc;
    }, {});
    
    // Convert to array format expected by charts
    const statusArray = Object.entries(statusData).map(([name, data]) => ({
      name,
      value: data.count,
      count: data.count,
      projects: data.projects
    }));
    
    return createResponse(statusArray);
  },

  // Get projects by type
  getByType: async () => {
    await delay();
    const typeData = mockProjects.reduce((acc, project) => {
      const type = project.type || 'Unknown';
      if (!acc[type]) {
        acc[type] = { count: 0, projects: [] };
      }
      acc[type].count++;
      acc[type].projects.push(project);
      return acc;
    }, {});
    
    // Convert to array format expected by charts
    const typeArray = Object.entries(typeData).map(([name, data]) => ({
      name,
      value: data.count,
      count: data.count,
      projects: data.projects
    }));
    
    return createResponse(typeArray);
  },

  // Get projects by sector
  getBySector: async () => {
    await delay();
    const sectorData = mockProjects.reduce((acc, project) => {
      const sector = project.sector || 'Unknown';
      if (!acc[sector]) {
        acc[sector] = { count: 0, projects: [] };
      }
      acc[sector].count++;
      acc[sector].projects.push(project);
      return acc;
    }, {});
    
    // Convert to array format expected by charts
    const sectorArray = Object.entries(sectorData).map(([name, data]) => ({
      name,
      value: data.count,
      count: data.count,
      projects: data.projects
    }));
    
    return createResponse(sectorArray);
  },

  // Get projects trend (by approval year)
  getTrend: async () => {
    await delay();
    const trendData = mockProjects.reduce((acc, project) => {
      const year = project.approval_fy || new Date().getFullYear();
      if (!acc[year]) {
        acc[year] = { count: 0, totalCost: 0, projects: [] };
      }
      acc[year].count++;
      acc[year].totalCost += project.total_cost_usd || 0;
      acc[year].projects.push(project);
      return acc;
    }, {});
    
    // Convert to array format expected by charts
    const trendArray = Object.entries(trendData).map(([year, data]) => ({
      year: parseInt(year),
      projects: data.count,
      totalCost: data.totalCost
    })).sort((a, b) => a.year - b.year);
    
    return createResponse(trendArray);
  },

  // Add project (simulation)
  add: async (projectData) => {
    await delay();
    const newProject = {
      project_id: `demo-proj-${Date.now()}`,
      ...projectData,
      status: 'Pending'
    };
    mockProjects.push(newProject);
    return createResponse(newProject, 'Project added successfully');
  },

  // Update project (simulation)
  update: async (id, projectData) => {
    await delay();
    const index = mockProjects.findIndex(p => p.project_id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    mockProjects[index] = { ...mockProjects[index], ...projectData };
    return createResponse(mockProjects[index], 'Project updated successfully');
  },

  // Delete project (simulation)
  delete: async (id) => {
    await delay();
    const index = mockProjects.findIndex(p => p.project_id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    mockProjects.splice(index, 1);
    return createResponse({}, 'Project deleted successfully');
  },

  // Get regional distribution
  getRegionalDistribution: async () => {
    await delay();
    const regionalData = mockProjects.reduce((acc, project) => {
      const division = project.geographic_division || 'Unknown';
      if (!acc[division]) {
        acc[division] = { count: 0, totalCost: 0, projects: [], adaptation: 0, mitigation: 0 };
      }
      acc[division].count++;
      acc[division].totalCost += project.total_cost_usd || 0;
      acc[division].projects.push(project);
      
      // Calculate adaptation vs mitigation based on project type
      if (project.type === 'Adaptation') {
        acc[division].adaptation += project.total_cost_usd || 0;
      } else if (project.type === 'Mitigation') {
        acc[division].mitigation += project.total_cost_usd || 0;
      }
      
      return acc;
    }, {});
    
    // Convert to array format expected by charts with location_name, adaptation_total, mitigation_total
    const regionalArray = Object.entries(regionalData).map(([division, data]) => ({
      location_name: division + ' Division',
      adaptation_total: data.adaptation,
      mitigation_total: data.mitigation,
      count: data.count,
      totalCost: data.totalCost,
      projects: data.projects
    }));
    
    return createResponse(regionalArray);
  }
};

// Agency endpoints
export const agencyService = {
  getAll: async () => {
    await delay();
    return createResponse(mockAgencies);
  }
};

// Funding source endpoints
export const fundingSourceService = {
  getAll: async () => {
    await delay();
    return createResponse(mockFundingSources);
  },

  // Get funding source overview
  getOverview: async () => {
    await delay();
    const totalGrant = mockFundingSources.reduce((sum, fs) => sum + (fs.grant_amount || 0), 0);
    const totalLoan = mockFundingSources.reduce((sum, fs) => sum + (fs.loan_amount || 0), 0);
    const totalDisbursement = mockFundingSources.reduce((sum, fs) => sum + (fs.disbursement || 0), 0);
    const totalClimateFinance = totalGrant + totalLoan;
    
    
    return createResponse({
      total_climate_finance: totalClimateFinance,
      active_funding_source: mockFundingSources.length,
      committed_funds: totalGrant,
      disbursed_funds: totalDisbursement,
      total_projects: mockProjects.length,
      current_year: {
        total_finance: Math.floor(totalClimateFinance * 0.4),
        active_funding_source: Math.floor(mockFundingSources.length * 0.7),
        committed_funds: Math.floor(totalGrant * 0.4),
        disbursed_funds: Math.floor(totalDisbursement * 0.4),
        total_projects: Math.floor(mockProjects.length * 0.7)
      }
    });
  },

  // Get funding source by type
  getByType: async () => {
    await delay();
    const typeData = mockFundingSources.reduce((acc, fs) => {
      const type = fs.grant_amount > 0 ? 'Grant' : 'Loan';
      if (!acc[type]) {
        acc[type] = { count: 0, totalAmount: 0, sources: [] };
      }
      acc[type].count++;
      acc[type].totalAmount += fs.grant_amount || fs.loan_amount || 0;
      acc[type].sources.push(fs);
      return acc;
    }, {});
    
    // Convert to array format expected by charts
    const typeArray = Object.entries(typeData).map(([name, data]) => ({
      name,
      value: data.totalAmount,
      count: data.count,
      totalAmount: data.totalAmount,
      sources: data.sources
    }));
    
    return createResponse(typeArray);
  },

  // Get funding source trend
  getTrend: async () => {
    await delay();
    // Direct mock trend data for immediate display
    const trendArray = [
      { year: "2020", grants: 10000000, loans: 5000000, total: 15000000 },
      { year: "2021", grants: 12000000, loans: 8000000, total: 20000000 },
      { year: "2022", grants: 15000000, loans: 10000000, total: 25000000 },
      { year: "2023", grants: 18000000, loans: 12000000, total: 30000000 },
      { year: "2024", grants: 20000000, loans: 15000000, total: 35000000 }
    ];
    
    return createResponse(trendArray);
  },

  // Get funding source sector allocation
  getSectorAllocation: async () => {
    await delay();
    const sectorData = mockProjects.reduce((acc, project) => {
      const sector = project.sector || 'Unknown';
      if (!acc[sector]) {
        acc[sector] = { count: 0, totalCost: 0, projects: [], gef_grant: 0 };
      }
      acc[sector].count++;
      acc[sector].totalCost += project.total_cost_usd || 0;
      acc[sector].gef_grant += project.gef_grant || 0;
      acc[sector].projects.push(project);
      return acc;
    }, {});
    
    // Convert to array format expected by charts with sector and gef_grant
    const sectorArray = Object.entries(sectorData).map(([sector, data]) => ({
      sector,
      gef_grant: data.gef_grant,
      count: data.count,
      totalCost: data.totalCost,
      projects: data.projects
    }));
    
    return createResponse(sectorArray);
  },

  // Get funding source by ID
  getById: async (id) => {
    await delay();
    const source = mockFundingSources.find(fs => fs.funding_source_id === parseInt(id));
    if (!source) {
      throw new Error('Funding source not found');
    }
    
    // Calculate additional stats for the funding source
    const projectsUsingThisSource = mockProjects.filter(p => 
      p.funding_sources && p.funding_sources.some(fs => fs.funding_source_id === source.funding_source_id)
    );
    
    const enrichedSource = {
      ...source,
      active_projects: projectsUsingThisSource.length,
      sectors: [...new Set(projectsUsingThisSource.map(p => p.sector).filter(Boolean))],
      total_committed: source.grant_amount || source.loan_amount || 0,
      total_disbursed: source.disbursement || 0
    };
    
    return createResponse(enrichedSource);
  }
};


// Auth endpoints
export const authService = {
  login: async (credentials) => {
    await delay();
    // Simple mock login - accept any credentials for demo
    if (credentials.email && credentials.password) {
      return createResponse({
        user: {
          id: 1,
          email: credentials.email,
          name: 'Demo User',
          role: 'admin'
        },
        token: 'mock-jwt-token-' + Date.now()
      }, 'Login successful');
    }
    throw new Error('Invalid credentials');
  }
};

// Overview stats endpoint
export const getOverviewStats = async () => {
  await delay();
  const stats = calculateStats(mockProjects);
  const fundingStats = {
    totalGrant: mockFundingSources.reduce((sum, fs) => sum + (fs.grant_amount || 0), 0),
    totalLoan: mockFundingSources.reduce((sum, fs) => sum + (fs.loan_amount || 0), 0),
    totalDisbursement: mockFundingSources.reduce((sum, fs) => sum + (fs.disbursement || 0), 0)
  };
  
  const totalClimateFinance = fundingStats.totalGrant + fundingStats.totalLoan;
  
  return createResponse({
    ...stats,
    ...fundingStats,
    total_climate_finance: totalClimateFinance,
    totalAgencies: mockAgencies.length,
    totalFundingSources: mockFundingSources.length,
    current_year: {
      total_projects: Math.floor(stats.total_projects * 0.6),
      active_projects: Math.floor(stats.active_projects * 0.7),
      completed_projects: Math.floor(stats.completed_projects * 0.5),
      total_climate_finance: Math.floor(totalClimateFinance * 0.4),
      adaptation_finance: Math.floor(totalClimateFinance * 0.25),
      mitigation_finance: Math.floor(totalClimateFinance * 0.15)
    },
    previous_year: {
      total_projects: Math.floor(stats.total_projects * 0.4),
      active_projects: Math.floor(stats.active_projects * 0.3),
      completed_projects: Math.floor(stats.completed_projects * 0.5),
      total_climate_finance: Math.floor(totalClimateFinance * 0.6),
      adaptation_finance: Math.floor(totalClimateFinance * 0.35),
      mitigation_finance: Math.floor(totalClimateFinance * 0.25)
    }
  });
};
