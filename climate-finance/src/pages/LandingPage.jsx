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
import { useLanguage } from '../context/LanguageContext';
import { translateChartData, getChartTitle } from '../utils/chartTranslations';



const LandingPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();
    const { language } = useLanguage();

    // API data states
    const [overviewStats, setOverviewStats] = useState([]);
    const [projectsByStatus, setProjectsByStatus] = useState([]);
    const [regionalData, setRegionalData] = useState([]);

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
            ] = await Promise.all([
                projectApi.getOverviewStats(),
                projectApi.getByStatus(),
                projectApi.getRegionalDistribution(),
            ]);

            // Set overview stats
            if (overviewResponse.status && overviewResponse.data) {
                const data = overviewResponse.data;
                
                setOverviewStats([
                    {
                        title: "Total Climate Finance",
                        value: formatCurrency(data.total_climate_finance || 0),
                        change: "All-time total"
                    },
                    {
                        title: "Total Projects",
                        value: data.total_projects || 0,
                        change: "All projects"
                    },
                    {
                        title: "Active Projects",
                        value: data.active_projects || 0,
                        change: "Currently active"
                    },
                    {
                        title: "Completed Projects",
                        value: data.completed_projects || 0,
                        change: "Successfully completed"
                    }
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

            // Set regional data for map and chart
            if (regionalResponse.status && Array.isArray(regionalResponse.data)) {
                setRegionalData(
                    regionalResponse.data.map((item) => ({
                        region: item.location_name
                            .replace(" Division", " Div.")
                            .replace("Chittagong", "Chattogram")
                            .replace("Barishal", "Barisal"),
                        active: Number(item.active_projects) || 0,
                        completed: Number(item.completed_projects) || 0,
                        total: Number(item.total_projects) || 0,
                    }))
                );
            } else {
                setRegionalData([]);
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setError("Failed to load dashboard data. Please try again.");

            // Clear all data on error
            setOverviewStats([]);
            setProjectsByStatus([]);
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
        if (overviewStats.length === 0) {
            return null;
        }

        return {
            overview: overviewStats,
            projectsByStatus,
            regionalData,
            summary: {
                totalProjects:
                    overviewStats.find((s) => s.title.includes("Projects"))
                        ?.value || 0,
                totalFunding:
                    overviewStats.find((s) => s.title.includes("Finance"))
                        ?.value || 0,
                activeSources:
                    overviewStats.find((s) => s.title.includes("Sources"))
                        ?.value || 0,
            },
        };
    };

    // Add icons to stats
    const statsData = overviewStats.map((stat, index) => {
        const colors = ["success", "warning", "primary", "success"];
        const icons = [
            <DollarSign size={20} />, // Total Climate Finance
            <FolderTree size={20} />, // Total Projects
            <TrendingUp size={20} />, // Active Projects
            <CheckCircle size={20} />, // Completed Projects
        ];

        return {
            ...stat,
            color: colors[index],
            icon: icons[index],
        };
    });

    const translatedProjectsByStatus = translateChartData(projectsByStatus, language, 'status');

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
                subtitle={
                    language === "bn"
                        ? (
                            <span className="no-translate">
                                বাংলাদেশে জলবায়ু অর্থায়নের প্রবাহ রিয়েল-টাইমে ট্র্যাক, বিশ্লেষণ ও চিত্রায়িত করুন—সহজ ও বিস্তারিত প্রতিবেদনের মাধ্যমে।
                            </span>
                        ) : (
                            <span className="no-translate">
                                Track, analyze and visualize climate finance flows in Bangladesh with real-time overview and comprehensive reporting.
                            </span>
                        )
                }
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
                <div className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
                    {regionalData.length > 0 && <BangladeshMapComponent data={regionalData} />}
                </div>
            </div>

            {/* Charts Section - Pie Chart and Bar Chart Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div
                    className="animate-fade-in-up"
                    style={{ animationDelay: "600ms" }}
                >
                    {projectsByStatus.length > 0 ? (
                        <PieChartComponent
                            title={getChartTitle(language, 'projectsByStatus')}
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
                <div className="animate-fade-in-up" style={{ animationDelay: "700ms" }}>
                    {regionalData.length > 0 ? (
                        <BarChartComponent
                            title="Regional Distribution"
                            data={regionalData}
                            xAxisKey="region"
                            bars={[
                                { dataKey: "active", name: "Active Projects", fill: "#8B5CF6" },
                                { dataKey: "completed", name: "Completed Projects", fill: "#A78BFA" }
                            ]}
                        />
                    ) : (
                        <Card hover padding={true}>
                            <div className="h-[300px] flex items-center justify-center">
                                <p className="text-gray-500">No regional data available</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div
                className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl border border-primary-200 animate-fade-in-up"
                style={{ animationDelay: "900ms" }}
            >
                <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Explore Climate Finance Data
                    </h3>
                    <p className="text-gray-600">
                        Access detailed reports and analytics
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
