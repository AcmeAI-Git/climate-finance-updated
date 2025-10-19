import React from 'react';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Pause, 
  Target, 
  Zap, 
  Globe, 
  Users, 
  Building, 
  Banknote 
} from 'lucide-react';

// Icon mapping for statusConfig
const ICON_MAP = {
  Play: Play,
  CheckCircle: CheckCircle,
  Clock: Clock,
  XCircle: XCircle,
  Pause: Pause,
  Target: Target,
  Zap: Zap,
  Globe: Globe,
  Users: Users,
  Building: Building,
  Banknote: Banknote
};

export const renderIcon = (iconName, size = 16, className = '') => {
  const IconComponent = ICON_MAP[iconName];
  if (!IconComponent) return null;
  
  return <IconComponent size={size} className={className} />;
};

export default renderIcon;