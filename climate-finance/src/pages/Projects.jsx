import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { projectApi, fundingSourceApi, agencyApi, deliveryPartnerApi } from "../services/api";
import { formatCurrency } from "../utils/formatters";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import PieChartComponent from "../components/charts/PieChartComponent";
import LineChartComponent from "../components/charts/LineChartComponent";
import PageLayout from "../components/layouts/PageLayout";
import PageHeader from "../components/layouts/PageHeader";
import SearchFilter from "../components/ui/SearchFilter";
import Loading from "../components/ui/Loading";
import ExportButton from "../components/ui/ExportButton";
import Pagination from "../components/ui/Pagination";
import {
    FolderOpen,
    Activity,
    DollarSign,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    MapPin,
} from "lucide-react";
import MultiSelect from "../components/ui/MultiSelect";
import { useLanguage } from "../context/LanguageContext";
import { translateChartData, getChartTitle } from "../utils/chartTranslations";
import { chartDescriptions } from "../constants/chartDescriptions";

const Transliteration = (type, language) => {
    if (language === "bn") {
        if (type === "Adaptation") return "অ্যাডাপটেশন";
        if (type === "Mitigation") return "মিটিগেশন";
        if (type === "Trend" || type === "trend") return "ট্রেন্ড";
    }
    return type;
};

const Projects = () => {
    const navigate = useNavigate();
    const [projectsList, setProjectsList] = useState([]);
    const [overviewStats, setOverviewStats] = useState([]);
    const [projectsByStatus, setProjectsByStatus] = useState([]);
    const [projectTrend, setProjectTrend] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // Filter states - using arrays for multi-select support
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState({
        status: [],
        geographic_division: [],
        implementing_entity_id: [],
        executing_agency_id: [],
        delivery_partner_id: [],
        funding_source_id: [],
        sector: [],
        type: [],
        hotspot_vulnerability_type: [],
        hotspot_types: [],
        districts: [],
        equity_marker: [],
    });
    
    // Year range filter (separate from dropdown filters)
    const [yearRange, setYearRange] = useState({ min: null, max: null });

    // Add filtered projects state
    const [filteredProjects, setFilteredProjects] = useState([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);

    const [implementingEntities, setImplementingEntities] = useState([]);
    const [executingAgencies, setExecutingAgencies] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [fundingSources, setFundingSources] = useState([]);
    
    // Districts data for filtering based on divisions
    const [districtsData, setDistrictsData] = useState({});

    const { language } = useLanguage();

    useEffect(() => {
        fetchAllProjectData();
    }, []);

    useEffect(() => {
        // Fetch agencies (unified), delivery partners, and funding sources
        agencyApi.getAll().then((res) => {
            if (res?.status && Array.isArray(res.data)) {
                // Use unified agency list for both implementing and executing
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

    const fetchAllProjectData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [projectsResponse, statusResponse, trendResponse] =
                await Promise.all([
                    projectApi.getAll(),
                    projectApi.getByStatus(),
                    projectApi.getTrend(),
                ]);

            if (
                projectsResponse?.status &&
                Array.isArray(projectsResponse.data)
            ) {
                setProjectsList(projectsResponse.data);
                setFilteredProjects(projectsResponse.data);

                // Calculate stats from projects
                const projects = projectsResponse.data;
                const overviewData = {
                    total_projects: projects.length,
                    active_projects: projects.filter(
                        (p) =>
                            p.status === "Active" ||
                            p.status === "Ongoing" ||
                            p.status === "active" ||
                            p.status === "ongoing"
                    ).length,
                    total_investment: projects.reduce(
                        (sum, p) => sum + Number(p.total_cost_usd || 0),
                        0
                    ),
                    completed_projects: projects.filter(
                        (p) =>
                            p.status === "Completed" ||
                            p.status === "Implemented"
                    ).length,
                };

                setOverviewStats([
                    {
                        title: "Total Investment",
                        value: formatCurrency(
                            overviewData.total_investment
                        ),
                        change: "",
                    },
                    {
                        title: "Active Projects",
                        value: overviewData.active_projects,
                        change: "",
                    },
                    {
                        title: "Completed Projects",
                        value: overviewData.completed_projects,
                        change: "",
                    },
                    {
                        title: "Total Projects",
                        value: overviewData.total_projects,
                        change: "",
                    },
                ]);
            } else {
                setProjectsList([]);
                setFilteredProjects([]);
                setOverviewStats([]);
            }

            if (statusResponse?.status && Array.isArray(statusResponse.data)) {
                setProjectsByStatus(statusResponse.data);
            } else {
                setProjectsByStatus([]);
            }

            if (trendResponse?.status && Array.isArray(trendResponse.data)) {
                setProjectTrend(trendResponse.data);
            } else {
                setProjectTrend([]);
            }

            setRetryCount(0);
        } catch (error) {
            setError(
                error.message ||
                    "Failed to load project data. Please try again."
            );
            setProjectsList([]);
            setFilteredProjects([]);
            setOverviewStats([]);
            setProjectsByStatus([]);
            setProjectTrend([]);
        } finally {
            setIsLoading(false);
        }
    };

    const statsData = Array.isArray(overviewStats)
        ? overviewStats.map((stat, index) => {
              const colors = ["primary", "success", "warning", "primary"];
              const icons = [
                  <FolderOpen size={20} />,
                  <Activity size={20} />,
                  <DollarSign size={20} />,
                  <CheckCircle size={20} />,
              ];
              return {
                  ...stat,
                  color: colors[index] || "primary",
                  icon: icons[index] || <FolderOpen size={20} />,
              };
          })
        : [];

    // Intermediate filtered state (from SearchFilter)
    const [searchFilteredProjects, setSearchFilteredProjects] = useState([]);

    // Set default filtered projects when projectsList changes
    useEffect(() => {
        if (projectsList.length > 0) {
            setSearchFilteredProjects(projectsList);
        }
    }, [projectsList]);

    // Apply year range filter on top of SearchFilter results
    useEffect(() => {
        if (!searchFilteredProjects || searchFilteredProjects.length === 0) {
            setFilteredProjects([]);
            return;
        }

        // If no year range is set, use all searchFiltered projects
        if (!yearRange.min && !yearRange.max) {
            setFilteredProjects(searchFilteredProjects);
            return;
        }

        const filtered = searchFilteredProjects.filter((project) => {
            if (!project.beginning) return true; // Include projects without dates
            const projectYear = parseInt(project.beginning.substring(0, 4), 10);
            if (isNaN(projectYear)) return true;
            
            const minY = yearRange.min || 0;
            const maxY = yearRange.max || 9999;
            return projectYear >= minY && projectYear <= maxY;
        });

        setFilteredProjects(filtered);
    }, [searchFilteredProjects, yearRange]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredProjects]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProjects.slice(startIndex, endIndex);
    }, [filteredProjects, currentPage, itemsPerPage]);

    const getProjectsConfig = useMemo(() => {
        if (!projectsList || projectsList.length === 0) {
            return {
                searchFields: [
                    { key: "title", label: "Project Title", weight: 3 },
                    { key: "project_id", label: "Project ID", weight: 3 },
                    { key: "objectives", label: "Objectives", weight: 2 },
                    { key: "beneficiaries", label: "Beneficiaries", weight: 1 },
                ],
                filters: [],
            };
        }

        // Create unique option arrays using the actual fields available
        // geographic_division may be a string or an array on projects; normalize by flattening
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
        const equityMarkers = Array.from(
            new Set(projectsList.map((p) => p.equity_marker).filter(Boolean))
        ).sort();
        
        // Extract years from beginning date (duration) only
        const allYears = projectsList
            .map((p) => {
                if (p.beginning) {
                    const year = parseInt(p.beginning.substring(0, 4), 10);
                    return isNaN(year) ? null : year;
                }
                return null;
            })
            .filter(Boolean);
        
        const minYear = allYears.length > 0 ? Math.min(...allYears) : null;
        const maxYear = allYears.length > 0 ? Math.max(...allYears) : null;

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
        
        // Check if there are projects without hotspots (need to add "N/A" option)
        const hasProjectsWithoutHotspots = projectsList.some((p) => {
            const hotspotTypes = p.hotspot_types;
            return !hotspotTypes || 
                   (Array.isArray(hotspotTypes) && hotspotTypes.length === 0) ||
                   hotspotTypes === null ||
                   hotspotTypes === undefined;
        });

        // Check if there are projects without delivery partners (need to add "N/A" option)
        const hasProjectsWithoutDeliveryPartners = projectsList.some((p) => {
            const deliveryPartners = p.delivery_partners;
            return !deliveryPartners || 
                   (Array.isArray(deliveryPartners) && deliveryPartners.length === 0) ||
                   deliveryPartners === null ||
                   deliveryPartners === undefined;
        });

        // Get all districts from projects (for fallback)
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

        // Filter districts based on selected divisions
        let districtsList = allDistrictsFromProjects;
        const selectedDivisions = activeFilters.geographic_division || [];
        const hasSelectedDivisions = selectedDivisions.length > 0 && !selectedDivisions.includes("All");
        
        if (hasSelectedDivisions && Object.keys(districtsData).length > 0) {
            // Filter districts based on selected divisions
            let filteredDistricts = [];
            selectedDivisions.forEach((division) => {
                if (districtsData[division] && Array.isArray(districtsData[division])) {
                    filteredDistricts = filteredDistricts.concat(districtsData[division]);
                }
            });
            
            // Remove duplicates and sort
            if (filteredDistricts.length > 0) {
                districtsList = Array.from(new Set(filteredDistricts)).sort();
            }
        } else if (Object.keys(districtsData).length > 0) {
            // If no divisions selected, show all districts from the JSON file
            districtsList = Array.from(
                new Set(
                    Object.values(districtsData).flat()
                )
            ).sort();
        }

        const filters = [];
        filters.push({
            key: "status",
            label: "Status",
            options: [
                { value: "All", label: "All Status" },
                ...statuses.map((status) => ({ value: status, label: status })),
            ],
        });
        
        if (sectors.length > 0) {
            filters.push({
                key: "sector",
                label: "Sector",
                options: [
                    { value: "All", label: "All Sectors" },
                    ...sectors.map((sector) => ({ value: sector, label: sector })),
                ],
            });
        }
        
        if (types.length > 0) {
            filters.push({
                key: "type",
                label: "Project Type",
                options: [
                    { value: "All", label: "All Types" },
                    ...types.map((type) => ({ value: type, label: type })),
                ],
            });
        }
        
        if (divisions.length > 0) {
            filters.push({
                key: "geographic_division",
                label: "Geographic Division",
                options: [
                    { value: "All", label: "All Divisions" },
                    ...divisions.map((division) => ({ value: division, label: division })),
                ],
            });
        }
        
        if (districtsList.length > 0) {
            filters.push({
                key: "districts",
                label: "Districts",
                options: [
                    { value: "All", label: "All Districts" },
                    ...districtsList.map((district) => ({ value: district, label: district })),
                ],
            });
        }
        
        filters.push({
            key: "implementing_entity_id",
            label: "Implementing Entity",
            options: [
                { value: "All", label: "All Implementing Entities" },
                ...implementingEntities.map((e) => ({ value: e.id, label: e.name })),
            ],
        });
        filters.push({
            key: "executing_agency_id",
            label: "Executing Agency",
            options: [
                { value: "All", label: "All Executing Agencies" },
                ...executingAgencies.map((a) => ({ value: a.id, label: a.name })),
            ],
        });
        // Always show delivery partner filter if there are any projects
        if (deliveryPartners.length > 0 || hasProjectsWithoutDeliveryPartners) {
            const options = [
                { value: "All", label: "All Delivery Partners" },
                ...deliveryPartners.map((p) => ({ value: p.id, label: p.name })),
            ];
            
            // Add "N/A" option if there are projects without delivery partners
            if (hasProjectsWithoutDeliveryPartners) {
                options.push({ value: "N/A", label: "N/A" });
            }
            
            filters.push({
                key: "delivery_partner_id",
                label: "Delivery Partner",
                options: options,
            });
        }
        filters.push({
            key: "funding_source_id",
            label: "Funding Source",
            options: [
                { value: "All", label: "All Funding Sources" },
                ...fundingSources.map((f) => ({ value: f.funding_source_id, label: f.name })),
            ],
        });
        
        if (vulnerabilityTypes.length > 0) {
            filters.push({
                key: "hotspot_vulnerability_type",
                label: "Vulnerability Type",
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
                label: "Hotspot Types",
                options: options,
            });
        }
        
        if (equityMarkers.length > 0) {
            filters.push({
                key: "equity_marker",
                label: "Equity Marker",
                options: [
                    { value: "All", label: "All Equity Markers" },
                    ...equityMarkers.map((marker) => ({
                        value: marker,
                        label: marker.charAt(0).toUpperCase() + marker.slice(1),
                    })),
                ],
            });
        }

        return {
            searchFields: [
                { key: "title", label: "Project Title", weight: 3 },
                { key: "project_id", label: "Project ID", weight: 3 },
                { key: "objectives", label: "Objectives", weight: 2 },
                { key: "beneficiaries", label: "Beneficiaries", weight: 1 },
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
            yearRange: { minYear, maxYear },
        };
    }, [projectsList, implementingEntities, executingAgencies, deliveryPartners, fundingSources, activeFilters.geographic_division, districtsData]);

    const getStatusColor = (status) => {
        switch (status) {
            case "Active":
                return "bg-green-100 text-green-700";
            case "Completed":
                return "bg-blue-100 text-blue-700";
            case "Planning":
                return "bg-yellow-100 text-yellow-700";
            case "On Hold":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getTimelineYears = (beginning, closing) => {
        if (!beginning && !closing) return null;
        
        // Handle "Ongoing" string
        if (closing === "Ongoing" || closing === "ongoing") {
            const startDate = new Date(beginning);
            if (!isNaN(startDate.getTime())) {
                const startYear = startDate.getFullYear();
                return `${startYear} - Ongoing`;
            }
        }
        
        // Extract years from dates
        const startDate = beginning ? new Date(beginning) : null;
        const endDate = closing ? new Date(closing) : null;
        
        if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();
            
            if (startYear === endYear) {
                return `${startYear}`;
            }
            return `${startYear} - ${endYear}`;
        }
        
        // Fallback: try to extract year from string if date parsing fails
        if (beginning) {
            const yearMatch = beginning.match(/\d{4}/);
            if (yearMatch) {
                return closing && closing !== "Ongoing" 
                    ? `${yearMatch[0]} - ${closing.match(/\d{4}/)?.[0] || closing}`
                    : yearMatch[0];
            }
        }
        
        return null;
    };

    const handleViewDetails = (e, projectId) => {
        e.stopPropagation();
        navigate(`/projects/${projectId}`);
    };

    const getExportData = () => {
        if (filteredProjects.length === 0) {
            return null;
        }

        return {
            projects: filteredProjects,
            overview: overviewStats,
            chartData: {
                status: projectsByStatus,
                trend: projectTrend,
            },
            filters: {
                searchTerm,
                activeFilters,
            },
            summary: {
                totalProjects: filteredProjects.length,
                totalBudget: filteredProjects.reduce(
                    (sum, p) => sum + (p.total_cost_usd || 0),
                    0
                ),
            },
        };
    };

    // Translate category labels for status
    const translatedProjectsByStatus = translateChartData(
        projectsByStatus,
        language,
        "status"
    );

    if (isLoading) {
        return (
            <PageLayout bgColor="bg-gray-50">
                <div className="flex flex-col justify-center items-center min-h-64">
                    <Loading size="lg" />
                    <p className="mt-4 text-gray-600">
                        Loading project data...
                    </p>
                    {retryCount > 0 && (
                        <p className="mt-2 text-sm text-gray-500">
                            Retry attempt: {retryCount}
                        </p>
                    )}
                </div>
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout bgColor="bg-gray-50">
                <Card padding={true}>
                    <div className="text-center py-12">
                        <div className="text-red-600 mb-4">
                            <AlertCircle size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Unable to Load Project Data
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {error}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => fetchAllProjectData()}
                                leftIcon={<RefreshCw size={16} />}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                Retry
                            </Button>
                            <Button
                                onClick={() => navigate("/admin")}
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Go to Dashboard
                            </Button>
                        </div>
                        {retryCount > 2 && (
                            <p className="mt-4 text-sm text-gray-500">
                                If the problem persists, please contact the
                                system administrator.
                            </p>
                        )}
                    </div>
                </Card>
            </PageLayout>
        );
    }

    return (
        <PageLayout bgColor="bg-gray-50">
            <PageHeader
                title="Projects"
                subtitle="Explore climate finance projects across Bangladesh"
                actions={
                    <ExportButton
                        data={getExportData()}
                        filename="climate_projects"
                        title="Climate Finance Projects"
                        subtitle="Comprehensive list of climate projects in Bangladesh"
                        variant="export"
                        exportFormats={["json", "csv"]}
                        className="w-full sm:w-auto"
                    />
                }
            />

            {statsData.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statsData.map((stat, index) => (
                            <div
                                key={index}
                                className="animate-fade-in-up h-full"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <StatCard
                                    title={stat.title}
                                    value={stat.value}
                                    change={stat.change}
                                    color={stat.color}
                                    icon={stat.icon}
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mb-8 text-center italic">
                        {chartDescriptions.projectsStats}
                    </p>
                </>
            ) : (
                <div className="mb-8">
                    <Card padding={true}>
                        <div className="text-center py-6">
                            <AlertCircle
                                size={24}
                                className="mx-auto text-gray-400 mb-2"
                            />
                            <p className="text-gray-600">
                                Statistics unavailable
                            </p>
                        </div>
                    </Card>
                </div>
            )}

            {/* Status Pie Chart */}
            <div className="animate-fade-in-up mb-6" style={{ animationDelay: "400ms" }}>
                <Card hover padding={true}>
                    {projectsByStatus.length > 0 ? (
                        <PieChartComponent
                            title={getChartTitle(language, "projectsByStatus")}
                            data={translatedProjectsByStatus}
                            valueKey="value"
                            nameKey="name"
                        />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="text-center">
                                <AlertCircle
                                    size={24}
                                    className="mx-auto text-gray-400 mb-2"
                                />
                                <p className="text-gray-600">
                                    No status data available
                                </p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Project Trend Line Chart */}
            {projectTrend.length > 0 && (
                <div className="animate-fade-in-up  mb-6" style={{ animationDelay: "600ms" }}>
                    <Card hover padding={true}>
                        <LineChartComponent
                            title={Transliteration(
                                getChartTitle(language, "projectByYear"),
                                language
                            )}
                            data={projectTrend}
                            xAxisKey="year"
                            yAxisKey="projects"
                            scrollable={true}
                            lineName={Transliteration(
                                getChartTitle(language, "projectYear"),
                                language
                            )}
                            formatYAxis={false}
                        />
                        <p className="text-sm text-gray-500 mt-4 text-center italic">
                            {chartDescriptions.projectTrend}
                        </p>
                    </Card>
                </div>
            )}

            <Card hover className="mb-6" padding={true}>
                <div className="border-b border-gray-100 pb-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">
                        Climate Finance Projects
                    </h3>

                    <SearchFilter
                        data={projectsList}
                        onFilteredData={setSearchFilteredProjects}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Search projects by title, ID, objectives..."
                        entityType="projects"
                        customConfig={getProjectsConfig}
                        activeFilters={activeFilters}
                        onFiltersChange={setActiveFilters}
                        showAdvancedSearch={true}
                        multiSelect={true}
                        onClearAll={() => {
                            setSearchTerm("");
                            setActiveFilters({
                                status: [],
                                geographic_division: [],
                                implementing_entity_id: [],
                                executing_agency_id: [],
                                delivery_partner_id: [],
                                funding_source_id: [],
                                sector: [],
                                type: [],
                                hotspot_vulnerability_type: [],
                                hotspot_types: [],
                                districts: [],
                                equity_marker: [],
                            });
                            setYearRange({ min: null, max: null });
                        }}
                    />
                    
                    {/* Year Range Filter */}
                    {getProjectsConfig.yearRange.minYear && getProjectsConfig.yearRange.maxYear && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    Filter by Year:
                                </label>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="start-year" className="text-sm text-gray-600">
                                            From:
                                        </label>
                                        <input
                                            id="start-year"
                                            type="number"
                                            value={yearRange.min || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '') {
                                                    setYearRange(prev => ({ ...prev, min: null }));
                                                    return;
                                                }
                                                const year = parseInt(value, 10);
                                                if (!isNaN(year)) {
                                                    setYearRange(prev => ({ ...prev, min: year }));
                                                }
                                            }}
                                            onBlur={(e) => {
                                                const value = e.target.value;
                                                if (value === '') return;
                                                const year = parseInt(value, 10);
                                                if (!isNaN(year)) {
                                                    // Validate and adjust on blur
                                                    if (year < getProjectsConfig.yearRange.minYear) {
                                                        setYearRange(prev => ({ ...prev, min: getProjectsConfig.yearRange.minYear }));
                                                    } else if (yearRange.max && year > yearRange.max) {
                                                        setYearRange({ min: year, max: year });
                                                    }
                                                }
                                            }}
                                            placeholder={getProjectsConfig.yearRange.minYear.toString()}
                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <span className="text-gray-400">—</span>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="end-year" className="text-sm text-gray-600">
                                            To:
                                        </label>
                                        <input
                                            id="end-year"
                                            type="number"
                                            value={yearRange.max || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '') {
                                                    setYearRange(prev => ({ ...prev, max: null }));
                                                    return;
                                                }
                                                const year = parseInt(value, 10);
                                                if (!isNaN(year)) {
                                                    setYearRange(prev => ({ ...prev, max: year }));
                                                }
                                            }}
                                            onBlur={(e) => {
                                                const value = e.target.value;
                                                if (value === '') return;
                                                const year = parseInt(value, 10);
                                                if (!isNaN(year)) {
                                                    // Validate and adjust on blur
                                                    if (year > getProjectsConfig.yearRange.maxYear) {
                                                        setYearRange(prev => ({ ...prev, max: getProjectsConfig.yearRange.maxYear }));
                                                    } else if (yearRange.min && year < yearRange.min) {
                                                        setYearRange({ min: year, max: year });
                                                    }
                                                }
                                            }}
                                            placeholder={getProjectsConfig.yearRange.maxYear.toString()}
                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    {(yearRange.min || yearRange.max) && (
                                        <button
                                            onClick={() => setYearRange({ min: null, max: null })}
                                            className="text-xs text-purple-600 hover:text-purple-700 underline ml-2"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 ml-auto">
                                    Available: {getProjectsConfig.yearRange.minYear} - {getProjectsConfig.yearRange.maxYear}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {projectsList.length === 0 ? (
                    <div className="text-center py-12">
                        <FolderOpen
                            size={48}
                            className="mx-auto text-gray-400 mb-4"
                        />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No projects available
                        </h3>
                        <p className="text-gray-500 mb-4">
                            There are currently no projects in the system.
                        </p>
                        <Button
                            onClick={() => fetchAllProjectData()}
                            leftIcon={<RefreshCw size={16} />}
                            variant="outline"
                        >
                            Refresh
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {paginatedProjects.map((project, index) => (
                            <div
                                key={project.project_id || `project-${index}`}
                                className="animate-fade-in-up"
                                style={{
                                    animationDelay: `${(index % 9) * 100}ms`,
                                }}
                            >
                                <div
                                    className="group bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 h-full flex flex-col"
                                >
                                    <div className="p-4 sm:p-6 flex flex-col h-full min-h-80">
                                        <div className="mb-4 min-h-[100px] flex flex-col justify-start">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2 line-clamp-2 text-base sm:text-lg leading-tight">
                                                {project.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-3 flex-1">
                                                {project.objectives ||
                                                    project.description ||
                                                    "No description available"}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4 min-h-8 items-start">
                                            <span
                                                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                                    project.status
                                                )}`}
                                            >
                                                {project.status}
                                            </span>
                                            {project.hotspot_types && 
                                             Array.isArray(project.hotspot_types) && 
                                             project.hotspot_types.length > 0 ? (
                                                <>
                                                    {project.hotspot_types.map((hotspot, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800"
                                                            title={hotspot}
                                                        >
                                                            <MapPin size={12} />
                                                            <span className="line-clamp-1 max-w-[120px]">{hotspot}</span>
                                                        </span>
                                                    ))}
                                                </>
                                            ) : (
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
                                                    title="No hotspot assigned"
                                                >
                                                    <MapPin size={12} />
                                                    N/A
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-3 mb-4 flex-1">
                                            {project.total_cost_usd && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 font-medium">
                                                        Total Budget:
                                                    </span>
                                                    <span className="text-green-600 font-semibold text-xs sm:text-sm">
                                                        {formatCurrency(
                                                            project.total_cost_usd
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            {getTimelineYears(project.beginning, project.closing) && (
                                                <div className="text-sm">
                                                    <span className="text-gray-600 font-medium">
                                                        Duration:
                                                    </span>
                                                    <div className="text-gray-700 mt-1 text-xs">
                                                        {getTimelineYears(project.beginning, project.closing)}
                                                    </div>
                                                </div>
                                            )}

                                            {project.agencies &&
                                                project.agencies.length > 0 && (
                                                    <div className="text-sm">
                                                        <span className="text-gray-600 font-medium">
                                                            Agency:
                                                        </span>
                                                        <div className="text-gray-700 mt-1 line-clamp-2 text-xs">
                                                            {project.agencies
                                                                .map(
                                                                    (agency) =>
                                                                        agency.name
                                                                )
                                                                .join(", ")}
                                                        </div>
                                                    </div>
                                                )}

                                            {project.funding_sources &&
                                                project.funding_sources.length >
                                                    0 && (
                                                    <div className="text-sm">
                                                        <span className="text-gray-600 font-medium">
                                                            Funding Source:
                                                        </span>
                                                        <div className="text-gray-700 mt-1 line-clamp-2 text-xs">
                                                            {project.funding_sources
                                                                .map(
                                                                    (fs) =>
                                                                        fs.name
                                                                )
                                                                .join(", ")}
                                                        </div>
                                                    </div>
                                                )}

                                            {project.beneficiaries && (
                                                <div className="text-sm">
                                                    <span className="text-gray-600 font-medium">
                                                        Beneficiaries:
                                                    </span>
                                                    <div className="text-gray-700 mt-1 line-clamp-2 text-xs">
                                                        {project.beneficiaries}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <div className="text-xs text-gray-500 truncate mr-2">
                                                    ID: {project.project_id}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) =>
                                                        handleViewDetails(
                                                            e,
                                                            project.project_id
                                                        )
                                                    }
                                                    className="text-purple-600 border-purple-600 hover:bg-purple-50 shrink-0 text-xs px-2 py-1"
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {filteredProjects.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredProjects.length}
                        onItemsPerPageChange={setItemsPerPage}
                        itemsPerPageOptions={[6, 9, 12, 24]}
                        className="mt-6 border-t border-gray-100 pt-4"
                    />
                )}

                {filteredProjects.length === 0 && projectsList.length > 0 && (
                    <div className="text-center py-12">
                        <FolderOpen
                            size={48}
                            className="mx-auto text-gray-400 mb-4"
                        />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No projects found
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Try adjusting your search criteria or filters.
                        </p>
                        <Button
                            onClick={() => {
                                setSearchTerm("");
                                setActiveFilters({
                                    status: [],
                                    geographic_division: [],
                                    implementing_entity_id: [],
                                    executing_agency_id: [],
                                    delivery_partner_id: [],
                                    funding_source_id: [],
                                    sector: [],
                                    type: [],
                                    hotspot_vulnerability_type: [],
                                    hotspot_types: [],
                                    districts: [],
                                    equity_marker: [],
                                });
                                setYearRange({ min: null, max: null });
                            }}
                            variant="outline"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </Card>

            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}
        </PageLayout>
    );
};

export default Projects;
