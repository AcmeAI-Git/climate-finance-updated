import React, { useState, useEffect, useMemo } from "react";
import { FolderTree, CheckCircle } from "lucide-react";
import AdminListPage from "../features/admin/AdminListPage";
import { projectApi, agencyApi, deliveryPartnerApi, fundingSourceApi } from "../services/api";
import { getChartTranslation } from "../utils/chartTranslations";

const AdminProjects = () => {
    const [projectsList, setProjectsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [implementingEntities, setImplementingEntities] = useState([]);
    const [executingAgencies, setExecutingAgencies] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [fundingSources, setFundingSources] = useState([]);
    const [districtsData, setDistrictsData] = useState({});

    // Fetch projects data for dynamic filters
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setIsLoading(true);
                const response = await projectApi.getAll();
                if (response?.status && Array.isArray(response.data)) {
                    setProjectsList(response.data);
                } else {
                    setProjectsList([]);
                }
            } catch (error) {
                console.error("Error fetching projects for filters:", error);
                setProjectsList([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Fetch agencies, delivery partners, and funding sources
    useEffect(() => {
        agencyApi.getAll().then((res) => {
            if (res?.status && Array.isArray(res.data)) {
                setImplementingEntities(res.data);
                setExecutingAgencies(res.data);
            } else {
                setImplementingEntities([]);
                setExecutingAgencies([]);
            }
        });
        deliveryPartnerApi.getAll().then((res) => {
            if (res?.status && Array.isArray(res.data)) setDeliveryPartners(res.data);
            else setDeliveryPartners([]);
        });
        fundingSourceApi.getAll().then((res) => {
            if (res?.status && Array.isArray(res.data))
                setFundingSources(res.data);
            else setFundingSources([]);
        });
    }, []);

    // Load districts data from JSON file
    useEffect(() => {
        fetch("/bd-districts.json")
            .then((res) => res.json())
            .then((data) => {
                setDistrictsData(data);
            })
            .catch((err) => console.error("Error loading districts:", err));
    }, []);

    const columns = [
        {
            key: "project_id",
            header: "Project ID",
            searchKey: "project_id",
        },
        {
            key: "title",
            header: "Title",
            searchKey: "title",
        },
        {
            key: "status",
            header: "Status",
            type: "status",
            statusType: "project",
        },
        {
            key: "total_cost_usd",
            header: "Total Cost",
            type: "currency",
        },
        {
            key: "beginning",
            header: "Start Date",
            type: "date",
            dateFormat: "year", // Special flag for year-only display
        },
        {
            key: "closing",
            header: "End Date",
            type: "date",
            dateFormat: "year", // Special flag for year-only display
        },
    ];

    // Generate dynamic filters from actual project data
    const filters = useMemo(() => {
        if (!projectsList || projectsList.length === 0) {
            return [];
        }

        // Create unique option arrays using the actual fields available
        const divisions = Array.from(
            new Set(
                projectsList
                    .flatMap((p) =>
                        Array.isArray(p.geographic_division)
                            ? p.geographic_division
                            : [p.geographic_division]
                    )
                    .filter(Boolean)
            )
        ).sort();

        const statuses = Array.from(
            new Set(projectsList.map((p) => p.status).filter(Boolean))
        ).sort();

        const sectors = Array.from(
            new Set(projectsList.map((p) => p.sector).filter(Boolean))
        ).sort();

        const types = Array.from(
            new Set(projectsList.map((p) => p.type).filter(Boolean))
        ).sort();

        const vulnerabilityTypes = Array.from(
            new Set(projectsList.map((p) => p.hotspot_vulnerability_type).filter(Boolean))
        ).sort();

        const hotspotTypes = Array.from(
            new Set(
                projectsList
                    .flatMap((p) =>
                        Array.isArray(p.hotspot_types)
                            ? p.hotspot_types
                            : p.hotspot_types
                            ? [p.hotspot_types]
                            : []
                    )
                    .filter(Boolean)
            )
        ).sort();

        const equityMarkers = Array.from(
            new Set(projectsList.map((p) => p.equity_marker).filter(Boolean))
        ).sort();

        // Get all districts from projects
        const allDistrictsFromProjects = Array.from(
            new Set(
                projectsList
                    .flatMap((p) =>
                        Array.isArray(p.districts)
                            ? p.districts
                            : [p.districts]
                    )
                    .filter(Boolean)
            )
        ).sort();

        // Check if there are projects without hotspots
        const hasProjectsWithoutHotspots = projectsList.some((p) => {
            const hotspotTypes = p.hotspot_types;
            return !hotspotTypes || 
                   (Array.isArray(hotspotTypes) && hotspotTypes.length === 0) ||
                   hotspotTypes === null ||
                   hotspotTypes === undefined;
        });

        // Check if there are projects without delivery partners
        const hasProjectsWithoutDeliveryPartners = projectsList.some((p) => {
            const deliveryPartners = p.delivery_partners || p.delivery_partner;
            return !deliveryPartners || 
                   (Array.isArray(deliveryPartners) && deliveryPartners.length === 0) ||
                   deliveryPartners === null ||
                   deliveryPartners === undefined;
        });

        const filters = [];
        
        filters.push({
            key: "status",
            defaultValue: "All",
            options: [
                { value: "All", label: "All Status" },
                ...statuses.map((status) => ({ value: status, label: status })),
            ],
        });
        
        if (sectors.length > 0) {
            filters.push({
                key: "sector",
                defaultValue: "All",
                options: [
                    { value: "All", label: "All Sectors" },
                    ...sectors.map((sector) => ({ value: sector, label: sector })),
                ],
            });
        }
        
        if (types.length > 0) {
            filters.push({
                key: "type",
                defaultValue: "All",
                options: [
                    { value: "All", label: "All Types" },
                    ...types.map((type) => ({ value: type, label: type })),
                ],
            });
        }
        
        if (divisions.length > 0) {
            filters.push({
                key: "geographic_division",
                defaultValue: "All",
                options: [
                    { value: "All", label: "All Divisions" },
                    ...divisions.map((division) => ({ value: division, label: division })),
                ],
            });
        }
        
        if (allDistrictsFromProjects.length > 0) {
            filters.push({
                key: "districts",
                defaultValue: "All",
                options: [
                    { value: "All", label: "All Districts" },
                    ...allDistrictsFromProjects.map((district) => ({ value: district, label: district })),
                ],
            });
        }
        
        filters.push({
            key: "implementing_entity_id",
            defaultValue: "All",
            options: [
                { value: "All", label: "All Implementing Entities" },
                ...implementingEntities.map((e) => ({ value: e.id || e.agency_id, label: e.name })),
            ],
        });
        
        filters.push({
            key: "executing_agency_id",
            defaultValue: "All",
            options: [
                { value: "All", label: "All Executing Agencies" },
                ...executingAgencies.map((a) => ({ value: a.id || a.agency_id, label: a.name })),
            ],
        });
        
        // Always show delivery partner filter if there are any projects
        if (deliveryPartners.length > 0 || hasProjectsWithoutDeliveryPartners) {
            const options = [
                { value: "All", label: "All Delivery Partners" },
                ...deliveryPartners.map((p) => ({ value: p.id || p.partner_id, label: p.name })),
            ];
            
            // Add "N/A" option if there are projects without delivery partners
            if (hasProjectsWithoutDeliveryPartners) {
                options.push({ value: "N/A", label: "N/A" });
            }
            
            filters.push({
                key: "delivery_partner_id",
                defaultValue: "All",
                options: options,
            });
        }
        
        filters.push({
            key: "funding_source_id",
            defaultValue: "All",
            options: [
                { value: "All", label: "All Funding Sources" },
                ...fundingSources.map((f) => ({ value: f.funding_source_id, label: f.name })),
            ],
        });
        
        if (vulnerabilityTypes.length > 0) {
            filters.push({
                key: "hotspot_vulnerability_type",
                defaultValue: "All",
                options: [
                    { value: "All", label: "All Vulnerability Types" },
                    ...vulnerabilityTypes.map((type) => ({ value: type, label: type })),
                ],
            });
        }
        
        // Always show hotspot filter if there are any projects
        if (hotspotTypes.length > 0 || hasProjectsWithoutHotspots) {
            const options = [
                { value: "All", label: "All Hotspot Types" },
                ...hotspotTypes.map((type) => ({ value: type, label: type })),
            ];
            
            // Add "N/A" option if there are projects without hotspots
            if (hasProjectsWithoutHotspots) {
                options.push({ value: "N/A", label: "N/A" });
            }
            
            filters.push({
                key: "hotspot_types",
                defaultValue: "All",
                options: options,
            });
        }
        
        if (equityMarkers.length > 0) {
            filters.push({
                key: "equity_marker",
                defaultValue: "All",
                options: [
                    { value: "All", label: "All Equity Markers" },
                    ...equityMarkers.map((marker) => ({
                        value: marker,
                        label: marker.charAt(0).toUpperCase() + marker.slice(1),
                    })),
                ],
            });
        }

        return filters;
    }, [projectsList, implementingEntities, executingAgencies, deliveryPartners, fundingSources]);

    // Create custom config for SearchFilter with enhanced search fields
    const customConfig = useMemo(() => {
        return {
            searchFields: [
                { key: "title", label: "Project Title", weight: 3 },
                { key: "project_id", label: "Project ID", weight: 3 },
                { key: "objectives", label: "Objectives", weight: 2 },
                { key: "beneficiaries", label: "Beneficiaries", weight: 1 },
                { key: "direct_beneficiaries", label: "Direct Beneficiaries", weight: 1 },
                { key: "indirect_beneficiaries", label: "Indirect Beneficiaries", weight: 1 },
                {
                    key: "hotspot_vulnerability_type",
                    label: "Vulnerability Type",
                    weight: 1,
                },
                {
                    key: "beneficiary_description",
                    label: "Beneficiary Description",
                    weight: 1,
                },
                { key: "assessment", label: "Assessment", weight: 1 },
            ],
            filters: filters,
        };
    }, [filters]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">
                        Loading project data...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <AdminListPage
                title="Project Management"
                subtitle="Add, edit, and manage climate projects"
                apiService={projectApi}
                entityName="project"
                columns={columns}
                searchPlaceholder="Search projects by title, ID, objectives..."
                filters={filters}
                customConfig={customConfig}
                multiSelect={true}
            />
        </div>
    );
};

export default AdminProjects;
