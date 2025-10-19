import React, { useMemo } from 'react';
import { Users, MapPin, TrendingUp } from 'lucide-react';
import { calculatePeopleAffected, formatPopulation } from '../../utils/populationData';

const PeopleAffectedDisplay = ({ 
  locations = [], 
  impactPercentage = 10,
  className = "",
  showDetails = true 
}) => {
  const affectedData = useMemo(() => {
    // Convert location IDs to location objects if needed
    const locationObjects = locations.map(loc => {
      if (typeof loc === 'object' && loc.name && loc.region) {
        return loc;
      }
      // If locations array contains just IDs, we need to find the actual location data
      // This would typically come from a context or props
      return loc;
    }).filter(loc => loc && loc.name && loc.region);

    return calculatePeopleAffected(locationObjects, impactPercentage);
  }, [locations, impactPercentage]);

  if (!locations.length || affectedData.totalAffected === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 border border-gray-200 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Users size={16} />
          <span className="text-sm">Select locations to see estimated people affected</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-100 rounded">
            <Users size={16} className="text-blue-600" />
          </div>
          <h4 className="font-medium text-gray-900">Estimated People Affected</h4>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <TrendingUp size={14} />
          <span>{impactPercentage}% impact rate</span>
        </div>
      </div>

      {/* Total Affected */}
      <div className="mb-3">
        <div className="text-2xl font-bold text-blue-600">
          {formatPopulation(affectedData.totalAffected)}
        </div>
        <div className="text-sm text-gray-600">
          people potentially affected by this project
        </div>
      </div>

      {/* Regional Breakdown */}
      {showDetails && Object.keys(affectedData.regionBreakdown).length > 1 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Regional Breakdown:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(affectedData.regionBreakdown).map(([region, affected]) => (
              <div key={region} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-gray-400" />
                  <span className="text-gray-700">{region}</span>
                </div>
                <span className="font-medium text-blue-600">
                  {formatPopulation(affected)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Details */}
      {showDetails && affectedData.details.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="text-xs text-gray-600">
              <strong>Note:</strong> Estimates are based on {impactPercentage}% of the local population. Population data has been collected from the <a
                href="https://bbs.gov.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
            >
              Bangladesh Bureau of Statistics (BBS)
            </a>. Actual impact may vary depending on project scope and implementation.
            </div>
          </div>
      )}

    </div>
  );
};

export default PeopleAffectedDisplay;