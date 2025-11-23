import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    RefreshCw,
    DollarSign,
    TrendingUp,
    Target,
    Activity,
    CheckCircle,
    FolderTree,
    Plus,
} from "lucide-react";
import PageLayout from "../components/layouts/PageLayout";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import BarChartComponent from "../components/charts/BarChartComponent";
import PieChartComponent from "../components/charts/PieChartComponent";
import BangladeshMapComponent from "../components/charts/BangladeshMapComponent";
import Button from "../components/ui/Button";
import Loading from "../components/ui/Loading";
import { useToast } from "../components/ui/Toast";
import { CHART_COLORS } from "../utils/constants";
import { formatCurrency } from "../utils/formatters";
import { projectApi } from "../services/api";
import ExportButton from "../components/ui/ExportButton";
import PageHeader from "../components/layouts/PageHeader";
import { useLanguage } from "../context/LanguageContext";
import { translateChartData, getChartTitle } from "../utils/chartTranslations";
import {
    getDeshboardDescriptionTransliteration,
    getInsightsTransliteration,
} from "../utils/transliteration";
import ResearchDocsCard from "../components/ui/ResearchDocsCard";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();
    const { language } = useLanguage();
    const { isAuthenticated } = useAuth();

    // API data states
    const [overviewStats, setOverviewStats] = useState([]);
    const [projectsByStatus, setProjectsByStatus] = useState([]);
    const [regionalData, setRegionalData] = useState([]);
    const [washDistribution, setWashDistribution] = useState([]);
    const [projects, setProjects] = useState([]);
    const [climateFinanceTrend, setClimateFinanceTrend] = useState([]);

    // Fetch all dashboard data
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all dashboard data in parallel
            const [
                overviewResponse,
                statusResponse,
                regionalResponse,
                projectsResponse,
                climateFinanceTrendResponse,
            ] = await Promise.all([
                projectApi.getOverviewStats(),
                projectApi.getByStatus(),
                projectApi.getRegionalDistribution(),
                projectApi.getAll(),
                projectApi.getClimateFinanceByTrend(),
            ]);

            setProjects(projectsResponse.status ? projectsResponse.data : []);

            // Set overview stats
            if (overviewResponse.status && overviewResponse.data) {
                const data = overviewResponse.data;

                setOverviewStats([
                    {
                        title: "Total Climate Finance",
                        value: `${formatCurrency(
                            Number(data.total_climate_finance || 0)
                        )} M`,
                        change: "",
                    },
                    {
                        title: "Total WASH Finance",
                        value: `${formatCurrency(
                            Number(data.total_wash_finance || 0)
                        )} M`,
                        change: "",
                    },
                    {
                        title: "Total Projects",
                        value: data.total_projects || 0,
                        change: "",
                    },
                    {
                        title: "Average Climate Relevance",
                        value: `${Number(
                            data.avg_climate_relevance || 0
                        ).toFixed(1)}%`,
                        change: "",
                    },
                ]);
            } else {
                setOverviewStats([]);
            }

            // Set projects by status for pie chart
            if (statusResponse.status && Array.isArray(statusResponse.data)) {
                setProjectsByStatus(statusResponse.data);
            } else {
                setProjectsByStatus([]);
            }

            if (
                regionalResponse.status &&
                Array.isArray(regionalResponse.data)
            ) {
                const backendRegional = regionalResponse.data.map((item) => ({
                    region:
                        typeof item.region === "string"
                            ? item.region
                                  .replace(" Division", "")
                                  .replace("Chittagong", "Chattogram")
                                  .replace("Barishal", "Barisal")
                            : String(item.region),
                    active: Number(item.active) || 0,
                    completed: Number(item.completed) || 0,
                    total: Number(item.total) || 0,
                }));

                // Calculate stats from projects if backend values are 0 or missing
                let calculatedRegional = [];
                if (
                    projectsResponse.status &&
                    Array.isArray(projectsResponse.data)
                ) {
                    const projects = projectsResponse.data;
                    const divisionStats = {};

                    projects.forEach((p) => {
                        const division = p.geographic_division;
                        if (!division) return;

                        if (!divisionStats[division]) {
                            divisionStats[division] = {
                                active: 0,
                                completed: 0,
                                total: 0,
                            };
                        }

                        divisionStats[division].total++;

                        if (
                            p.status === "Active" ||
                            p.status === "Ongoing" ||
                            p.status === "active" ||
                            p.status === "ongoing"
                        ) {
                            divisionStats[division].active++;
                        } else if (
                            p.status === "Completed" ||
                            p.status === "Implemented" ||
                            p.status === "completed" ||
                            p.status === "implemented"
                        ) {
                            divisionStats[division].completed++;
                        }
                    });

                    calculatedRegional = Object.entries(divisionStats).map(
                        ([division, stats]) => ({
                            region: division
                                .replace(" Division", " Div.")
                                .replace("Chittagong", "Chattogram")
                                .replace("Barishal", "Barisal"),
                            active: stats.active,
                            completed: stats.completed,
                            total: stats.total,
                        })
                    );
                }

                // Use calculated values if backend has 0s
                const finalRegional = backendRegional.map((item) => {
                    if (item.total === 0) {
                        const calculated = calculatedRegional.find(
                            (c) => c.region === item.region
                        );
                        return calculated || item;
                    }
                    return item;
                });

                setRegionalData(finalRegional);
            } else {
                setRegionalData(regionalResponse.data);
            }

            // Calculate WASH vs Climate Finance distribution
            if (
                projectsResponse.status &&
                Array.isArray(projectsResponse.data)
            ) {
                const projects = projectsResponse.data;
                let washProjects = 0;
                let climateFinanceOnly = 0;

                projects.forEach((project) => {
                    const washComponent = project.wash_component;
                    if (
                        washComponent &&
                        (washComponent.wash_percentage > 0 ||
                            washComponent.presence)
                    ) {
                        washProjects++;
                    } else {
                        climateFinanceOnly++;
                    }
                });

                setWashDistribution([
                    { name: "WASH Projects", value: washProjects },
                    { name: "Climate Finance Only", value: climateFinanceOnly },
                ]);
            } else {
                setWashDistribution([]);
            }

            // Set climate finance trend data
            if (climateFinanceTrendResponse.status && Array.isArray(climateFinanceTrendResponse.data)) {
                setClimateFinanceTrend(climateFinanceTrendResponse.data);
            } else {
                setClimateFinanceTrend([]);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setError("Failed to load dashboard data. Please try again.");

            // Clear all data on error
            setOverviewStats([]);
            setProjectsByStatus([]);
            setWashDistribution([]);
            setClimateFinanceTrend([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchDashboardData();
            if (!error) {
                toast.success("Dashboard data updated successfully");
            }
        } catch {
            toast.error("Failed to refresh data. Please try again.");
        } finally {
            setRefreshing(false);
        }
    };

    // Prepare export data
    const getExportData = () => {
        return {
            overview: overviewStats,
            projectsByStatus,
            regionalData,
            washDistribution,
            projects: projects || [],
        };
    };

    // Add icons to stats
    const statsData = overviewStats.map((stat, index) => {
        const colors = ["success", "info", "warning", "primary"];
        const icons = [
            <DollarSign size={20} />, // Total Climate Finance
            <Activity size={20} />, // Total WASH Finance
            <FolderTree size={20} />, // Total Projects
            <Target size={20} />, // Average Climate Relevance
        ];

        return {
            ...stat,
            color: colors[index],
            icon: icons[index],
        };
    });

    const translatedProjectsByStatus = translateChartData(
        projectsByStatus,
        language,
        "status"
    );

    const getAddProjectPath = () => {
        if (isAuthenticated) {
            return "/admin/projects/new";
        } else {
            return "/projects/new?mode=public";
        }
    };

    const getAddRepositoryPath = () => {
        if (isAuthenticated) {
            return "/admin/repository/new";
        } else {
            return "/repository/new?mode=public";
        }
    };

    if (loading) {
        return (
            <PageLayout bgColor="bg-gray-50">
                <div className="flex justify-center items-center min-h-64">
                    <Loading size="lg" text="Loading dashboard..." />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout bgColor="bg-gray-50">
            <PageHeader
                title="Dashboard"
                subtitle={getDeshboardDescriptionTransliteration(language)}
                actions={
                    <>
                        <Button
                            variant="ghost"
                            leftIcon={
                                <RefreshCw
                                    size={16}
                                    className={refreshing ? "animate-spin" : ""}
                                />
                            }
                            onClick={handleRefresh}
                            disabled={refreshing}
                            loading={refreshing}
                        >
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                        <ExportButton
                            data={getExportData()}
                            filename="climate_finance_dashboard"
                            title="Bangladesh Climate Finance Dashboard"
                            subtitle="Overview of climate finance data and project statistics"
                            variant="export"
                            exportFormats={["pdf", "json", "csv"]}
                            className="w-full sm:w-auto"
                        />
                    </>
                }
            />

            {error && (
                <Card padding={true} className="mb-6">
                    <div className="text-center py-4">
                        <p className="text-red-600 text-sm mb-2">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="text-purple-600 hover:text-purple-700 underline"
                        >
                            Try again
                        </button>
                    </div>
                </Card>
            )}

            {/* Stats Grid */}
            {statsData.length > 0 ? (
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
            ) : (
                <div className="mb-8">
                    <Card padding={true}>
                        <div className="text-center py-6">
                            <p className="text-gray-500">
                                No overview statistics available
                            </p>
                        </div>
                    </Card>
                </div>
            )}

            {/* Map Section - Full Width */}
            <div className="mb-8">
                <div
                    className="animate-fade-in-up"
                    style={{ animationDelay: "500ms" }}
                >
                    {regionalData.length > 0 && (
                        <BangladeshMapComponent data={regionalData} />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div
                    className="animate-fade-in-up"
                    style={{ animationDelay: "600ms" }}
                >
                    {projectsByStatus.length > 0 ? (
                        <PieChartComponent
                            title={getChartTitle(language, "projectsByStatus")}
                            data={translatedProjectsByStatus}
                        />
                    ) : (
                        <Card hover padding={true}>
                            <div className="h-[300px] flex items-center justify-center">
                                <p className="text-gray-500">
                                    No status data available
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
                <div
                    className="animate-fade-in-up"
                    style={{ animationDelay: "650ms" }}
                >
                    {washDistribution.length > 0 ? (
                        <PieChartComponent
                            title={getChartTitle(language, "washvsnonwash")}
                            data={washDistribution}
                        />
                    ) : (
                        <Card hover padding={true}>
                            <div className="h-[300px] flex items-center justify-center">
                                <p className="text-gray-500">
                                    No WASH data available
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            <div className="w-full overflow-hidden">
                <div
                    className="animate-fade-in-up"
                    style={{ animationDelay: "700ms" }}
                >
                    {regionalData.length > 0 ? (
                        <div className="w-full">
                            <div className="w-full">
                                <BarChartComponent
                                    title="Regional Distribution"
                                    data={regionalData}
                                    xAxisKey="region"
                                    bars={[
                                        {
                                            dataKey: "active",
                                            name: "Active Projects",
                                            fill: "#8B5CF6",
                                        },
                                        {
                                            dataKey: "completed",
                                            name: "Completed Projects",
                                            fill: "#A78BFA",
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    ) : (
                        <Card hover padding={true}>
                            <div className="h-[300px] flex items-center justify-center">
                                <p className="text-gray-500">
                                    No regional data available
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
            {/* Yearly Climate Finance Trend */}
            <div className="w-full overflow-hidden">
                <div
                    className="animate-fade-in-up"
                    style={{ animationDelay: "750ms" }}
                >
                    {climateFinanceTrend.length > 0 ? (
                        <BarChartComponent
                            title="Yearly Climate Finance Trend"
                            data={climateFinanceTrend}
                            xAxisKey="year"
                            bars={[{
                                dataKey: "Total_Finance",
                                name: "Total Climate Finance (USD M)",
                                fill: "#8B5CF6", // Match regional distribution bar color
                            }]}
                        />
                    ) : (
                        <Card hover padding={true}>
                            <div className="h-[300px] flex items-center justify-center">
                                <p className="text-gray-500">
                                    No climate finance trend data available
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            <ResearchDocsCard />

            {/* Contribution Note */}
            <div
                className="p-6 bg-linear-to-r from-primary-50 to-primary-100 rounded-2xl border border-primary-200 animate-fade-in-up mb-8"
                style={{ animationDelay: "850ms" }}
            >
                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Contribute to the Tracker
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Help keep the climate finance tracker updated by adding new projects or research documents.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        variant="primary"
                        onClick={() => navigate(getAddProjectPath())}
                        leftIcon={<Plus size={16} />}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        Add Project
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigate(getAddRepositoryPath())}
                        leftIcon={<Plus size={16} />}
                        className="border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                        Add Repository
                    </Button>
                </div>
            </div>

            {/* Quick Actions */}
            <div
                className="p-6 bg-linear-to-r from-primary-50 to-primary-100 rounded-2xl border border-primary-200 animate-fade-in-up"
                style={{ animationDelay: "900ms" }}
            >
                <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Explore Climate Finance Data
                    </h3>
                    <p className="text-gray-600">
                        {getInsightsTransliteration(language)}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        variant="primary"
                        onClick={() => navigate("/projects")}
                        rightIcon={<ArrowRight size={16} />}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        View Projects
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigate("/funding-sources")}
                        rightIcon={<ArrowRight size={16} />}
                        className="border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                        Funding Sources
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
};

export default LandingPage;
