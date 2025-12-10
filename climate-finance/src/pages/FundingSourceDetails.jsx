import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    DollarSign,
    Users,
    Building,
    FileText,
    CheckCircle,
    Clock,
    Target,
    Globe,
    Banknote,
    Play,
    Pause,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import PageLayout from "../components/layouts/PageLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ExportButton from "../components/ui/ExportButton";
import Loading from "../components/ui/Loading";
import ProgressBar from "../components/ui/ProgressBar";
import FinancialSummaryCard from "../components/ui/FinancialSummaryCard";
import { formatCurrency } from "../utils/formatters";
import { generateOrganizationLogo } from "../utils/svgPlaceholder";
import { fundingSourceApi } from "../services/api";

const FundingSourceDetails = () => {
    const { sourceId } = useParams();
    const navigate = useNavigate();
    const [source, setSource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const fetchFundingSource = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fundingSourceApi.getById(sourceId);
            if (response?.status && response.data) {
                setSource(response.data);
                setRetryCount(0);
            } else {
                setError("Funding source not found");
            }
        } catch (err) {
            console.error("Error fetching funding source:", err);
            setError(err.message || "Error loading funding source data");
        } finally {
            setLoading(false);
        }
    }, [sourceId]);

    useEffect(() => {
        if (sourceId) {
            fetchFundingSource();
        } else {
            setError("No funding source ID provided");
            setLoading(false);
        }
    }, [sourceId, fetchFundingSource]);

    const handleRetry = () => {
        setRetryCount((prev) => prev + 1);
        fetchFundingSource();
    };

    if (loading) {
        return (
            <PageLayout bgColor="bg-gray-50">
                <div className="flex flex-col justify-center items-center min-h-64">
                    <Loading size="lg" />
                    <p className="mt-4 text-gray-600">
                        Loading funding source details...
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

    if (error || !source) {
        return (
            <PageLayout bgColor="bg-gray-50">
                <Card padding={true}>
                    <div className="text-center py-12">
                        <div className="text-red-600 mb-4">
                            <AlertCircle size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {error || "Funding Source Not Found"}
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {error === "No funding source ID provided"
                                ? "Invalid funding source ID provided in the URL."
                                : "The funding source you're looking for doesn't exist or couldn't be loaded."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={handleRetry}
                                leftIcon={<RefreshCw size={16} />}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                Retry
                            </Button>
                            <Button
                                onClick={() => navigate("/funding-sources")}
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Back to Funding Sources
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

    const getTypeIcon = (type) => {
        switch (type) {
            case "UNFCCC":
                return <Globe size={16} />;
            case "Multilateral/Bilateral":
                return <Users size={16} />;
            case "Domestic":
                return <Building size={16} />;
            default:
                return <Banknote size={16} />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "UNFCCC":
                return "bg-green-100 text-green-800";
            case "Multilateral/Bilateral":
                return "bg-blue-100 text-blue-800";
            case "Domestic":
                return "bg-purple-100 text-purple-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const exportData = {
        source: source?.name,
        type: source?.type,
        totalCommitted: source?.total_committed || source?.grant_amount || 0,
        activeProjects: source?.active_projects || 0,
        sectors: source?.sectors || [],
    };

    // Compute active and completed counts from projects (fallbacks if not provided)
    const activeCount =
        source?.projects && Array.isArray(source.projects)
            ? source.projects.filter(
                  (p) =>
                      (p.status || "").toString().toLowerCase() === "active" ||
                      (p.status || "").toString().toLowerCase() === "ongoing"
              ).length
            : source?.active_projects || 0;

    const completedCount =
        source?.projects && Array.isArray(source.projects)
            ? source.projects.filter(
                  (p) => (p.status || "").toString().toLowerCase() === "completed"
              ).length
            : 0;

    return (
        <PageLayout bgColor="bg-gray-50">
            <div className="mb-4 flex items-center">
                <Link
                    to="/funding-sources"
                    className="flex items-center text-purple-600 hover:text-purple-700 transition-colors group"
                >
                    <ArrowLeft
                        size={18}
                        className="mr-2 group-hover:-translate-x-1 transition-transform"
                    />
                    Back to Funding Sources
                </Link>
            </div>

            <div className="layout-container">
                {/* Main Funding Source Card */}
                <Card className="mb-6" padding="p-4 sm:p-6">
                    {/* Top Bar: ID and Export */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-500 font-medium">
                            #{source.funding_source_id || source.id}
                        </span>
                        <ExportButton
                            data={exportData}
                            filename={`${source.name.replace(
                                /\s+/g,
                                "_"
                            )}_report`}
                            title={`${source.name} - Funding Source Report`}
                            subtitle={`Generated on ${new Date().toLocaleDateString()}`}
                            variant="primary"
                            size="sm"
                            className="bg-primary-600 hover:bg-primary-700 text-white"
                            exportFormats={["json", "csv"]}
                        />
                    </div>

                    {/* Logo and Title */}
                    <div className="flex items-start gap-4 mb-6">
                        <img
                            src={generateOrganizationLogo(
                                source.name,
                                source.type,
                                64
                            )}
                            alt={source.name}
                            className="w-16 h-16 rounded-xl border border-gray-200 shadow-sm shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                                {source.name}
                            </h1>
                            <span
                                className={`inline-flex text-sm px-3 py-1 rounded-full font-semibold items-center gap-1 ${getTypeColor(
                                    source.type
                                )}`}
                            >
                                {getTypeIcon(source.type)}
                                {source.type || "Funding Source"}
                            </span>
                        </div>
                    </div>

                    {/* Key Metrics Grid - 3 columns properly justified */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="text-center">
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                                Total Funding Amount
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                                {formatCurrency(
                                    (source.total_grant || 0) + (source.total_loan || 0)
                                )}
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                                Projects
                            </div>
                            <div className="text-lg font-bold text-primary-600">
                                {activeCount} Active{" "}
                                <span className="text-sm text-gray-500 font-medium">
                                    · {completedCount} Completed
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                                Total Projects
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                                {source.projects && Array.isArray(source.projects)
                                    ? source.projects.length
                                    : 0}
                            </div>
                        </div>
                    </div>

                    {/* Funding Details */}
                    <div className="mb-6">
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Funding Information
                            </h3>
                            <div className="space-y-2">
                                {/* Grant Amount */}
                                {parseFloat(source.total_grant || 0) > 0 && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">
                                            Grant Amount
                                        </span>
                                        <span className="text-sm font-semibold text-green-600">
                                            {formatCurrency(source.total_grant)}
                                        </span>
                                    </div>
                                )}
                                {/* Loan Amount */}
                                {parseFloat(source.total_loan || 0) > 0 && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">
                                            Loan Amount
                                        </span>
                                        <span className="text-sm font-semibold text-blue-600">
                                            {formatCurrency(source.total_loan)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Projects List if available */}
                        {source.projects &&
                            Array.isArray(source.projects) &&
                            source.projects.length > 0 && (
                                <div className="space-y-3 mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        Associated Projects
                                    </h3>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {source.projects
                                            .slice(0, 5)
                                            .map((project, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 bg-white border border-gray-200 rounded-lg"
                                                >
                                                    <div className="font-medium text-sm text-gray-900 mb-1">
                                                        {project.title}
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                        <div className="flex gap-x-4">
                                                            Timeline:
                                                            <span className="ml-1">
                                                                {
                                                                    project.beginning
                                                                }{" "}
                                                                <span className="font-bold mx-2">
                                                                    to
                                                                </span>
                                                                {
                                                                    project.closing
                                                                }
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 rounded-full ${
                                                                project.status ===
                                                                "Active"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : project.status ===
                                                                      "Completed"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {project.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        {source.projects.length > 5 && (
                                            <div className="text-center text-sm text-gray-500 py-2">
                                                +{source.projects.length - 5}{" "}
                                                more projects
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                </Card>
            </div>
        </PageLayout>
    );
};

export default FundingSourceDetails;
