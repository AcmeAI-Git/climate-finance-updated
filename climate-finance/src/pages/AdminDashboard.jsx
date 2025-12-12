import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/layouts/PageLayout";
import PageHeader from "../components/layouts/PageHeader";
import Card from "../components/ui/Card";
import Loading from "../components/ui/Loading";
import ErrorState from "../components/ui/ErrorState";
import Button from "../components/ui/Button";
import { projectApi, activityApi } from "../services/api";
import {
    Users,
    FolderTree,
    DollarSign,
    Building2,
    Book,
    BookOpenText,
    Plus,
    User,
    CheckCircle,
    Handshake,
    RefreshCw,
    Trash2,
} from "lucide-react";

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activities, setActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [activitiesError, setActivitiesError] = useState(null);
    const [activitiesLimit, setActivitiesLimit] = useState(10);
    const [hasMoreActivities, setHasMoreActivities] = useState(false);

    // Fetch dashboard statistics and activities
    useEffect(() => {
        fetchDashboardStats();
        fetchRecentActivities();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await projectApi.getDashboardOverviewStats();

            if (!response.status || !response.data) {
                throw new Error("Invalid response data");
            }
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            setError("Failed to load dashboard statistics");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRecentActivities = async (limit = null) => {
        try {
            setActivitiesLoading(true);
            setActivitiesError(null);
            const fetchLimit = limit || activitiesLimit;
            const response = await activityApi.getRecentActivities(fetchLimit);
            
            console.log("Recent activities response:", response);
            
            if (response.status && response.data) {
                console.log("Activities data:", response.data);
                const activitiesData = Array.isArray(response.data) ? response.data : [];
                setActivities(activitiesData);
                // If we got exactly the limit, there might be more activities
                setHasMoreActivities(activitiesData.length === fetchLimit);
            } else {
                console.warn("Invalid response format:", response);
                setActivitiesError("Failed to load recent activities: Invalid response format");
                setActivities([]);
                setHasMoreActivities(false);
            }
        } catch (error) {
            console.error("Error fetching recent activities:", error);
            setActivitiesError(`Failed to load recent activities: ${error.message || "Unknown error"}`);
            setActivities([]);
            setHasMoreActivities(false);
        } finally {
            setActivitiesLoading(false);
        }
    };

    const handleLoadMoreActivities = () => {
        const newLimit = activitiesLimit + 10;
        setActivitiesLimit(newLimit);
        fetchRecentActivities(newLimit);
    };

    const handleLogout = () => {
        logout();
        navigate("/admin/login");
    };

    // Map activity icon names to actual icon components
    const getActivityIcon = (iconName) => {
        const iconMap = {
            Plus: Plus,
            FolderTree: FolderTree,
            User: User,
            DollarSign: DollarSign,
            Building2: Building2,
            Book: Book,
            BookOpenText: BookOpenText,
            CheckCircle: CheckCircle,
            Trash2: Trash2,
        };
        const IconComponent = iconMap[iconName] || Plus;
        return <IconComponent className="w-4 h-4" />;
    };

    // Map activity color to Tailwind classes
    const getActivityColorClasses = (color) => {
        const colorMap = {
            primary: {
                bg: "bg-primary-50",
                border: "border-primary-100",
                hover: "hover:bg-primary-100",
                iconBg: "bg-primary-100",
                iconText: "text-primary-600",
            },
            success: {
                bg: "bg-success-50",
                border: "border-success-100",
                hover: "hover:bg-success-100",
                iconBg: "bg-success-100",
                iconText: "text-success-600",
            },
            warning: {
                bg: "bg-warning-50",
                border: "border-warning-100",
                hover: "hover:bg-warning-100",
                iconBg: "bg-warning-100",
                iconText: "text-warning-600",
            },
            info: {
                bg: "bg-info-50",
                border: "border-info-100",
                hover: "hover:bg-info-100",
                iconBg: "bg-info-100",
                iconText: "text-info-600",
            },
            blue: {
                bg: "bg-blue-50",
                border: "border-blue-100",
                hover: "hover:bg-blue-100",
                iconBg: "bg-blue-100",
                iconText: "text-blue-600",
            },
        };
        return colorMap[color] || colorMap.primary;
    };

    const menuItems = [
        {
            title: "Project Management",
            description: "Add, edit, and manage projects",
            icon: <FolderTree size={20} />,
            path: "/admin/projects",
            color: "bg-primary-600",
        },
        {
            title: "Project Approval",
            description: "Review and approve pending project submissions",
            icon: <CheckCircle size={20} />,
            path: "/admin/project-approval",
            color: "bg-info-600",
        },
        {
            title: "User Management",
            description: "Manage administrators and permissions",
            icon: <Users size={20} />,
            path: "/admin/users",
            color: "bg-success-600",
            disabled: user?.role === "admin",
        },
        {
            title: "Funding Sources",
            description: "Manage funding sources",
            icon: <DollarSign size={20} />,
            path: "/admin/funding-sources",
            color: "bg-warning-600",
        },
        {
            title: "Agencies",
            description: "Manage agencies",
            icon: <Building2 size={20} />,
            path: "/admin/agencies",
            color: "bg-primary-500",
        },
        {
            title: "Delivery Partners",
            description: "Manage delivery partners",
            icon: <Handshake size={20} />,
            path: "/admin/delivery-partners",
            color: "bg-primary-500",
        },
        {
            title: "Repository Approval",
            description: "Review and approve pending repository submissions",
            icon: <Book size={20} />,
            path: "/admin/repository-approval",
            color: "bg-success-500",
        },
        {
            title: "Repository Management",
            description: "Edit, and manage repositories",
            icon: <BookOpenText size={20} />,
            path: "/admin/repository-management",
            color: "bg-success-500",
        },
    ];

    if (isLoading) {
        return (
            <PageLayout bgColor="bg-gray-50">
                <div className="flex justify-center items-center min-h-64">
                    <Loading size="lg" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout bgColor="bg-gray-50">
            {/* Page Header - Using reusable component */}
            <PageHeader
                title="Admin Portal"
                backPath="/"
                backText="Back to Main Site"
                showUserInfo={true}
                showLogout={true}
                onLogout={handleLogout}
            />

            {error && (
                <ErrorState
                    title="Dashboard Error"
                    message={error}
                    onRefresh={fetchDashboardStats}
                    showRefresh={true}
                    className="mb-6"
                />
            )}

            {/* Quick Actions Menu */}
            <Card padding="p-4 sm:p-6" className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItems.map((item, index) =>
                        item.disabled ? (
                            <div
                                key={index}
                                className="group flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                            >
                                <div
                                    className={`p-3 rounded-xl ${item.color} opacity-50`}
                                >
                                    {item.icon}
                                </div>
                                <div className="ml-4">
                                    <div className="font-semibold text-gray-500">
                                        {item.title}
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Link
                                key={index}
                                to={item.path}
                                className="group flex items-center p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 hover:shadow-medium"
                            >
                                <div
                                    className={`p-3 rounded-xl ${item.color} group-hover:scale-105 transition-transform duration-200`}
                                >
                                    {item.icon}
                                </div>
                                <div className="ml-4">
                                    <div className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                                        {item.title}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {item.description}
                                    </p>
                                </div>
                            </Link>
                        )
                    )}
                </div>
            </Card>

            {/* Recent Activity */}
            <Card padding="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Recent Activity
                    </h2>
                    <Button
                        variant="ghost"
                        leftIcon={
                            <RefreshCw
                                size={16}
                                className={activitiesLoading ? "animate-spin" : ""}
                            />
                        }
                        onClick={() => {
                            setActivitiesLimit(10);
                            fetchRecentActivities(10);
                        }}
                        disabled={activitiesLoading}
                        loading={activitiesLoading}
                    >
                        {activitiesLoading ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
                {activitiesLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loading size="md" />
                    </div>
                ) : activitiesError ? (
                    <div className="text-center py-8">
                        <p className="text-red-600 mb-2">{activitiesError}</p>
                        <button
                            onClick={fetchRecentActivities}
                            className="text-sm text-purple-600 hover:text-purple-700 underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No recent activity to display</p>
                        <p className="text-xs text-gray-400 mt-2">
                            Activities from the last 30 days will appear here
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {activities.map((activity, index) => {
                                const colors = getActivityColorClasses(activity.activity_color);
                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center p-4 ${colors.bg} rounded-xl border ${colors.border} ${colors.hover} transition-colors duration-200`}
                                    >
                                        <div className={`p-2 ${colors.iconBg} rounded-full`}>
                                            <span className={colors.iconText}>
                                                {getActivityIcon(activity.activity_icon)}
                                            </span>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {activity.activity_title}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {activity.activity_description}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {activity.time_ago}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {hasMoreActivities && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleLoadMoreActivities}
                                    disabled={activitiesLoading}
                                    className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {activitiesLoading ? "Loading..." : `Load More (Showing ${activities.length} of recent activities)`}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </PageLayout>
    );
};

export default AdminDashboard;
