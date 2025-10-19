import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { ArrowLeft } from 'lucide-react';

const AdminPageHeader = ({ 
  title, 
  subtitle, 
  backPath = '/admin/dashboard',
  showLogout = true,
  onLogout,
  rightContent = null
}) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
      <div className="flex items-center space-x-4">
        <Link to={backPath} className="text-purple-600 hover:text-purple-700 transition-colors duration-200">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-gray-500">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex items-center space-x-4 mt-4 md:mt-0">
        {rightContent}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
        {showLogout && onLogout && (
          <Button onClick={onLogout} variant="outline" size="sm">
            Logout
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminPageHeader;