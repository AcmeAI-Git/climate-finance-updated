/**
 * Population data for Bangladesh regions (matching admin location region names)
 * Source: Bangladesh Population and Housing Census 2022, Adjusted Population (BBS)
 */

export const populationData = {
    Southeast: {
        population: 34178612,
        districts: {},
    },
    North: {
        population: 18020071,
        districts: {},
    },
    Southwest: {
        population: 17813218,
        districts: {},
    },
    South: {
        population: 9325820,
        districts: {},
    },
    "North-Central": {
        population: 12637472,
        districts: {},
    },
    Northwest: {
        population: 20794019,
        districts: {},
    },
    Northeast: {
        population: 11415113,
        districts: {},
    },
    Central: {
        population: 45644586,
        districts: {},
    },
};

/**
 * Calculate estimated people affected based on project locations
 * @param {Array} locations - Array of location objects with name and region
 * @param {number} impactPercentage - Percentage of population likely to be affected (default 10%)
 * @returns {Object} - Object with total affected, breakdown by region, and details
 */
export const calculatePeopleAffected = (locations, impactPercentage = 10) => {
    if (!locations || locations.length === 0) {
        return {
            totalAffected: 0,
            regionBreakdown: {},
            details: [],
        };
    }

    let totalAffected = 0;
    const regionBreakdown = {};
    const details = [];

    locations.forEach((location) => {
        const regionData = populationData[location.region];
        if (regionData) {
            // Check if it's a specific district or use region total
            const districtPopulation = regionData.districts[location.name];
            const basePopulation = districtPopulation || regionData.population;

            const affected = Math.round(
                basePopulation * (impactPercentage / 100)
            );

            totalAffected += affected;

            if (!regionBreakdown[location.region]) {
                regionBreakdown[location.region] = 0;
            }
            regionBreakdown[location.region] += affected;

            details.push({
                locationName: location.name,
                region: location.region,
                population: basePopulation,
                affected: affected,
                percentage: impactPercentage,
            });
        }
    });

    return {
        totalAffected,
        regionBreakdown,
        details,
    };
};

/**
 * Get population for a specific location
 * @param {string} locationName - Name of the location
 * @param {string} region - Region of the location
 * @returns {number} - Population of the location
 */
export const getLocationPopulation = (locationName, region) => {
    const regionData = populationData[region];
    if (!regionData) return 0;

    return regionData.districts[locationName] || regionData.population;
};

/**
 * Format large numbers for display
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
export const formatPopulation = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + "K";
    }
    return num.toString();
};
