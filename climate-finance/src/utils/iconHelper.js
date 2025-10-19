import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  Pause, 
  XCircle,
  Globe,
  Users,
  Building,
  Banknote,
  Target,
  Zap
} from 'lucide-react';

// Icon mapping for status configurations
const ICON_MAP = {
  Play: Play,
  CheckCircle: CheckCircle,
  Clock: Clock,
  XCircle: XCircle,
  Pause: Pause,
  Globe: Globe,
  Users: Users,
  Building: Building,
  Banknote: Banknote,
  Target: Target,
  Zap: Zap
};

// Utility function to get icon component from iconName
export const getIcon = (iconName, size = 14) => {
  const IconComponent = ICON_MAP[iconName];
  return IconComponent ? <IconComponent size={size} /> : null;
};

// Enhanced getStatusConfig that includes the icon component
export const getStatusConfigWithIcon = (status, type = 'project') => {
  // Import the config from statusConfig
  const { getStatusConfig } = import('./statusConfig');
  const config = getStatusConfig(status, type);
  
  return {
    ...config,
    icon: config.iconName ? getIcon(config.iconName) : null
  };
};