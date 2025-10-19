import React from 'react';
import StatCard from './StatCard';
import { DollarSign, TrendingUp, Target, Activity, Building, Users, CheckCircle } from 'lucide-react';

// Universal stats display with consistent patterns
const StatsGrid = ({
  stats = [],
  columns = 4, // 1 | 2 | 3 | 4
  gap = 'md', // 'sm' | 'md' | 'lg'
  animated = true,
  animationDelay = 100,
  defaultIcons = true,
  className = ''
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  // Default icon mapping
  const getDefaultIcon = (index, title) => {
    if (!defaultIcons) return null;
    
    const iconMap = {
      finance: <DollarSign size={20} />,
      money: <DollarSign size={20} />,
      dollar: <DollarSign size={20} />,
      cost: <DollarSign size={20} />,
      amount: <DollarSign size={20} />,
      funding: <DollarSign size={20} />,
      
      trend: <TrendingUp size={20} />,
      growth: <TrendingUp size={20} />,
      increase: <TrendingUp size={20} />,
      
      target: <Target size={20} />,
      goal: <Target size={20} />,
      objective: <Target size={20} />,
      
      activity: <Activity size={20} />,
      active: <Activity size={20} />,
      
      building: <Building size={20} />,
      agency: <Building size={20} />,
      organization: <Building size={20} />,
      
      user: <Users size={20} />,
      people: <Users size={20} />,
      beneficiaries: <Users size={20} />,
      
      complete: <CheckCircle size={20} />,
      completed: <CheckCircle size={20} />,
      done: <CheckCircle size={20} />
    };

    // Try to match by title keywords
    const titleLower = title?.toLowerCase() || '';
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (titleLower.includes(keyword)) {
        return icon;
      }
    }

    // Fallback to default icons by index
    const fallbackIcons = [
      <DollarSign size={20} />,
      <Building size={20} />,
      <TrendingUp size={20} />,
      <CheckCircle size={20} />
    ];
    
    return fallbackIcons[index % fallbackIcons.length];
  };

  const getColorByIndex = (index) => {
    const colors = ['primary', 'success', 'warning', 'primary'];
    return colors[index % colors.length];
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {stats.map((stat, index) => (
        <div 
          key={stat.id || index}
          className={animated ? "animate-fade-in-up h-full" : "h-full"}
          style={animated ? { animationDelay: `${index * animationDelay}ms` } : {}}
        >
          <StatCard 
            title={stat.title}
            value={stat.value}
            change={stat.change}
            color={stat.color || getColorByIndex(index)}
            icon={stat.icon || getDefaultIcon(index, stat.title)}
          />
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;