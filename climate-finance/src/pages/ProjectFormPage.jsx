import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
import {
    agencyApi,
    fundingSourceApi,
    projectApi,
    pendingProjectApi,
    implementingEntityApi,
    executingAgencyApi,
    deliveryPartnerApi,
} from "../services/api";
import Button from "../components/ui/Button";
import Loading from "../components/ui/Loading";
import Card from "../components/ui/Card";
import PageLayout from "../components/layouts/PageLayout";
import ProjectFormSections from "../features/admin/ProjectFormSections";
import { ArrowLeft, FolderTree, CheckCircle } from "lucide-react";
import { useToast } from "../components/ui/Toast";
import CheckboxGroup from "../components/ui/CheckboxGroup";
import { useLanguage } from "../context/LanguageContext";

const defaultFormData = {
    project_id: "",
    title: "",
    status: "",
    sector: "",
    type: [],
    total_cost_usd: "",
    gef_grant: "",
    cofinancing: "",
    loan_amount: "0",
    beginning: "",
    closing: "",
    approval_fy: "",
    objectives: "",
    // New separate agency types
    implementing_entity_ids: [],
    executing_agency_ids: [],
    delivery_partner_ids: [],
    // Keep agencies for backward compatibility
    agencies: [],
    funding_sources: [],
    wash_component: {
        presence: false,
        wash_percentage: 0,
        description: "",
    },
    submitter_email: "",

    // New fields for client requirements
    hotspot_types: ["N/A"], // Default to N/A for new projects
    vulnerability_type: "",
    wash_component_description: "",
    direct_beneficiaries: "",
    indirect_beneficiaries: "",
    beneficiary_description: "",
    gender_inclusion: "",
    equity_marker: "",
    equity_marker_description: "",
    assessment: "",
    alignment_sdg: [],
    alignment_nap: "",
    alignment_cff: "",
    geographic_division: [],
    districts: [],
    climate_relevance_score: "",
    climate_relevance_category: "",
    climate_relevance_justification: "",
    location_segregation: "",
    supporting_link: "",
    // Additional new fields
    additional_location_info: "",
    portfolio_type: "",
    funding_source_name: "",
    activities: [],
};

const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
};

const ProjectFormPage = ({ mode = "add", pageTitle, pageSubtitle }) => {
    const { id } = useParams();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(defaultFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [agencies, setAgencies] = useState([]);
    const [implementingEntities, setImplementingEntities] = useState([]);
    const [executingAgencies, setExecutingAgencies] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [fundingSources, setFundingSources] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const { language } = useLanguage();

    // Determine mode based on params, authentication, and URL query
    const urlParams = new URLSearchParams(location.search);
    const urlMode = urlParams.get("mode");

    let actualMode = mode;
    if (id) {
        actualMode = "edit";
    } else if (urlMode === "public") {
        actualMode = "public";
    } else if (!isAuthenticated) {
        actualMode = "public";
    } else if (mode === "add") {
        actualMode = "add";
    }

    const fetchProject = useCallback(async () => {
        try {
            setIsFetching(true);
            setError(null);
            const response = await projectApi.getById(id);
            if (response.status && response.data) {
                const projectData = response.data;

                setFormData({
                    project_id: projectData.project_id || "",
                    title: projectData.title || "",
                    status: projectData.status || "",
                    sector: projectData.sector || "",
                    type: Array.isArray(projectData.type)
                        ? projectData.type
                        : [],
                    total_cost_usd: projectData.total_cost_usd || "",
                    gef_grant: projectData.gef_grant || "",
                    cofinancing: projectData.cofinancing || "",
                    loan_amount: projectData.loan_amount || "0",
                    beginning: formatDateForInput(projectData.beginning),
                    closing: formatDateForInput(projectData.closing),
                    approval_fy: projectData.approval_fy || "",
                    beneficiaries: projectData.beneficiaries || "",
                    objectives: projectData.objectives || "",
                    // New agency types
                    implementing_entity_ids:
                        Array.isArray(projectData.implementing_entity_ids)
                            ? projectData.implementing_entity_ids
                            : [],
                    executing_agency_ids:
                        Array.isArray(projectData.executing_agency_ids)
                            ? projectData.executing_agency_ids
                            : [],
                    delivery_partner_ids:
                        Array.isArray(projectData.delivery_partner_ids)
                            ? projectData.delivery_partner_ids
                            : [],
                    // Keep agencies for backward compatibility
                    agencies:
                        Array.isArray(projectData.agencies) &&
                        projectData.agencies.length > 0 &&
                        typeof projectData.agencies[0] === "number"
                            ? projectData.agencies
                            : projectData.projectAgencies &&
                              Array.isArray(projectData.projectAgencies)
                            ? projectData.projectAgencies.map(
                                  (pa) => pa.agency_id
                              )
                            : [],
                    funding_sources:
                        Array.isArray(projectData.funding_sources) &&
                        projectData.funding_sources.length > 0 &&
                        typeof projectData.funding_sources[0] === "number"
                            ? projectData.funding_sources
                            : projectData.projectFundingSources &&
                              Array.isArray(projectData.projectFundingSources)
                            ? projectData.projectFundingSources.map(
                                  (pfs) => pfs.funding_source_id
                              )
                            : [],
                    wash_component: projectData.wash_component || {
                        presence: false,
                        description: "",
                        wash_percentage: 0,
                    },
                    submitter_email: projectData.submitter_email || "",
                    // FIX: Ensure these are always arrays
                    geographic_division: Array.isArray(
                        projectData.geographic_division
                    )
                        ? projectData.geographic_division
                        : [],
                    districts: Array.isArray(projectData.districts)
                        ? projectData.districts
                        : [],
                    alignment_sdg:
                        Array.isArray(projectData.sdgs) &&
                        projectData.sdgs.length > 0 &&
                        typeof projectData.sdgs[0] === "number"
                            ? projectData.sdgs
                            : projectData.projectSDGs &&
                              Array.isArray(projectData.projectSDGs)
                            ? projectData.projectSDGs.map((ps) => ps.sdg_id)
                            : [],
                    assessment: projectData.assessment || "",
                    // Changed: hotspot_types is now an array
                    // If empty/null/undefined, set to ["N/A"] for explicit N/A selection
                    hotspot_types: Array.isArray(projectData.hotspot_types) && projectData.hotspot_types.length > 0
                        ? projectData.hotspot_types
                        : ["N/A"],
                    vulnerability_type: projectData.vulnerability_type || "",
                    wash_component_description:
                        projectData.wash_component_description || "",
                    direct_beneficiaries:
                        projectData.direct_beneficiaries || "",
                    indirect_beneficiaries:
                        projectData.indirect_beneficiaries || "",
                    beneficiary_description:
                        projectData.beneficiary_description || "",
                    gender_inclusion: projectData.gender_inclusion || "",
                    equity_marker: projectData.equity_marker || "",
                    equity_marker_description:
                        projectData.equity_marker_description || "",
                    alignment_nap: projectData.alignment_nap || "",
                    alignment_cff: projectData.alignment_cff || "",
                    climate_relevance_score:
                        projectData.climate_relevance_score || "",
                    climate_relevance_category:
                        projectData.climate_relevance_category || "",
                    climate_relevance_justification:
                        projectData.climate_relevance_justification || "",
                    location_segregation:
                        projectData.location_segregation || "",
                    supporting_link: projectData.supporting_link || "",
                    // Additional new fields
                    additional_location_info:
                        projectData.additional_location_info || "",
                    portfolio_type: projectData.portfolio_type || "",
                    funding_source_name: projectData.funding_source_name || "",
                    activities: Array.isArray(projectData.activities)
                        ? projectData.activities
                        : [],
                });
            } else {
                throw new Error("Project not found");
            }
        } catch (error) {
            console.error("Error fetching project:", error);
            setError("Failed to load project data");
        } finally {
            setIsFetching(false);
        }
    }, [id]);

    // Fetch project data for edit mode
    useEffect(() => {
        if (actualMode === "edit" && id) {
            fetchProject();
        }
    }, [actualMode, id, fetchProject]);

    // Fetch all required data from APIs
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setIsLoadingData(true);

            // Fetch all data in parallel including new agency types
            const [
                agenciesResponse,
                fundingSourcesResponse,
                implementingEntitiesResponse,
                executingAgenciesResponse,
                deliveryPartnersResponse,
            ] = await Promise.all([
                agencyApi
                    .getAll()
                    .catch(() => ({ status: false, data: [] })),
                fundingSourceApi
                    .getAll()
                    .catch(() => ({ status: false, data: [] })),
                implementingEntityApi
                    .getAll()
                    .catch(() => ({ status: false, data: [] })),
                executingAgencyApi
                    .getAll()
                    .catch(() => ({ status: false, data: [] })),
                deliveryPartnerApi
                    .getAll()
                    .catch(() => ({ status: false, data: [] })),
            ]);

            // Set data or fallback to empty arrays if API calls fail
            setAgencies(
                agenciesResponse.status && agenciesResponse.data
                    ? agenciesResponse.data
                    : []
            );
            setFundingSources(
                fundingSourcesResponse.status && fundingSourcesResponse.data
                    ? fundingSourcesResponse.data
                    : []
            );
            setImplementingEntities(
                implementingEntitiesResponse.status && implementingEntitiesResponse.data
                    ? implementingEntitiesResponse.data
                    : []
            );
            setExecutingAgencies(
                executingAgenciesResponse.status && executingAgenciesResponse.data
                    ? executingAgenciesResponse.data
                    : []
            );
            setDeliveryPartners(
                deliveryPartnersResponse.status && deliveryPartnersResponse.data
                    ? deliveryPartnersResponse.data
                    : []
            );
        } catch (error) {
            console.error("Error fetching form data:", error);
            setAgencies([]);
            setFundingSources([]);
            setImplementingEntities([]);
            setExecutingAgencies([]);
            setDeliveryPartners([]);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Clear error for this field when user starts editing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleWashComponentChange = (washData) => {
        setFormData((prev) => ({
            ...prev,
            wash_component:
                typeof washData === "function"
                    ? washData(prev.wash_component)
                    : washData,
        }));
    };

    const validateFile = (file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
        ];

        if (!file) return null;

        if (!allowedTypes.includes(file.type)) {
            return "Please select a PDF or DOCX file";
        }

        if (file.size > maxSize) {
            return "File size must be less than 10MB";
        }

        return null;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validationError = validateFile(file);
            if (validationError) {
                setErrors((prev) => ({ ...prev, file: validationError }));
                setSelectedFile(null);
            } else {
                setErrors((prev) => ({ ...prev, file: "" }));
                setSelectedFile(file);
            }
        } else {
            setSelectedFile(null);
            setErrors((prev) => ({ ...prev, file: "" }));
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setErrors((prev) => ({ ...prev, file: "" }));
        // Reset the file input
        const fileInput = document.getElementById("project-document");
        if (fileInput) {
            fileInput.value = "";
        }
    };

    // FIX: Updated validation function with proper array checking
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Project title is required";
        }

        // FIX: Properly check if array exists AND has items
        if (
            !Array.isArray(formData.geographic_division) ||
            formData.geographic_division.length === 0
        ) {
            newErrors.geographic_division = "Geographic division is required";
        }

        // FIX: Properly check if array exists AND has items
        if (
            !Array.isArray(formData.districts) ||
            formData.districts.length === 0
        ) {
            newErrors.districts = "At least one district must be selected";
        }

        if (!formData.status) {
            newErrors.status = "Project status is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            // Scroll to top to show errors
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        // Additional validation for public mode
        if (actualMode === "public") {
            if (!formData.submitter_email.trim()) {
                setErrors((prev) => ({
                    ...prev,
                    submitter_email: "Email is required for public submissions",
                }));
                return;
            }
            if (!formData.submitter_email.includes("@")) {
                setErrors((prev) => ({
                    ...prev,
                    submitter_email: "Please enter a valid email address",
                }));
                return;
            }
            if (!formData.objectives.trim()) {
                setErrors((prev) => ({
                    ...prev,
                    objectives: "Project objectives are required",
                }));
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            const totalCost = parseFloat(formData.total_cost_usd) || 0;
            const gefGrant = parseFloat(formData.gef_grant) || 0;
            const cofinancing = parseFloat(formData.cofinancing) || 0;
            const loanAmount = parseFloat(formData.loan_amount) || 0;

            // Create FormData for file upload support
            const formDataToSend = new FormData();

            // Append all project fields as per user sample
            formDataToSend.append("project_id", formData.project_id || "");
            formDataToSend.append("title", formData.title);
            formDataToSend.append("status", formData.status);
            formDataToSend.append("sector", formData.sector);
            formDataToSend.append("type", formData.type.join(","));
            formDataToSend.append("total_cost_usd", totalCost.toString());
            formDataToSend.append("gef_grant", gefGrant.toString());
            formDataToSend.append("cofinancing", cofinancing.toString());
            formDataToSend.append("loan_amount", loanAmount.toString());
            formDataToSend.append("beginning", formData.beginning);
            formDataToSend.append("closing", formData.closing);
            formDataToSend.append(
                "approval_fy",
                formData.approval_fy
                    ? parseInt(formData.approval_fy, 10).toString()
                    : 2025
            );
            formDataToSend.append("objectives", formData.objectives || "");
            formDataToSend.append(
                "submitter_email",
                formData.submitter_email || ""
            );
            // Convert geographic_division array to JSON string before sending
            formDataToSend.append(
                "geographic_division",
                JSON.stringify(formData.geographic_division || [])
            );

            // Convert "N/A" selection to empty array for backend
            const hotspotTypesToSend = formData.hotspot_types && formData.hotspot_types.includes("N/A")
                ? []
                : (formData.hotspot_types || []);
            formDataToSend.append(
                "hotspot_types",
                JSON.stringify(hotspotTypesToSend)
            );
            formDataToSend.append(
                "vulnerability_type",
                formData.vulnerability_type || ""
            );
            formDataToSend.append(
                "wash_component_description",
                formData.wash_component_description || ""
            );
            formDataToSend.append(
                "direct_beneficiaries",
                (parseInt(formData.direct_beneficiaries) || 0).toString()
            );
            formDataToSend.append(
                "indirect_beneficiaries",
                (parseInt(formData.indirect_beneficiaries) || 0).toString()
            );
            formDataToSend.append(
                "beneficiary_description",
                formData.beneficiary_description || ""
            );
            formDataToSend.append(
                "gender_inclusion",
                formData.gender_inclusion || ""
            );
            formDataToSend.append(
                "equity_marker",
                formData.equity_marker || ""
            );
            formDataToSend.append(
                "equity_marker_description",
                formData.equity_marker_description || ""
            );
            formDataToSend.append("assessment", formData.assessment || "");
            formDataToSend.append(
                "alignment_nap",
                formData.alignment_nap || ""
            );
            formDataToSend.append(
                "alignment_cff",
                formData.alignment_cff || ""
            );
            // Safely handle climate relevance score to prevent NaN
            const climateScore = formData.climate_relevance_score
                ? parseFloat(formData.climate_relevance_score)
                : 0;
            formDataToSend.append(
                "climate_relevance_score",
                isNaN(climateScore) ? "0" : climateScore.toString()
            );
            formDataToSend.append(
                "climate_relevance_category",
                formData.climate_relevance_category || ""
            );
            formDataToSend.append(
                "climate_relevance_justification",
                formData.climate_relevance_justification || ""
            );

            // Append file if selected, with filename
            if (selectedFile) {
                formDataToSend.append(
                    "supporting_document",
                    selectedFile,
                    selectedFile.name
                );
            }

            // Append supporting link if provided
            formDataToSend.append(
                "supporting_link",
                formData.supporting_link || ""
            );

            // Append array fields as JSON strings (to match sample)
            // New agency types
            formDataToSend.append(
                "implementing_entity_ids",
                JSON.stringify(formData.implementing_entity_ids || [])
            );
            formDataToSend.append(
                "executing_agency_ids",
                JSON.stringify(formData.executing_agency_ids || [])
            );
            formDataToSend.append(
                "delivery_partner_ids",
                JSON.stringify(formData.delivery_partner_ids || [])
            );
            // Keep agency_ids for backward compatibility
            formDataToSend.append(
                "agency_ids",
                JSON.stringify(formData.agencies || [])
            );
            formDataToSend.append(
                "funding_source_ids",
                JSON.stringify(formData.funding_sources || [])
            );
            formDataToSend.append(
                "districts",
                JSON.stringify(formData.districts || [])
            );
            formDataToSend.append(
                "sdg_ids",
                JSON.stringify(formData.alignment_sdg || [])
            );
            formDataToSend.append(
                "wash_component",
                JSON.stringify({
                    presence: formData.wash_component.presence,
                    wash_percentage:
                        formData.wash_component.wash_percentage || 0,
                    description: formData.wash_component.description || "",
                })
            );

            formDataToSend.append(
                "location_segregation",
                formData.location_segregation || ""
            );

            // Additional new fields
            formDataToSend.append(
                "additional_location_info",
                formData.additional_location_info || ""
            );
            formDataToSend.append(
                "portfolio_type",
                formData.portfolio_type || ""
            );
            formDataToSend.append(
                "funding_source_name",
                formData.funding_source_name || ""
            );
            formDataToSend.append(
                "activities",
                JSON.stringify(formData.activities || [])
            );

            if (actualMode === "public") {
                // Submit to pending projects for public mode
                const response = await pendingProjectApi.submit(formDataToSend);
                if (response.status) {
                    setSuccess(true);
                    setSelectedFile(null); // Reset file state on success
                    toast.success(
                        "Project submitted successfully! It will be visible once approved by an administrator.",
                        "Success!"
                    );
                } else {
                    throw new Error(
                        response.message || "Failed to submit project"
                    );
                }
            } else if (actualMode === "add") {
                const response = await projectApi.add(formDataToSend);
                if (response.status) {
                    toast.success("Project created successfully!", "Success!");
                    navigate("/admin/projects");
                } else {
                    throw new Error(
                        response.message || "Failed to create project"
                    );
                }
            } else if (actualMode === "edit") {
                const response = await projectApi.update(id, formDataToSend);
                if (response.status) {
                    toast.success("Project updated successfully!", "Success!");
                    navigate("/admin/projects");
                } else {
                    throw new Error(
                        response.message || "Failed to update project"
                    );
                }
            }
        } catch (error) {
            console.error("Error saving project:", error);
            setError(
                error.message || "Failed to save project. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData || isFetching) {
        return (
            <PageLayout bgColor="bg-gray-50">
                <div className="flex justify-center items-center min-h-64">
                    <Loading size="lg" />
                </div>
            </PageLayout>
        );
    }

    // Success state for public mode
    if (success && actualMode === "public") {
        return (
            <PageLayout bgColor="bg-gray-50">
                <div className="max-w-2xl mx-auto">
                    <Card padding="p-8">
                        <div className="text-center">
                            <CheckCircle
                                size={64}
                                className="mx-auto text-green-600 mb-6"
                            />
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Project Submitted Successfully!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Thank you for submitting your project. It has
                                been received and will be reviewed by our
                                administrators. You will be notified at{" "}
                                <strong>{formData.submitter_email}</strong> once
                                the review is complete.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-blue-800 text-sm">
                                    <strong>What happens next?</strong>
                                    <br />
                                    • Your project will be reviewed by our team
                                    <br />
                                    • We may contact you for additional
                                    information
                                    <br />• Once approved, your project will be
                                    visible on our platform
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                onClick={() =>
                                    navigate(location.state?.from || "/")
                                }
                                leftIcon={<ArrowLeft size={16} />}
                            >
                                Back to Previous Page
                            </Button>
                        </div>
                    </Card>
                </div>
            </PageLayout>
        );
    }

    if (error && actualMode === "edit") {
        return (
            <PageLayout bgColor="bg-gray-50">
                <Card padding={true}>
                    <div className="text-center py-8">
                        <div className="text-red-600 mb-4">
                            <FolderTree size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {error}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            The project you're looking for could not be found.
                        </p>
                        <Button
                            onClick={() => navigate("/admin/projects")}
                            variant="primary"
                        >
                            Back to Projects
                        </Button>
                    </div>
                </Card>
            </PageLayout>
        );
    }

    return (
        <PageLayout bgColor="bg-gray-50" maxWidth="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            navigate(
                                location.state?.from ||
                                    (actualMode === "public"
                                        ? "/"
                                        : "/admin/projects")
                            )
                        }
                        leftIcon={<ArrowLeft size={16} />}
                        className="text-purple-600 hover:text-purple-700"
                    >
                        Back
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {pageTitle ||
                                (actualMode === "public"
                                    ? "Submit a Project"
                                    : actualMode === "add"
                                    ? "Add New Project"
                                    : "Edit Project")}
                        </h2>
                        <p className="text-gray-500">
                            {pageSubtitle ||
                                (actualMode === "public"
                                    ? "Share your climate finance project with our community. All submissions are reviewed by administrators before being published."
                                    : actualMode === "add"
                                    ? "Create a new climate finance project"
                                    : `Update project details${
                                          formData.title
                                              ? ` for ${formData.title}`
                                              : ""
                                      }`)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Message for Public Mode */}
            {actualMode === "public" && (
                <Card padding="p-6" className="mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm">
                            <strong>Important:</strong> All project submissions
                            require administrator approval before being
                            published. You will be notified via email once your
                            project has been reviewed.
                        </p>
                    </div>
                </Card>
            )}

            {/* Form Card */}
            <Card padding={true} className="max-w-none">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* FIX: Enhanced error display */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-sm font-medium">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* FIX: Error summary for all validation errors */}
                    {Object.keys(errors).length > 0 && !error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-sm font-medium mb-2">
                                Please fix the following errors before
                                submitting:
                            </p>
                            <ul className="space-y-1">
                                {Object.entries(errors).map(
                                    ([field, message]) => (
                                        <li
                                            key={field}
                                            className="text-red-600 text-sm flex items-start"
                                        >
                                            <span className="mr-2">•</span>
                                            <span>{message}</span>
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email field - only for public mode */}
                            {actualMode === "public" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="submitter_email"
                                        value={formData.submitter_email || ""}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                            errors.submitter_email
                                                ? "border-red-300"
                                                : "border-gray-300"
                                        }`}
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                    {errors.submitter_email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.submitter_email}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Status field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Status{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                        errors.status
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    }`}
                                    required
                                >
                                    <option value="">Select Status</option>
                                    <option value="Planning">Planning</option>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.status}
                                    </p>
                                )}
                            </div>

                            {/* Project ID: Only show in edit mode */}
                            {actualMode === "edit" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Project ID
                                    </label>
                                    <input
                                        type="text"
                                        name="project_id"
                                        value={formData.project_id}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        disabled
                                        readOnly
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Project ID cannot be changed
                                    </p>
                                </div>
                            )}

                            {/* Title field - spans full width */}
                            <div
                                className={
                                    actualMode === "edit" ? "" : "md:col-span-2"
                                }
                            >
                                <label className="block text-sm font-medium text-gray-700">
                                    Title{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                        errors.title
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    }`}
                                    required
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.title}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Sector row */}
                        <div className="grid grid-cols-1 gap-6 mt-6">
                            {/* Sector as text input spanning full row */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Sector
                                </label>
                                <input
                                    type="text"
                                    name="sector"
                                    value={formData.sector}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter sector (e.g. Agriculture, Water, etc.)"
                                />
                            </div>

                            {/* Type as standardized CheckboxGroup */}
                            <div>
                                <CheckboxGroup
                                    label="Type"
                                    options={[
                                        {
                                            id: "Adaptation",
                                            name: "Adaptation",
                                        },
                                        {
                                            id: "Mitigation",
                                            name: "Mitigation",
                                        },
                                        {
                                            id: "Loss and Damage",
                                            name: "Loss and Damage",
                                        },
                                        {
                                            id: "Cross Cutting Finance",
                                            name: "Cross Cutting Finance",
                                        },
                                    ]}
                                    selectedValues={formData.type || []}
                                    onChange={(values) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            type: values,
                                        }))
                                    }
                                    getOptionId={(option) => option.id}
                                    getOptionLabel={(option) => {
                                        const bangla = {
                                            Adaptation: "অ্যাডাপটেশন",
                                            Mitigation: "মিটিগেশন",
                                            "Loss and Damage": "ক্ষয় ও ক্ষতি",
                                            "Cross Cutting Finance": "সমন্বয়মূলক অর্থায়ন",
                                        };
                                        return language === 'bn' ? (bangla[option.id] || option.name) : option.name;
                                    }}
                                    preventTranslate={true}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Select all that apply
                                </p>
                            </div>
                        </div>
                    </div>

                    <ProjectFormSections
                        formData={formData}
                        setFormData={setFormData}
                        handleInputChange={handleInputChange}
                        handleWashComponentChange={handleWashComponentChange}
                        agencies={agencies}
                        implementingEntities={implementingEntities}
                        executingAgencies={executingAgencies}
                        deliveryPartners={deliveryPartners}
                        fundingSources={fundingSources}
                        errors={errors}
                    />

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Financial Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Total Cost (million USD)
                                </label>
                                <input
                                    type="number"
                                    name="total_cost_usd"
                                    value={formData.total_cost_usd}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Grant (million USD)
                                </label>
                                <input
                                    type="number"
                                    name="gef_grant"
                                    value={formData.gef_grant}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Co-financing (million USD)
                                </label>
                                <input
                                    type="number"
                                    name="cofinancing"
                                    value={formData.cofinancing}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Loan Amount (million USD)
                                </label>
                                <input
                                    type="number"
                                    name="loan_amount"
                                    value={formData.loan_amount}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Timeline
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Beginning Date
                                </label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="date"
                                        name="beginning"
                                        value={
                                            formData.beginning &&
                                            !isNaN(
                                                Date.parse(formData.beginning)
                                            )
                                                ? formatDateForInput(
                                                      formData.beginning
                                                  )
                                                : ""
                                        }
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Closing Date
                                </label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="date"
                                        name="closing"
                                        value={
                                            formData.closing &&
                                            formData.closing !== "Ongoing"
                                                ? formatDateForInput(
                                                      formData.closing
                                                  )
                                                : ""
                                        }
                                        onChange={handleInputChange}
                                        disabled={
                                            formData.closing === "Ongoing"
                                        }
                                        className={`block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                            formData.closing === "Ongoing"
                                                ? "bg-gray-100"
                                                : ""
                                        }`}
                                    />
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={
                                                formData.closing === "Ongoing"
                                            }
                                            onChange={(e) =>
                                                handleInputChange({
                                                    target: {
                                                        name: "closing",
                                                        value: e.target.checked
                                                            ? "Ongoing"
                                                            : "",
                                                    },
                                                })
                                            }
                                            className="rounded text-purple-600 focus:ring-purple-500"
                                        />
                                        <span>Ongoing</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Approval Year
                                </label>
                                <input
                                    type="number"
                                    name="approval_fy"
                                    value={formData.approval_fy}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    min="2000"
                                    max="2030"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Objectives
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <textarea
                                    name="objectives"
                                    value={formData.objectives}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                        errors.objectives
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    }`}
                                    required={actualMode === "public"}
                                />
                                {errors.objectives && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.objectives}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Climate Relevance */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Climate Relevance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Score Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Climate Relevance Score (%)
                                </label>
                                <input
                                    type="number"
                                    name="climate_relevance_score"
                                    value={
                                        formData.climate_relevance_score || ""
                                    }
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="0-100"
                                />
                            </div>

                            {/* Category Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Relevance Category
                                </label>
                                <select
                                    name="climate_relevance_category"
                                    value={
                                        formData.climate_relevance_category ||
                                        ""
                                    }
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="">Select Category</option>
                                    <option value="High">High</option>
                                    <option value="Moderate-High">
                                        Moderate-High
                                    </option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Moderate-Low">
                                        Moderate-Low
                                    </option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Justification */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Climate Relevance Justification
                            </label>
                            <textarea
                                name="climate_relevance_justification"
                                value={
                                    formData.climate_relevance_justification ||
                                    ""
                                }
                                onChange={handleInputChange}
                                rows={4}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                placeholder="Explain the climate relevance score and category..."
                            />
                        </div>
                    </div>

                    {/* Supporting Documents */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Supporting Documents & Links
                        </h3>
                        <div className="bg-linear-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm space-y-6">
                            {/* Supporting Link */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Supporting Link
                                </label>
                                <p className="text-sm text-gray-500 mb-3">
                                    Add a URL to a website, document, or resource that provides additional information about your project.
                                </p>
                                <input
                                    type="url"
                                    name="supporting_link"
                                    value={formData.supporting_link || ""}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="https://example.com/project-details"
                                />
                                {errors.supporting_link && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.supporting_link}
                                    </p>
                                )}
                            </div>

                            {/* Project Document Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Document
                                </label>
                                <p className="text-sm text-gray-500 mb-4">
                                    Upload a PDF or DOCX file (max 10MB) to
                                    provide additional project details or
                                    supporting materials.
                                </p>

                                {!selectedFile ? (
                                    <div className="relative">
                                        <input
                                            id="project-document"
                                            type="file"
                                            accept=".pdf,.docx,.doc"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                ) : (
                                    <div className="border border-purple-200 bg-purple-50 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="shrink-0">
                                                    <svg
                                                        className="h-8 w-8 text-purple-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {(
                                                            selectedFile.size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)}{" "}
                                                        MB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="shrink-0 ml-4 p-1 rounded-full hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors duration-200"
                                            >
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {errors.file && (
                                    <div className="mt-2 flex items-center gap-1 text-red-600">
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span className="text-sm">
                                            {errors.file}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Button
                            type="button"
                            onClick={() =>
                                navigate(
                                    location.state?.from ||
                                        (actualMode === "public"
                                            ? "/"
                                            : "/admin/projects")
                                )
                            }
                            variant="outline"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg hover:shadow-purple-200 transition-all duration-200"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? actualMode === "public"
                                    ? "Submitting..."
                                    : actualMode === "add"
                                    ? "Creating..."
                                    : "Updating..."
                                : actualMode === "public"
                                ? "Submit Project"
                                : actualMode === "add"
                                ? "Create Project"
                                : "Update Project"}
                        </Button>
                    </div>
                </form>
            </Card>
        </PageLayout>
    );
};

export default ProjectFormPage;
