// Enhanced search configurations for different entities
export const SEARCH_CONFIGS = {
    projects: {
        searchFields: [
            { key: "title", label: "Project Title", weight: 3 },
            { key: "project_id", label: "Project ID", weight: 3 },
            { key: "objectives", label: "Objectives", weight: 2 },
            { key: "description", label: "Description", weight: 2 },
        ],
        filters: [], // Will be populated dynamically by custom config
    },
    agencies: {
        searchFields: [
            { key: "name", label: "Agency Name", weight: 3 },
            { key: "agency_id", label: "Agency ID", weight: 3 },
            { key: "description", label: "Description", weight: 2 },
        ],
        filters: [
            {
                key: "type",
                label: "Agency Type",
                options: [
                    { value: "All", label: "All Types" },
                    { value: "Government", label: "Government" },
                    { value: "NGO", label: "NGO" },
                    { value: "International", label: "International" },
                    { value: "Private", label: "Private" },
                    { value: "Academic", label: "Academic" },
                ],
            },
            {
                key: "country",
                label: "Country",
                options: [
                    { value: "All", label: "All Countries" },
                    { value: "Bangladesh", label: "Bangladesh" },
                    { value: "International", label: "International" },
                    { value: "USA", label: "USA" },
                    { value: "UK", label: "UK" },
                    { value: "Germany", label: "Germany" },
                    { value: "Japan", label: "Japan" },
                    { value: "Netherlands", label: "Netherlands" },
                ],
            },
            {
                key: "specialization",
                label: "Specialization",
                options: [
                    { value: "All", label: "All Specializations" },
                    { value: "Climate Change", label: "Climate Change" },
                    { value: "Environment", label: "Environment" },
                    { value: "Development", label: "Development" },
                    { value: "Finance", label: "Finance" },
                    { value: "Energy", label: "Energy" },
                    { value: "Agriculture", label: "Agriculture" },
                ],
            },
        ],
    },
    fundingSources: {
        searchFields: [
            { key: "name", label: "Source Name", weight: 3 },
            { key: "funding_source_id", label: "Source ID", weight: 3 },
            { key: "dev_partner", label: "Development Partner", weight: 2 },
        ],
        // filters: [
        //   {
        //     key: 'type',
        //     label: 'Source Type',
        //     options: [
        //       { value: 'All', label: 'All Types' },
        //       { value: 'Multilateral', label: 'Multilateral' },
        //       { value: 'Bilateral', label: 'Bilateral' },
        //       { value: 'Private', label: 'Private' },
        //       { value: 'Domestic', label: 'Domestic' },
        //       { value: 'Climate Fund', label: 'Climate Fund' }
        //     ]
        //   },
        //   {
        //     key: 'region',
        //     label: 'Region',
        //     options: [
        //       { value: 'All', label: 'All Regions' },
        //       { value: 'Global', label: 'Global' },
        //       { value: 'Asia', label: 'Asia' },
        //       { value: 'Europe', label: 'Europe' },
        //       { value: 'North America', label: 'North America' },
        //       { value: 'Africa', label: 'Africa' }
        //     ]
        //   },
        //   {
        //     key: 'status',
        //     label: 'Status',
        //     options: [
        //       { value: 'All', label: 'All Status' },
        //       { value: 'Active', label: 'Active' },
        //       { value: 'Completed', label: 'Completed' },
        //       { value: 'Pipeline', label: 'Pipeline' },
        //       { value: 'Closed', label: 'Closed' }
        //     ]
        //   }
        // ]
    },
};
