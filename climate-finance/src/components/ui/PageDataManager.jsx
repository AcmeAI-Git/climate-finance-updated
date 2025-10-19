import React from 'react';
import { useMultipleApiData } from '../../hooks';
import PageLayout from '../layouts/PageLayout';
import DataStateWrapper from './DataStateWrapper';
import StatsGrid from './StatsGrid';
import Card from './Card';

// Universal page manager for dashboard-style pages with stats and charts
const PageDataManager = ({
  apiCalls = {},
  fallbackData = {},
  title,
  subtitle,
  children,
  renderStats,
  renderCharts,
  renderContent,
  statsConfig = {},
  bgColor = "bg-gray-50",
  showRefreshButton = true,
  headerActions = null,
  className = ''
}) => {
  const { data, isLoading, errors, refetch } = useMultipleApiData(apiCalls, { fallbackData });

  const hasAnyError = Object.keys(errors).length > 0;
  const mainError = hasAnyError ? Object.values(errors)[0] : null;

  return (
    <PageLayout bgColor={bgColor}>
      <DataStateWrapper
        isLoading={isLoading}
        error={mainError}
        data={data}
        errorProps={{
          onRefresh: showRefreshButton ? refetch : undefined
        }}
        className={className}
      >
        {/* Header Section */}
        {(title || subtitle || headerActions) && (
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8">
            <div>
              {title && (
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
              )}
              {subtitle && (
                <p className="text-gray-500">{subtitle}</p>
              )}
            </div>
            {headerActions && (
              <div className="mt-4 lg:mt-0">
                {headerActions}
              </div>
            )}
          </div>
        )}

        {/* Error Messages for Individual API Calls */}
        {hasAnyError && (
          <Card padding={true} className="mb-6">
            <div className="text-center py-4">
              <p className="text-yellow-600 text-sm mb-2">
                Some data could not be loaded. Showing available information.
              </p>
              {showRefreshButton && (
                <button
                  onClick={refetch}
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  Try again
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Stats Section */}
        {(renderStats || data.stats) && (
          <div className="mb-8">
            {renderStats ? (
              renderStats(data)
            ) : (
              <StatsGrid 
                stats={Array.isArray(data.stats) ? data.stats : []}
                {...statsConfig}
              />
            )}
          </div>
        )}

        {/* Charts Section */}
        {renderCharts && (
          <div className="mb-8">
            {renderCharts(data)}
          </div>
        )}

        {/* Custom Content */}
        {renderContent && renderContent(data)}
        
        {/* Children as fallback */}
        {children && (typeof children === 'function' ? children(data) : children)}
      </DataStateWrapper>
    </PageLayout>
  );
};

export default PageDataManager;