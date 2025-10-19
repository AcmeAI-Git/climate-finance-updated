import React from 'react';
import SearchFilter from '../ui/SearchFilter';

const AdminControlsCard = ({
  title,
  count,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  activeFilters = {},
  onFilterChange,
  onAddNew,
  addButtonText = 'Add New',
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {title} {count !== undefined && `(${count})`}
        </h3>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors mt-4 md:mt-0"
          >
            {addButtonText}
          </button>
        )}
      </div>

      <SearchFilter
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        filters={filters.map(filter => ({
          key: filter.key,
          value: activeFilters[filter.key] || filter.defaultValue || '',
          onChange: (value) => onFilterChange?.(filter.key, value),
          options: filter.options
        }))}
      />

      {children}
    </div>
  );
};

export default AdminControlsCard;