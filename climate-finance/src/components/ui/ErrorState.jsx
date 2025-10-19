import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  type = 'error', // 'error' | 'not-found' | 'network' | 'empty'
  showRefresh = true,
  showHome = false,
  showBack = false,
  onRefresh,
  onHome,
  onBack,
  icon = null,
  className = ''
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'not-found':
        return <div className="text-6xl font-bold text-gray-400">404</div>;
      case 'network':
        return <RefreshCw size={48} className="text-red-400" />;
      case 'empty':
        return <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded" />
        </div>;
      default:
        return <AlertTriangle size={48} className="text-red-400" />;
    }
  };

  const getDefaultMessages = () => {
    switch (type) {
      case 'not-found':
        return {
          title: 'Page Not Found',
          message: 'The page you are looking for does not exist.'
        };
      case 'network':
        return {
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection.'
        };
      case 'empty':
        return {
          title: 'No Data Found',
          message: 'There are no items to display at the moment.'
        };
      default:
        return { title, message };
    }
  };

  const messages = getDefaultMessages();

  return (
    <Card padding={true} className={className}>
      <div className="text-center py-12">
        <div className="mb-6 flex justify-center">
          {icon || getDefaultIcon()}
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {messages.title}
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {messages.message}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRefresh && onRefresh && (
            <Button
              variant="primary"
              leftIcon={<RefreshCw size={16} />}
              onClick={onRefresh}
            >
              Try Again
            </Button>
          )}
          
          {showBack && onBack && (
            <Button
              variant="outline"
              leftIcon={<ArrowLeft size={16} />}
              onClick={onBack}
            >
              Go Back
            </Button>
          )}
          
          {showHome && onHome && (
            <Button
              variant="outline"
              leftIcon={<Home size={16} />}
              onClick={onHome}
            >
              Go Home
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ErrorState;