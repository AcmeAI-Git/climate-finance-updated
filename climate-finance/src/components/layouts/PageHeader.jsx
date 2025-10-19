import React from 'react';
import { ArrowLeft, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const PageHeader = ({
  title,
  subtitle,
  backPath,
  backText = 'Back',
  showUserInfo = false,
  showLogout = false,
  onLogout,
  actions,
  className = ''
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate('/admin/login');
    }
  };

  return (
    <div className={`mb-8 ${className}`}>
      {/* Back Button */}
      {backPath && (
        <div className="mb-4">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(backPath)}
            className="text-gray-600 hover:text-gray-800"
          >
            {backText}
          </Button>
        </div>
      )}

      {/* Header Content */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 text-lg">{subtitle}</p>
          )}
        </div>

        {/* Right Side: User Info and Actions */}
        <div className="flex items-center gap-4 mt-4 lg:mt-0">
          {/* User Info */}
          {showUserInfo && user && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-purple-600" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user.fullName}</div>
                <div className="text-gray-500">{user.role}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}

          {/* Logout Button */}
          {showLogout && (
            <Button
              variant="outline"
              leftIcon={<LogOut size={16} />}
              onClick={handleLogout}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;