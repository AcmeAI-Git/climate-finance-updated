// Status configurations
export const STATUS_CONFIG = {
  // Project statuses
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    iconName: 'Play'
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800',
    iconName: 'CheckCircle'
  },
  planning: {
    label: 'Planning',
    color: 'bg-yellow-100 text-yellow-800',
    iconName: 'Clock'
  },
  'under-implementation': {
    label: 'Under Implementation',
    color: 'bg-orange-100 text-orange-800',
    iconName: 'Cog'
  },
  'on-hold': {
    label: 'On Hold',
    color: 'bg-gray-100 text-gray-800',
    iconName: 'Pause'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    iconName: 'XCircle'
  },
  pending: {
    label: 'Pending',
    color: 'bg-slate-100 text-slate-800',
    iconName: 'Clock'
  }
};

// Project types
export const PROJECT_TYPE_CONFIG = {
  'full-size': {
    label: 'Full Size',
    color: 'bg-purple-100 text-purple-800',
    iconName: 'Target'
  },
  'medium-size': {
    label: 'Medium Size',
    color: 'bg-blue-100 text-blue-800',
    iconName: 'Target'
  },
  'enabling-activity': {
    label: 'Enabling Activity',
    color: 'bg-green-100 text-green-800',
    iconName: 'Zap'
  }
};

// Funding source types
export const FUNDING_TYPE_CONFIG = {
  multilateral: {
    label: 'Multilateral',
    color: 'bg-blue-100 text-blue-800',
    iconName: 'Globe'
  },
  bilateral: {
    label: 'Bilateral',
    color: 'bg-green-100 text-green-800',
    iconName: 'Users'
  },
  private: {
    label: 'Private',
    color: 'bg-purple-100 text-purple-800',
    iconName: 'Building'
  },
  'climate-fund': {
    label: 'Climate Fund',
    color: 'bg-yellow-100 text-yellow-800',
    iconName: 'Banknote'
  }
};

// Agency types
export const AGENCY_TYPE_CONFIG = {
  implementing: {
    label: 'Implementing',
    color: 'bg-blue-100 text-blue-800',
    iconName: 'Building'
  },
  executing: {
    label: 'Executing',
    color: 'bg-green-100 text-green-800',
    iconName: 'Users'
  },
  accredited: {
    label: 'Accredited',
    color: 'bg-purple-100 text-purple-800',
    iconName: 'CheckCircle'
  }
};

// User roles - Mapping backend roles to frontend display
export const USER_ROLE_CONFIG = {
  'superadmin': {
    label: 'Super Admin',
    color: 'bg-red-100 text-red-800',
    iconName: 'Users'
  },
  'admin': {
    label: 'Admin',
    color: 'bg-blue-100 text-blue-800',
    iconName: 'Target'
  },
  'viewer': {
    label: 'Viewer',
    color: 'bg-gray-100 text-gray-800',
    iconName: 'Eye'
  }
};

// Regional configurations
export const REGION_CONFIG = {
  central: {
    label: 'Central',
    color: 'bg-blue-100 text-blue-800'
  },
  northeast: {
    label: 'Northeast',
    color: 'bg-green-100 text-green-800'
  },
  northwest: {
    label: 'Northwest',
    color: 'bg-purple-100 text-purple-800'
  },
  southwest: {
    label: 'Southwest',
    color: 'bg-yellow-100 text-yellow-800'
  },
  southeast: {
    label: 'Southeast',
    color: 'bg-pink-100 text-pink-800'
  },
  chattogram: {
    label: 'Chattogram',
    color: 'bg-indigo-100 text-indigo-800'
  }
};

// Utility functions
export const getStatusConfig = (status, type = 'project') => {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '-');
  
  switch (type) {
    case 'project':
      return STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.pending;
    case 'funding':
      return FUNDING_TYPE_CONFIG[normalizedStatus] || FUNDING_TYPE_CONFIG.multilateral;
    case 'agency':
      return AGENCY_TYPE_CONFIG[normalizedStatus] || AGENCY_TYPE_CONFIG.implementing;
    case 'user':
      return USER_ROLE_CONFIG[normalizedStatus] || USER_ROLE_CONFIG['viewer'];
    case 'region':
      return REGION_CONFIG[normalizedStatus] || { label: status, color: 'bg-gray-100 text-gray-800' };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800' };
  }
};

export const getProjectTypeConfig = (type) => {
  const normalizedType = type?.toLowerCase().replace(/\s+/g, '-');
  return PROJECT_TYPE_CONFIG[normalizedType] || PROJECT_TYPE_CONFIG['full-size'];
};

// Export all configs for direct usage
export const getAllConfigs = () => ({
  STATUS_CONFIG,
  PROJECT_TYPE_CONFIG,
  FUNDING_TYPE_CONFIG,
  AGENCY_TYPE_CONFIG,
  USER_ROLE_CONFIG,
  REGION_CONFIG
});