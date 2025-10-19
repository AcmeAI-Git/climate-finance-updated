import React from 'react';
import { Plus, Download } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import SearchFilter from './SearchFilter';

const AdminControlsCard = ({
  title,
  subtitle,
  totalCount = 0,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  onAddNew,
  addNewText = 'Add New',
  onExport,
  showExport = true,
  filters = [],
  activeFilters = {},
  onFilterChange,
  additionalActions = [],
  children
}) => {
  return (
    <Card className="mb-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {title} {totalCount > 0 && `(${totalCount})`}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          {/* Export Button */}
          {showExport && onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              leftIcon={<Download size={16} />}
            >
              Download
            </Button>
          )}

          {/* Additional Actions */}
          {additionalActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size={action.size || 'sm'}
              onClick={action.onClick}
              leftIcon={action.icon}
              className={action.className}
            >
              {action.label}
            </Button>
          ))}

          {/* Add New Button */}
          {onAddNew && (
            <Button
              variant="primary"
              onClick={onAddNew}
              leftIcon={<Plus size={16} />}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {addNewText}
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilter
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        filters={filters.map(filter => ({
          key: filter.key,
          value: activeFilters[filter.key] || filter.defaultValue || 'All',
          onChange: (value) => onFilterChange?.(filter.key, value),
          options: filter.options
        }))}
        className="mb-4"
      />

      {/* Custom Children Content */}
      {children}
    </Card>
  );
};

export default AdminControlsCard;