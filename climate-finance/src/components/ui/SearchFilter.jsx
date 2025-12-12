import React, { useMemo, useEffect } from "react";
import { Search, X } from "lucide-react";
import { SEARCH_CONFIGS } from "../../constants/searchConfigs";
import MultiSelect from "./MultiSelect";

// Advanced search function with weighted scoring
const advancedSearch = (data, searchValue, searchConfig) => {
    if (!searchValue.trim()) return data;

    const searchTerms = searchValue
        .toLowerCase()
        .split(" ")
        .filter((term) => term.length > 0);

    return data
        .map((item) => {
            let score = 0;
            let matchCount = 0;

            // Check each search field
            searchConfig.searchFields.forEach((field) => {
                const value = getNestedValue(item, field.key);
                if (value != null && value !== undefined) {
                    try {
                        const fieldValue = value.toString().toLowerCase();

                        // Check for exact matches (higher score)
                        if (fieldValue.includes(searchValue.toLowerCase())) {
                            score += field.weight * 2;
                            matchCount++;
                        }

                        // Check for individual term matches
                        searchTerms.forEach((term) => {
                            if (fieldValue.includes(term)) {
                                score += field.weight;
                                matchCount++;
                            }
                        });
                    } catch {
                        // Skip this field if conversion fails
                    }
                }
            });

            return { ...item, _searchScore: score, _matchCount: matchCount };
        })
        .filter((item) => item._searchScore > 0)
        .sort((a, b) => b._searchScore - a._searchScore);
};

// Helper function to get nested object values
const getNestedValue = (obj, path) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
};

// Filter data based on active filters
const filterData = (data, activeFilters) => {
    return data.filter((item) => {
        const passesAllFilters = Object.entries(activeFilters).every(
            ([key, value]) => {
                // Handle undefined/null values - skip filter
                if (value === undefined || value === null) return true;
                
                // Handle array values (multi-select mode)
                if (Array.isArray(value)) {
                    // Empty array means "All" - show everything
                    if (value.length === 0) return true;
                    // Check if "All" is in the array
                    if (value.includes("All")) return true;
                }
                
                // Handle single values (backward compatibility)
                if (!value || value === "All") return true;

                let itemValue = getNestedValue(item, key);

                // Special handling for implementing_entity_id, executing_agency_id, delivery_partner_id
                // These filter keys need to check specific arrays with 'id' field
                if (key === "implementing_entity_id" || key === "executing_agency_id" || key === "delivery_partner_id") {
                    let arrayName;
                    if (key === "implementing_entity_id") {
                        arrayName = "implementing_entities";
                    } else if (key === "executing_agency_id") {
                        arrayName = "executing_agencies";
                    } else if (key === "delivery_partner_id") {
                        arrayName = "delivery_partners";
                    }
                    
                    // Handle array values (multi-select)
                    if (Array.isArray(value)) {
                        // Check for "N/A" in array
                        const hasNA = value.includes("N/A");
                        const hasOtherValues = value.some(v => v !== "N/A" && v !== "All");
                        
                        // Check N/A condition
                        const isNA = !item[arrayName] || !Array.isArray(item[arrayName]) || item[arrayName].length === 0;
                        if (hasNA && isNA) return true;
                        if (hasNA && !hasOtherValues) return isNA;
                        
                        // Check other values
                        if (hasOtherValues && item[arrayName] && Array.isArray(item[arrayName]) && item[arrayName].length > 0) {
                            const matches = item[arrayName].some((el) => {
                                if (el && typeof el === "object" && el.id !== undefined) {
                                    return value.some(v => v !== "N/A" && v !== "All" && el.id.toString() === v.toString());
                                }
                                return false;
                            });
                            return matches;
                        }
                        return false;
                    }
                    
                    // Handle single value (backward compatibility)
                    // Check for "N/A" first - if array doesn't exist or is empty
                    if (value === "N/A") {
                        return !item[arrayName] || !Array.isArray(item[arrayName]) || item[arrayName].length === 0;
                    }
                    
                    // For non-N/A values, check if array exists and has matching items
                    if (arrayName && item[arrayName] && Array.isArray(item[arrayName]) && item[arrayName].length > 0) {
                        const matches = item[arrayName].some((el) => {
                            if (el && typeof el === "object" && el.id !== undefined) {
                                return el.id.toString() === value.toString();
                            }
                            return false;
                        });
                        return matches;
                    }
                    // If array doesn't exist or is empty and we're not looking for "N/A", exclude item
                    return false;
                }

                // If the field doesn't exist at the top-level/path, try to find it inside
                // nested arrays/objects (e.g. project.agencies => [{agency_id, name}, ...])
                if (itemValue === undefined || itemValue === null) {
                    let found;
                    for (const prop in item) {
                        const val = item[prop];
                        if (Array.isArray(val) && val.length > 0) {
                            // If array of objects that contain the filter key, collect those values
                            if (
                                val.some(
                                    (el) =>
                                        el &&
                                        typeof el === "object" &&
                                        key in el
                                )
                            ) {
                                found = val
                                    .map((el) =>
                                        el && el[key] !== undefined
                                            ? el[key]
                                            : null
                                    )
                                    .filter(
                                        (v) => v !== null && v !== undefined
                                    );
                                break;
                            }
                        } else if (
                            val &&
                            typeof val === "object" &&
                            key in val
                        ) {
                            found = val[key];
                            break;
                        }
                    }

                    if (found === undefined || found === null) {
                        // Special handling for "N/A" filter - match null/undefined values
                        if (value === "N/A") {
                            return true;
                        }
                        // Field absent in this item — skip filter (don't exclude)
                        return true;
                    }

                    itemValue = found;
                }

                // If the item value is an array (e.g., geographic_division stored as an array),
                // check whether the selected filter value exists in the array (case-insensitive).
                if (Array.isArray(itemValue)) {
                    // Handle array filter values (multi-select)
                    if (Array.isArray(value)) {
                        // Check for "N/A" in filter values
                        const hasNA = value.includes("N/A");
                        const hasOtherValues = value.some(v => v !== "N/A" && v !== "All");
                        
                        // Check N/A condition
                        const isNA = itemValue.length === 0;
                        if (hasNA && isNA) return true;
                        if (hasNA && !hasOtherValues) return isNA;
                        
                        // Check other values
                        if (hasOtherValues) {
                            const matches = itemValue.some((v) => {
                                if (v === undefined || v === null) return false;
                                return value.some(filterVal => {
                                    if (!filterVal || filterVal === "N/A" || filterVal === "All") return false;
                                    try {
                                        return v.toString().toLowerCase() === filterVal.toString().toLowerCase();
                                    } catch {
                                        return false;
                                    }
                                });
                            });
                            return matches;
                        }
                        return false;
                    }
                    
                    // Handle single filter value (backward compatibility)
                    // If value is undefined, null, or not a string, skip this filter
                    if (value === undefined || value === null || (typeof value !== "string" && !Array.isArray(value))) {
                        return true; // Skip filter if value is invalid
                    }
                    
                    // If filters are set to 'All', pass through
                    if (value === "All") return true;
                    
                    // Special handling for "N/A" filter - match empty arrays or null/undefined
                    if (value === "N/A") {
                        return itemValue.length === 0;
                    }

                    // Only proceed if value is a string
                    if (typeof value !== "string") {
                        return true; // Skip if value is not a string
                    }

                    const matches = itemValue.some((v) => {
                        if (v === undefined || v === null) return false;
                        try {
                            return (
                                v.toString().toLowerCase() ===
                                value.toString().toLowerCase()
                            );
                        } catch {
                            return false;
                        }
                    });

                    return matches;
                }
                
                // Handle array filter values when itemValue is not an array
                if (Array.isArray(value)) {
                    // Check for "N/A" in filter values
                    const hasNA = value.includes("N/A");
                    const hasOtherValues = value.some(v => v !== "N/A" && v !== "All");
                    
                    // Check N/A condition
                    const isNA = itemValue === null || itemValue === undefined || itemValue === "";
                    if (hasNA && isNA) return true;
                    if (hasNA && !hasOtherValues) return isNA;
                    
                    // Check other values
                    if (hasOtherValues) {
                        return value.some(filterVal => {
                            if (!filterVal || filterVal === "N/A" || filterVal === "All") return false;
                            
                            // Handle case-insensitive matching for string values
                            if (typeof itemValue === "string" && typeof filterVal === "string") {
                                return itemValue.toLowerCase() === filterVal.toLowerCase();
                            }
                            
                            // Handle numeric values (like IDs)
                            if (typeof itemValue === "number" && typeof filterVal === "string") {
                                return itemValue.toString() === filterVal;
                            }
                            
                            // Handle string values that should be compared as numbers
                            if (typeof itemValue === "string" && typeof filterVal === "string" &&
                                !isNaN(itemValue) && !isNaN(filterVal)) {
                                return itemValue === filterVal;
                            }
                            
                            return itemValue === filterVal;
                        });
                    }
                    return false;
                }
                
                // Handle "N/A" filter for null/undefined values (when itemValue is not an array)
                if (value === "N/A") {
                    return itemValue === null || itemValue === undefined || itemValue === "";
                }

                // Handle case-insensitive matching for string values
                if (
                    typeof itemValue === "string" &&
                    typeof value === "string" &&
                    itemValue != null &&
                    value != null
                ) {
                    const matches =
                        itemValue.toLowerCase() === value.toLowerCase();
                    return matches;
                }

                // Handle numeric values (like IDs)
                if (
                    typeof itemValue === "number" &&
                    typeof value === "string"
                ) {
                    const matches = itemValue.toString() === value;
                    return matches;
                }

                // Handle string values that should be compared as numbers
                if (
                    typeof itemValue === "string" &&
                    typeof value === "string" &&
                    !isNaN(itemValue) &&
                    !isNaN(value)
                ) {
                    const matches = itemValue === value;
                    return matches;
                }

                const matches = itemValue === value;
                return matches;
            }
        );

        return passesAllFilters;
    });
};

const SearchFilter = ({
    data = [],
    onFilteredData,
    searchValue = "",
    onSearchChange,
    searchPlaceholder = "Search...",
    entityType = "projects",
    customConfig = null,
    activeFilters = {},
    onFiltersChange,
    filters = [], // Legacy support
    className = "",
    showAdvancedSearch = false,
    onClearAll = null,
    multiSelect = false, // New prop for multi-select mode
}) => {
    // Get search configuration
    const searchConfig = useMemo(() => {
        if (customConfig) return customConfig;
        if (filters.length > 0) {
            // Legacy support - use passed filters directly
            return {
                searchFields: [
                    { key: "name", weight: 1 },
                    { key: "title", weight: 1 },
                ],
                filters,
            };
        }
        return SEARCH_CONFIGS[entityType] || SEARCH_CONFIGS.projects;
    }, [entityType, customConfig, filters]);

    // Process data with search and filters
    useEffect(() => {
        let result = [...data]; // Create a copy to avoid mutation issues

        // Apply filters first
        if (Object.keys(activeFilters).length > 0) {
            result = filterData(result, activeFilters);
        }

        // Apply search with scoring
        if (searchValue) {
            result = advancedSearch(result, searchValue, searchConfig);
        }

        // Always call onFilteredData when data changes or when filters/search change
        if (onFilteredData) {
            onFilteredData(result);
        }
    }, [data, searchValue, activeFilters, searchConfig, onFilteredData]);

    const handleFilterChange = (filterKey, value) => {
        const newFilters = { ...activeFilters, [filterKey]: value };
        if (onFiltersChange) {
            onFiltersChange(newFilters);
        }
    };

    const handleClearAll = () => {
        if (onClearAll) {
            onClearAll();
        } else {
            onSearchChange("");
            if (onFiltersChange) {
                onFiltersChange({});
            }
        }
    };

    const hasActiveFilters =
        searchValue ||
        Object.values(activeFilters).some((v) => {
            if (Array.isArray(v)) {
                return v.length > 0 && !v.includes("All");
            }
            return v && v !== "All";
        });

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex flex-col gap-4">
                {/* Enhanced Search Input */}
                <div className="flex-1 relative">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                    {searchValue && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Filter Dropdowns Grid */}
                {searchConfig.filters && searchConfig.filters.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {searchConfig.filters.map((filter) => {
                            if (multiSelect) {
                                // Use MultiSelect component
                                const filterValue = activeFilters[filter.key];
                                const arrayValue = Array.isArray(filterValue) 
                                    ? filterValue 
                                    : (filterValue && filterValue !== "All" ? [filterValue] : []);
                                
                                // Generate placeholder from filter label or key
                                const placeholderText = filter.label 
                                    ? filter.label.toLowerCase()
                                    : filter.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                
                                return (
                                    <MultiSelect
                                        key={filter.key}
                                        options={filter.options}
                                        value={arrayValue}
                                        onChange={(newValue) => {
                                            handleFilterChange(filter.key, newValue);
                                        }}
                                        placeholder={`Select ${placeholderText}...`}
                                        searchable={true}
                                        maxDisplay={2}
                                        className="w-full"
                                        dropdownMinWidth="min-w-[350px]"
                                        dropdownMaxHeight="max-h-96"
                                    />
                                );
                            } else {
                                // Use regular select (backward compatibility)
                                return (
                                    <select
                                        key={filter.key}
                                        value={activeFilters[filter.key] || "All"}
                                        onChange={(e) => {
                                            handleFilterChange(
                                                filter.key,
                                                e.target.value
                                            );
                                        }}
                                        className={`px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                            filter.selectProps?.className || ""
                                        }`}
                                        translate={
                                            filter.selectProps?.translate || undefined
                                        }
                                    >
                                        {filter.options.map((option, index) => (
                                            <option
                                                key={`${filter.key}-${option.value}-${index}`}
                                                value={option.value}
                                                className="overflow-hidden text-ellipsis"
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                );
                            }
                        })}
                    </div>
                )}
            </div>

            {/* Search Tips (when advanced search is enabled) */}
            {showAdvancedSearch && searchValue && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
                    <strong>Search tips:</strong> Use multiple words for better
                    results. Searching in:{" "}
                    {searchConfig.searchFields
                        .slice(0, 3)
                        .map((f) => f.label)
                        .join(", ")}
                    {searchConfig.searchFields.length > 3 &&
                        ` and ${
                            searchConfig.searchFields.length - 3
                        } more fields`}
                </div>
            )}

            {/* Clear All Button */}
            {hasActiveFilters && (
                <div className="flex justify-end">
                    <button
                        onClick={handleClearAll}
                        className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 underline"
                    >
                        <X size={12} />
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchFilter;
