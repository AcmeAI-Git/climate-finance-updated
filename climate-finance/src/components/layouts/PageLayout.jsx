import React from 'react';
import ErrorBoundary from '../ui/ErrorBoundary';

const PageLayout = ({ 
  children, 
  bgColor = "bg-gray-50",
  maxWidth = "max-w-6xl mx-auto",
}) => {
  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${bgColor} text-gray-800 flex flex-col`}>
        {/* Main content with proper responsive container */}
        <main className={`flex-grow py-4 sm:py-6 lg:py-8 ${maxWidth} px-4 sm:px-6 lg:px-8`}>
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default PageLayout;