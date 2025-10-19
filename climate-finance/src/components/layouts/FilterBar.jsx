import React from 'react';
import SearchFilter from '../ui/SearchFilter';

const FilterBar = ({
  searchTerm = '',
  onSearchChange = () => {},
  searchPlaceholder = 'Search...',
  filters = [],
  resultCount = 0,
  totalCount = 0
}) => {
  return (
    <div className="mb-8">
      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        className="mb-4"
      />
      <div className="text-sm text-gray-500">
        Showing {resultCount} of {totalCount} results
      </div>
    </div>
  );
};

export default FilterBar;
