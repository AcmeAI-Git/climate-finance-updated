import React from 'react';
import Loading from './Loading';
import ErrorState from './ErrorState';

// Universal component for handling loading, error, and empty states
const DataStateWrapper = ({
  isLoading,
  error,
  data,
  children,
  loadingProps = {},
  errorProps = {},
  emptyState = null,
  showEmptyWhen = (data) => !data || (Array.isArray(data) && data.length === 0),
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`flex justify-center items-center min-h-64 ${className}`}>
        <Loading size="lg" {...loadingProps} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load data"
        message={error}
        showRefresh={true}
        {...errorProps}
      />
    );
  }

  if (showEmptyWhen(data)) {
    return emptyState || (
      <ErrorState
        type="empty"
        title="No data found"
        message="No data is currently available."
        showRefresh={false}
      />
    );
  }

  return children;
};

export default DataStateWrapper;