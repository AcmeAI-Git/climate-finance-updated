import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    AlertCircle,
    RefreshCw,
    Calendar,
    MapPin,
    DollarSign,
    Users,
    Building,
    CheckCircle,
    TrendingUp,
    Droplets,
} from "lucide-react";
import PageLayout from "../components/layouts/PageLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ExportButton from "../components/ui/ExportButton";
import Loading from "../components/ui/Loading";
import ProgressBar from "../components/ui/ProgressBar";
import FinancialSummaryCard from "../components/ui/FinancialSummaryCard";
import { formatCurrency } from "../utils/formatters";
import { projectApi } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import {
    getImplementingAgenciesTransliteration,
    getExecutingAgenciesTransliteration,
    getGenderAndEquityTransliteration,
    getGenderInclusionTransliteration,
    getEquityMarkerTransliteration,
    getEquityDescriptionTransliteration,
} from "../utils/transliteration";

// Base URL for file downloads
const BASE_URL =
    import.meta.env.VITE_BASE_URL || "https://climate-finance-new.onrender.com";

const ProjectDetails = () => {
    const { id, projectId } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const actualId = id || projectId;

    const fetchProjectWithRelatedData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const projectResponse = await projectApi.getById(actualId);
            if (!projectResponse?.status || !projectResponse.data) {
                setError("Project not found");
                return;
            }

            const projectData = projectResponse.data;

            // Normalize location_segregation - ensure it's a string, not an object
            let normalizedLocationSegregation = projectData.location_segregation;
            if (normalizedLocationSegregation && typeof normalizedLocationSegregation === 'object') {
                // If it's an object (like {}), convert to null
                normalizedLocationSegregation = null;
            } else if (normalizedLocationSegregation && typeof normalizedLocationSegregation === 'string' && normalizedLocationSegregation.trim() === '') {
                // If it's an empty string, convert to null
                normalizedLocationSegregation = null;
            }

            // Prefer full related objects when they exist (mock API sometimes returns both IDs and full objects)
            const enrichedProject = {
                ...projectData,
                // Normalize location_segregation
                location_segregation: normalizedLocationSegregation,
                // New agency types
                projectImplementingEntities:
                    projectData.projectImplementingEntities || projectData.implementing_entities || [],
                projectExecutingAgencies:
                    projectData.projectExecutingAgencies || projectData.executing_agencies || [],
                projectDeliveryPartners:
                    projectData.projectDeliveryPartners || projectData.delivery_partners || [],
                // Legacy agencies (for backward compatibility)
                projectAgencies:
                    projectData.projectAgencies || projectData.agencies || [],
                projectLocations:
                    projectData.projectLocations || projectData.locations || [],
                projectFundingSources:
                    projectData.projectFundingSources ||
                    projectData.funding_sources ||
                    [],
                projectSDGs: projectData.projectSDGs || projectData.sdgs || [],
            };

            setProject(enrichedProject);
            setRetryCount(0);
        } catch (err) {
            console.error("Error fetching project:", err);
            setError(err.message || "Error loading project data");
        } finally {
            setLoading(false);
        }
    }, [actualId]);

    useEffect(() => {
        if (actualId) {
            fetchProjectWithRelatedData();
        } else {
            setError("No project ID provided");
            setLoading(false);
        }
    }, [actualId, fetchProjectWithRelatedData]);

    const handleRetry = () => {
        setRetryCount((prev) => prev + 1);
        fetchProjectWithRelatedData();
    };

    if (loading) {
        return (
            <PageLayout bgColor="bg-gray-50">
                <div className="flex flex-col justify-center items-center min-h-64">
                    <Loading size="lg" />
                    <p className="mt-4 text-gray-600">
                        Loading project details...
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

    if (error || !project) {
        return (
            <PageLayout bgColor="bg-gray-50">
                <Card padding={true}>
                    <div className="text-center py-12">
                        <div className="text-red-600 mb-4">
                            <AlertCircle size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {error || "Project Not Found"}
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {error === "No project ID provided"
                                ? "Invalid project ID provided in the URL."
                                : "The project you're looking for doesn't exist or couldn't be loaded."}
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
                                onClick={() => navigate("/projects")}
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Back to Projects
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

    const getTimeline = (proj) => {
        if (proj.beginning && proj.closing) {
            // Handle "Ongoing" string
            if (proj.closing === "Ongoing" || proj.closing === "ongoing") {
                const startYear = new Date(proj.beginning).getFullYear();
                if (!isNaN(startYear)) {
                    return `${startYear} - Ongoing`;
                }
            }
            
            // Extract years from dates
            const startDate = new Date(proj.beginning);
            const endDate = new Date(proj.closing);
            
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                const startYear = startDate.getFullYear();
                const endYear = endDate.getFullYear();
                
                if (startYear === endYear) {
                    return `${startYear}`;
                }
                return `${startYear} - ${endYear}`;
            }
        }
        return proj.timeline || "Not specified";
    };

    const getTotalBudget = (proj) => {
        const val =
            proj.total_cost_usd || proj.totalFunding || proj.totalBudget || 0;
        const num = parseFloat(
            typeof val === "string" ? val.replace(/,/g, "") : val
        );
        return Number.isFinite(num) ? num : 0;
    };

    const exportData = {
        project: [project],
    };

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

    return (
        <PageLayout bgColor="bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Link
                        to="/projects"
                        className="flex items-center text-purple-600 hover:text-purple-700 transition-colors group"
                    >
                        <ArrowLeft
                            size={18}
                            className="mr-2 group-hover:-translate-x-1 transition-transform"
                        />
                        Back to Projects
                    </Link>
                </div>

                {/* Main Project Card - Fixed Typography & Colors */}
                <Card className="mb-6" padding="p-4 sm:p-6">
                    {/* Top Bar: Status, ID, Export */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <span
                                className={`text-sm px-3 py-1 rounded-full font-semibold ${getStatusColor(
                                    project.status
                                )}`}
                            >
                                {project.status}
                            </span>
                        </div>
                        <ExportButton
                            data={exportData}
                            filename={`${project.project_id}_report`}
                            title={`${project.title} - Project Report`}
                            subtitle={`Generated on ${new Date().toLocaleDateString()}`}
                            variant="primary"
                            size="sm"
                            className="bg-primary-600 hover:bg-primary-700 text-white"
                            exportFormats={["json", "csv"]}
                        />
                    </div>

                    {/* Title and Description */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                            {project.title || "Untitled Project"}
                        </h1>
                        <p className="text-base text-gray-600 leading-relaxed">
                            {project.objectives ||
                                project.description ||
                                "No description available"}
                        </p>
                    </div>

                    {/* Timeline and Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-base">
                        <div>
                            <span className="font-semibold text-gray-800">
                                Timeline:
                            </span>
                            <span className="text-gray-600 ml-2">
                                {getTimeline(project)}
                            </span>
                        </div>

                        {project.approval_fy && (
                            <div>
                                <span className="font-semibold text-gray-800">
                                    Approval FY:
                                </span>
                                <span className="text-gray-600 ml-2">
                                    {project.approval_fy}
                                </span>
                            </div>
                        )}

                        {project.direct_beneficiaries !== undefined &&
                            project.direct_beneficiaries !== null && (
                                <div className="flex items-center gap-x-2">
                                    <span className="font-semibold text-gray-800">
                                        Direct Beneficiaries:
                                    </span>
                                    <span className="text-gray-600 ml-2">
                                        {project.direct_beneficiaries > 0
                                            ? Number(
                                                  project.direct_beneficiaries
                                              ).toLocaleString()
                                            : "Not Available"}
                                    </span>
                                </div>
                            )}
                        {project.indirect_beneficiaries !== undefined &&
                            project.indirect_beneficiaries !== null && (
                                <div className="flex items-center gap-x-2">
                                    <div className="font-semibold text-gray-800">
                                        Indirect Beneficiaries:
                                    </div>
                                    <span className="text-gray-600 ml-2">
                                        {project.indirect_beneficiaries > 0
                                            ? Number(
                                                  project.indirect_beneficiaries
                                              ).toLocaleString()
                                            : "Not Available"}
                                    </span>
                                </div>
                            )}
                    </div>
                </Card>

                {/* Secondary Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Implementing Entities */}
                    <Card padding="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 notranslate" translate="no">
                            {getImplementingAgenciesTransliteration(language)}
                        </h3>
                        {Array.isArray(project.projectImplementingEntities) &&
                        project.projectImplementingEntities.length > 0 ? (
                            <div className="space-y-2">
                                {project.projectImplementingEntities.map((entity, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-blue-50 rounded-lg border border-blue-100"
                                    >
                                        <div className="font-medium text-gray-900">
                                            {entity.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Building size={24} className="mx-auto mb-2" />
                                <p className="font-medium">No implementing entities</p>
                            </div>
                        )}
                    </Card>

                    {/* Executing Agencies */}
                    <Card padding="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 notranslate" translate="no">
                            {getExecutingAgenciesTransliteration(language)}
                        </h3>
                        {Array.isArray(project.projectExecutingAgencies) &&
                        project.projectExecutingAgencies.length > 0 ? (
                            <div className="space-y-2">
                                {project.projectExecutingAgencies.map((agency, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-green-50 rounded-lg border border-green-100"
                                    >
                                        <div className="font-medium text-gray-900">
                                            {agency.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Building size={24} className="mx-auto mb-2" />
                                <p className="font-medium">No executing agencies</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Delivery Partners and Funding Sources */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Delivery Partners */}
                    <Card padding="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Delivery Partners
                        </h3>
                        {Array.isArray(project.projectDeliveryPartners) &&
                        project.projectDeliveryPartners.length > 0 ? (
                            <div className="space-y-2">
                                {project.projectDeliveryPartners.map((partner, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-purple-50 rounded-lg border border-purple-100"
                                    >
                                        <div className="font-medium text-gray-900">
                                            {partner.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Building size={24} className="mx-auto mb-2" />
                                <p className="font-medium">No delivery partners</p>
                            </div>
                        )}
                    </Card>

                    {/* Funding Sources */}
                    <Card padding="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Funding Sources
                        </h3>
                        {Array.isArray(project.projectFundingSources) &&
                        project.projectFundingSources.length > 0 ? (
                            <div className="space-y-2">
                                {project.projectFundingSources
                                    .slice(0, 6)
                                    .map((source, index) => (
                                        <div
                                            key={index}
                                            className="p-3 bg-orange-50 rounded-lg border border-orange-100"
                                        >
                                            <div className="font-medium text-gray-900">
                                                {source.name}
                                            </div>
                                            <div className="mt-2 text-sm text-gray-600 flex gap-3">
                                                {/* Grant */}
                                                {parseFloat(source.grant_amount || 0) > 0 && (
                                                    <div>
                                                        <div className="text-xs text-gray-500">
                                                            Grant
                                                        </div>
                                                        <div className="font-semibold">
                                                            {formatCurrency(parseFloat(source.grant_amount))}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Loan */}
                                                {parseFloat(source.loan_amount || 0) > 0 && (
                                                    <div>
                                                        <div className="text-xs text-gray-500">
                                                            Loan
                                                        </div>
                                                        <div className="font-semibold">
                                                            {formatCurrency(parseFloat(source.loan_amount))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                {project.projectFundingSources.length > 6 && (
                                    <div className="text-sm text-gray-500 text-center font-medium">
                                        +
                                        {project.projectFundingSources.length -
                                            6}{" "}
                                        more sources
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <DollarSign
                                    size={24}
                                    className="mx-auto mb-2"
                                />
                                <p className="font-medium">
                                    No funding sources
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* WASH Component and Financial Summary - Side by Side */}
                <div
                    className={`grid grid-cols-1 ${
                        project.wash_component?.presence ? "lg:grid-cols-2" : ""
                    } gap-6 mb-6`}
                >
                    {/* WASH Component */}
                    {project.wash_component?.presence && (
                        <Card padding="p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                WASH Component
                            </h3>
                            <div className="space-y-4">
                                <div className="text-center p-4 bg-primary-50 rounded-lg border border-primary-100">
                                    <div className="text-sm text-gray-600 font-medium mb-1">
                                        WASH Percentage
                                    </div>
                                    <div className="text-2xl font-bold text-primary-700">
                                        {(() => {
                                            const pct = parseFloat(
                                                project.wash_component
                                                    .wash_percentage || 0
                                            );
                                            return Number.isFinite(pct)
                                                ? pct.toLocaleString(
                                                      undefined,
                                                      {
                                                          maximumFractionDigits: 2,
                                                      }
                                                  )
                                                : 0;
                                        })()}
                                        %
                                    </div>
                                </div>
                                {project.wash_component.description && (
                                    <div>
                                        <div className="text-sm text-gray-600 font-medium mb-1">
                                            Description
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            {project.wash_component.description}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Financial Summary */}
                    <Card padding="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Financial Summary
                        </h3>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 text-center p-4 bg-primary-50 rounded-lg border border-primary-100">
                                <div className="text-sm text-gray-600 font-medium mb-2">
                                    Total Cost
                                </div>
                                <div className="text-xl font-bold text-primary-700">
                                    {formatCurrency(getTotalBudget(project))}
                                </div>
                            </div>
                            {/* Grant */}
                            {parseFloat(project.gef_grant || 0) > 0 && (
                                <div className="flex-1 text-center p-4 bg-success-50 rounded-lg border border-success-100">
                                    <div className="text-sm text-gray-600 font-medium mb-2">
                                        Grant
                                    </div>
                                    <div className="text-xl font-bold text-success-700">
                                        {formatCurrency(parseFloat(project.gef_grant))}
                                    </div>
                                </div>
                            )}
                            {/* Co-financing */}
                            {parseFloat(project.cofinancing || 0) > 0 && (
                                <div className="flex-1 text-center p-4 bg-warning-50 rounded-lg border border-warning-100">
                                    <div className="text-sm text-gray-600 font-medium mb-2">
                                        Co-financing
                                    </div>
                                    <div className="text-xl font-bold text-warning-700">
                                        {formatCurrency(parseFloat(project.cofinancing))}
                                    </div>
                                </div>
                            )}
                            {/* Loan */}
                            {parseFloat(project.loan_amount || 0) > 0 && (
                                <div className="flex-1 text-center p-4 bg-primary-50 rounded-lg border border-primary-100">
                                    <div className="text-sm text-gray-600 font-medium mb-2">
                                        Loan
                                    </div>
                                    <div className="text-xl font-bold text-primary-700">
                                        {formatCurrency(parseFloat(project.loan_amount))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* New Project Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Beneficiaries and Vulnerability */}
                    <Card padding="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Beneficiaries & Vulnerability
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-x-2">
                                <div className="text-sm text-gray-600 font-medium mb-1">
                                    Direct Beneficiaries:
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {" "}
                                    {project.direct_beneficiaries > 0
                                        ? project.direct_beneficiaries.toLocaleString()
                                        : "Not Available"}
                                </div>
                            </div>

                            <div className="flex items-center gap-x-2">
                                <div className="text-sm text-gray-600 font-medium mb-1">
                                    Indirect Beneficiaries
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {project.indirect_beneficiaries > 0
                                        ? project.indirect_beneficiaries.toLocaleString()
                                        : "Not Available"}
                                </div>
                            </div>
                            {project.beneficiary_description && (
                                <div>
                                    <div className="text-md text-gray-600 font-semibold mb-1">
                                        Beneficiary Description
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        {project.beneficiary_description}
                                    </div>
                                </div>
                            )}
                            {/* Hotspot Types (multi-select) */}
                            {Array.isArray(project.hotspot_types) && project.hotspot_types.length > 0 && (
                                <div>
                                    <div className="text-md text-gray-600 font-semibold mb-2">
                                        Hotspot Types
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {project.hotspot_types.map((type, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded font-medium"
                                            >
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {project.vulnerability_type && (
                                <div>
                                    <div className="text-md text-gray-600 font-semibold mb-1">
                                        Vulnerability Type
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        {project.vulnerability_type}
                                    </div>
                                </div>
                            )}
                            
                        </div>
                    </Card>

                    {/* Gender & Equity */}
                    <Card padding="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 notranslate" translate="no">
                            {getGenderAndEquityTransliteration(language)}
                        </h3>
                        <div className="space-y-6">
                            {project.gender_inclusion && (
                                <div>
                                    <div className="text-md text-gray-600 font-semibold mb-1 notranslate" translate="no">
                                        {getGenderInclusionTransliteration(language)}
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        {project.gender_inclusion}
                                    </div>
                                </div>
                            )}
                            {project.equity_marker && (
                                <div>
                                    <div className="text-md text-gray-600 font-semibold mb-1 notranslate" translate="no">
                                        {getEquityMarkerTransliteration(language)}
                                    </div>
                                    <div className="text-sm text-gray-700 capitalize">
                                        {project.equity_marker}
                                    </div>
                                </div>
                            )}
                            {project.equity_marker_description && (
                                <div>
                                    <div className="text-sm text-gray-600 font-medium mb-1 notranslate" translate="no">
                                        {getEquityDescriptionTransliteration(language)}
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        {project.equity_marker_description}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Geographic Information and Alignment - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Geographic Information */}
                    {(project.geographic_division ||
                        (project.districts &&
                            project.districts.length > 0) ||
                        project.additional_location_info) && (
                        <Card padding="p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Geographic Information
                            </h3>
                            <div className="space-y-6">
                                {project.geographic_division && (
                                    <div>
                                        <div className="text-md text-gray-600 font-semibold mb-1">
                                            Division
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            {Array.isArray(
                                                project.geographic_division
                                            )
                                                ? project.geographic_division
                                                      .filter((d) => d !== "Nationwide")
                                                      .join(", ")
                                                : project.geographic_division}
                                        </div>
                                    </div>
                                )}
                                {project.districts &&
                                    project.districts.length > 0 &&
                                    !project.districts.includes("N/A") && (
                                        <div>
                                            <div className="text-md text-gray-600 font-semibold mb-1">
                                                Districts
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {project.districts.map(
                                                    (district, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium"
                                                        >
                                                            {district}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                {project.additional_location_info && (
                                    <div>
                                        <div className="text-md text-gray-600 font-semibold mb-1">
                                            Additional Location Information
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            {project.additional_location_info}
                                        </div>
                                    </div>
                                )}
                                {project.location_segregation && (
                                    <div>
                                        <div className="text-md text-gray-600 font-semibold mb-1">
                                            Location Segregation
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            {project.location_segregation}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Alignment */}
                    <Card padding="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Alignment
                        </h3>
                        <div className="space-y-6">
                            {project.projectSDGs.length > 0 && (
                                <div>
                                    <div className="text-md text-gray-600 font-semibold mb-1">
                                        SDGs
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {project.projectSDGs.map(
                                            (sdg, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-indigo-50 text-indigo-800 text-xs rounded font-medium"
                                                >
                                                    SDG{" "}
                                                    {sdg.sdg_number ||
                                                        sdg.sdg_id}{" "}
                                                    — {sdg.title || sdg}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                            {project.other_alignment && project.other_alignment.trim() && (
                                <div>
                                    <div className="text-sm text-gray-600 font-medium mb-1">
                                        Other Alignment (NAP and CFF)
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        {project.other_alignment}
                                    </div>
                                </div>
                            )}
                            {project.alignment_sdg &&
                                project.alignment_sdg.length > 0 && (
                                    <div>
                                        <div className="text-sm text-gray-600 font-medium mb-1">
                                            SDG Alignment
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {project.alignment_sdg.map(
                                                (sdg, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium"
                                                    >
                                                        SDG {sdg}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </Card>
                </div>

                {/* Climate Relevance */}
                {(project.climate_relevance_score ||
                    project.climate_relevance_category ||
                    project.climate_relevance_justification) && (
                    <Card padding="p-4 sm:p-6" className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Climate Relevance
                        </h3>
                        <div className="space-y-4">
                            {project.climate_relevance_score && (
                                <div>
                                    <div className="text-sm text-gray-600 font-medium mb-2">
                                        Climate Relevance Score
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl font-bold text-blue-600">
                                            {project.climate_relevance_score}%
                                        </div>
                                        {project.climate_relevance_category && (
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    project.climate_relevance_category ===
                                                    "High"
                                                        ? "bg-green-100 text-green-800"
                                                        : project.climate_relevance_category ===
                                                          "Moderate-High"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : project.climate_relevance_category ===
                                                          "Moderate"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : project.climate_relevance_category ===
                                                          "Moderate-Low"
                                                        ? "bg-orange-100 text-orange-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {
                                                    project.climate_relevance_category
                                                }
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {project.climate_relevance_justification && (
                                <div>
                                    <div className="text-sm text-gray-600 font-medium mb-1">
                                        Justification
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        {
                                            project.climate_relevance_justification
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Assessment - Full Width at End */}
                {project.assessment && (
                    <Card padding="p-4 sm:p-6" className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Assessment
                        </h3>
                        <div className="text-sm text-gray-700">
                            {project.assessment}
                        </div>
                    </Card>
                )}

                {/* Type and Sector */}
                {(project.type || project.sector) && (
                    <Card padding="p-4 sm:p-6" className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {language === 'bn' ? 'ধরন ও খাত' : 'Type & Sector'}
                        </h3>
                        <div className="space-y-4">
                            {project.type && (
                                <div>
                                    <div className="text-sm text-gray-600 font-medium mb-1">
                                        {language === 'bn' ? 'ধরন' : 'Type'}
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        {language === 'bn' 
                                            ? (project.type === 'Adaptation' ? 'অ্যাডাপ্টেশন' : project.type === 'Mitigation' ? 'মিটিগেশন' : project.type)
                                            : project.type}
                                    </div>
                                </div>
                            )}
                            {project.sector && (
                                <div>
                                    <div className="text-sm text-gray-600 font-medium mb-1">
                                        {language === 'bn' ? 'খাত' : 'Sector'}
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        {(() => {
                                            const sectorTranslations = {
                                                'Agriculture & Food Security': 'কৃষি ও খাদ্য নিরাপত্তা',
                                                'Water & Sanitation': 'পানি ও স্যানিটেশন',
                                                'Energy': 'জ্বালানি',
                                                'Transport & Mobility': 'পরিবহন ও গতিশীলতা',
                                                'Urban Development & Infrastructure': 'শহুরে উন্নয়ন ও অবকাঠামো',
                                                'Forests, Land Use & Nature-Based Solutions': 'বন, ভূমি ব্যবহার ও প্রকৃতি-ভিত্তিক সমাধান',
                                                'Waste & Circular Economy': 'বর্জ্য ও বৃত্তাকার অর্থনীতি',
                                                'Health': 'স্বাস্থ্য',
                                                'Coastal & Marine Systems': 'উপকূলীয় ও সামুদ্রিক ব্যবস্থা',
                                                'Disaster Risk Reduction': 'দুর্যোগ ঝুঁকি হ্রাস',
                                                'Policy, Governance & Finance': 'নীতি, শাসন ও অর্থায়ন',
                                                'Data, ICT & Early Warning Systems': 'ডেটা, আইসিটি ও প্রারম্ভিক সতর্কতা ব্যবস্থা'
                                            };
                                            return language === 'bn' 
                                                ? (sectorTranslations[project.sector] || project.sector)
                                                : project.sector;
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Supporting Documents & Links */}
                {(project.supporting_link || project.supporting_document) && (
                    <Card padding="p-4 sm:p-6" className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Supporting Documents & Links
                        </h3>
                        <div className="space-y-4">
                            {project.supporting_link && (
                                <div>
                                    <div className="text-sm text-gray-600 font-medium mb-1">
                                        Supporting Link
                                    </div>
                                    <div className="text-sm">
                                        {(() => {
                                            // Handle if supporting_link is stored as JSON string or array
                                            let linkUrl = project.supporting_link;
                                            try {
                                                // Try to parse if it's a JSON string
                                                const parsed = JSON.parse(linkUrl);
                                                if (Array.isArray(parsed) && parsed.length > 0) {
                                                    linkUrl = parsed[0]; // Take first URL if array
                                                } else if (typeof parsed === 'string') {
                                                    linkUrl = parsed;
                                                }
                                            } catch {
                                                // Not JSON, use as is
                                            }
                                            
                                            // Clean up if it's still an array-like string
                                            if (typeof linkUrl === 'string' && linkUrl.startsWith('[') && linkUrl.endsWith(']')) {
                                                try {
                                                    const cleaned = JSON.parse(linkUrl);
                                                    linkUrl = Array.isArray(cleaned) && cleaned.length > 0 ? cleaned[0] : linkUrl;
                                                } catch {
                                                    // Keep original if parsing fails
                                                }
                                            }
                                            
                                            return (
                                                <a
                                                    href={linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-purple-600 hover:text-purple-700 underline break-all flex items-center gap-2"
                                                >
                                                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    <span className="break-all">{linkUrl}</span>
                                                </a>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                            {project.supporting_document && (
                                <div>
                                    <div className="text-sm text-gray-600 font-medium mb-1">
                                        Supporting Document
                                    </div>
                                    <div className="text-sm">
                                        <a
                                            href={`${BASE_URL}/document/${project.supporting_document}?download=true`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 underline group"
                                            onClick={(e) => {
                                                // Prevent React Router from handling this as a route
                                                e.stopPropagation();
                                            }}
                                        >
                                            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="break-all">
                                                {project.supporting_document.split('/').pop() || 'Download Document'}
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </PageLayout>
    );
};

export default ProjectDetails;
