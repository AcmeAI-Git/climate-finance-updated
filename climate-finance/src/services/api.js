// Base API configuration
const BASE_URL =
    import.meta.env.VITE_BASE_URL || "https://climate-finance-new.onrender.com";

// Helper function to make backend requests
const makeBackendRequest = async (url, options = {}) => {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const config = {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        signal: controller.signal,
        ...options,
    };

    try {
        const response = await fetch(url, config);

        // Clear timeout if request completes successfully
        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                // If response is not JSON, use status message
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        // Clear timeout on error
        clearTimeout(timeoutId);
        throw error;
    }
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
    const url = `${BASE_URL}/api${endpoint}`;
    return await makeBackendRequest(url, options);
};

const DownloadRequest = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    return await makeBackendRequest(url, options);
};

// Project API endpoints
export const projectApi = {
    // Basic CRUD Operations
    getAll: () => apiRequest(`/project/all-project`),
    getById: (id) => {
        if (!id) throw new Error("Project ID is required");
        return apiRequest(`/project/get/${id}`);
    },
    add: (projectData) => {
        if (!projectData) throw new Error("Project data is required");

        // Check if projectData is FormData (for file uploads)
        const isFormData = projectData instanceof FormData;

        return apiRequest("/project/add-project", {
            method: "POST",
            headers: isFormData ? {} : { "Content-Type": "application/json" },
            body: isFormData ? projectData : JSON.stringify(projectData),
        });
    },
    update: (id, projectData) => {
        if (!id) throw new Error("Project ID is required");
        if (!projectData) throw new Error("Project data is required");

        // Check if projectData is FormData (for file uploads)
        const isFormData = projectData instanceof FormData;

        return apiRequest(`/project/update/${id}`, {
            method: "PUT",
            headers: isFormData ? {} : { "Content-Type": "application/json" },
            body: isFormData ? projectData : JSON.stringify(projectData),
        });
    },
    delete: (id) => {
        if (!id) throw new Error("Project ID is required");
        return apiRequest(`/project/delete/${id}`, {
            method: "DELETE",
        });
    },

    // Analytics endpoints
    getByStatus: () => apiRequest("/project/get-project-by-status"),
    getByType: () => apiRequest("/project/get-project-by-type"),
    getBySector: () => apiRequest("/project/get-project-by-sector"),
    getTrend: () => apiRequest("/project/get-project-by-trend"),
    getOverviewStats: () => apiRequest("/project/get-overview-stat"),
    getProjectsOverviewStats: () =>
        apiRequest("/project/projectsOverviewStats"),
    getRegionalDistribution: () =>
        apiRequest("/project/get-regional-distribution"),
    getDistrictProjectDistribution: () =>
        apiRequest("/project/get-district-project-distribution"),
    getClimateFinanceByTrend: () => apiRequest("/project/get-climate-finance-by-trend"),
    getWashStat: () => apiRequest("/project/get-wash-stat"),

    // Dashboard Data
    getDashboardOverviewStats: () => apiRequest("/project/get-overview-stat"),
};

// Pending Project API endpoints
export const pendingProjectApi = {
    // Public submission
    submit: (projectData) => {
        if (!projectData) throw new Error("Project data is required");
        const isFormData = projectData instanceof FormData;
        return apiRequest("/pending-project/submit", {
            method: "POST",
            headers: isFormData ? {} : { "Content-Type": "application/json" },
            body: isFormData ? projectData : JSON.stringify(projectData),
        });
    },

    // Admin operations
    getAll: () => apiRequest("/pending-project/all"),
    getById: (id) => {
        if (!id) throw new Error("Pending project ID is required");
        return apiRequest(`/pending-project/${id}`);
    },
    approve: (id) => {
        if (!id) throw new Error("Pending project ID is required");
        return apiRequest(`/pending-project/approve/${id}`, {
            method: "PUT",
        });
    },
    reject: (id) => {
        if (!id) throw new Error("Pending project ID is required");
        return apiRequest(`/pending-project/reject/${id}`, {
            method: "DELETE",
        });
    },
};

export const pendingRepositoryApi = {
    // Public submission
    submitRepository: (repositoryData) => {
        if (!repositoryData) throw new Error("Repository data is required");
        const isFormData = repositoryData instanceof FormData;
        return apiRequest("/pending-document-repository/create", {
            method: "POST",
            headers: isFormData ? {} : { "Content-Type": "application/json" },
            body: isFormData ? repositoryData : JSON.stringify(repositoryData),
        });
    },

    // Admin operations
    getAll: () => apiRequest("/pending-document-repository"),
    getById: (id) => {
        if (!id) throw new Error("Pending project ID is required");
        return apiRequest(`/pending-document-repository/${id}`);
    },
    approve: (id) => {
        if (!id) throw new Error("Pending project ID is required");
        return apiRequest(`/pending-document-repository/accept/${id}`, {
            method: "PUT",
        });
    },
    reject: (id) => {
        if (!id) throw new Error("Pending project ID is required");
        return apiRequest(`/pending-document-repository/${id}`, {
            method: "DELETE",
        });
    },
};

export const downloadDocumentApi = {
    downloadDocument: (documentId) => {
        if (!documentId) throw new Error("Document ID is required");
        return DownloadRequest(`/document/${documentId}`);
    },

    previewDocument: (documentId) => {
        if (!documentId) throw new Error("Document ID is required");
        window.open(`${BASE_URL}/document/${documentId}`, "_blank");
    },
};

export const RepositoryApi = {
    // Public submission
    submitRepository: (repositoryData) => {
        if (!repositoryData) throw new Error("Repository data is required");
        const isFormData = repositoryData instanceof FormData;
        return apiRequest("/document-repository/create", {
            method: "POST",
            headers: isFormData ? {} : { "Content-Type": "application/json" },
            body: isFormData ? repositoryData : JSON.stringify(repositoryData),
        });
    },

    getAll: () => apiRequest("/document-repository"),
    getById: (id) => {
        if (!id) throw new Error("Pending project ID is required");
        return apiRequest(`/document-repository/${id}`);
    },
    edit: (id) => {
        if (!id) throw new Error("Pending project ID is required");
        return apiRequest(`/document-repository/${id}`, {
            method: "PUT",
        });
    },
    delete: (id) => {
        if (!id) throw new Error("Pending project ID is required");
        return apiRequest(`/document-repository/${id}`, {
            method: "DELETE",
        });
    },
};

// Location API endpoints
export const locationApi = {
    getAll: () => apiRequest("/location/all"),
    getById: (id) => {
        if (!id) throw new Error("Location ID is required");
        return apiRequest(`/location/get/${id}`);
    },
    add: (locationData) => {
        if (!locationData || !locationData.name)
            throw new Error("Location name is required");
        return apiRequest("/location/add-location", {
            method: "POST",
            body: JSON.stringify(locationData),
        });
    },
    update: (id, locationData) => {
        if (!id) throw new Error("Location ID is required");
        if (!locationData) throw new Error("Location data is required");
        return apiRequest(`/location/update/${id}`, {
            method: "PUT",
            body: JSON.stringify(locationData),
        });
    },
    delete: (id) => {
        if (!id) throw new Error("Location ID is required");
        return apiRequest(`/location/delete/${id}`, {
            method: "DELETE",
        });
    },
};

// Agency API endpoints
export const agencyApi = {
    getAll: () => apiRequest("/agency/all"),
    getById: (id) => {
        if (!id) throw new Error("Agency ID is required");
        return apiRequest(`/agency/get/${id}`);
    },
    add: (agencyData) => {
        if (!agencyData || !agencyData.name)
            throw new Error("Agency name is required");
        return apiRequest("/agency/add-agency", {
            method: "POST",
            body: JSON.stringify(agencyData),
        });
    },
    update: (id, agencyData) => {
        if (!id) throw new Error("Agency ID is required");
        if (!agencyData) throw new Error("Agency data is required");
        return apiRequest(`/agency/update/${id}`, {
            method: "PUT",
            body: JSON.stringify(agencyData),
        });
    },
    delete: (id) => {
        if (!id) throw new Error("Agency ID is required");
        return apiRequest(`/agency/delete/${id}`, {
            method: "DELETE",
        });
    },
};

// Implementing Entity API endpoints
export const implementingEntityApi = {
    getAll: () => apiRequest("/implementing-entity/all"),
    getById: (id) => {
        if (!id) throw new Error("Implementing entity ID is required");
        return apiRequest(`/implementing-entity/get/${id}`);
    },
    add: (entityData) => {
        if (!entityData || !entityData.name)
            throw new Error("Implementing entity name is required");
        return apiRequest("/implementing-entity/add", {
            method: "POST",
            body: JSON.stringify(entityData),
        });
    },
    update: (id, entityData) => {
        if (!id) throw new Error("Implementing entity ID is required");
        if (!entityData) throw new Error("Implementing entity data is required");
        return apiRequest(`/implementing-entity/update/${id}`, {
            method: "PUT",
            body: JSON.stringify(entityData),
        });
    },
    delete: (id) => {
        if (!id) throw new Error("Implementing entity ID is required");
        return apiRequest(`/implementing-entity/delete/${id}`, {
            method: "DELETE",
        });
    },
};

// Executing Agency API endpoints
export const executingAgencyApi = {
    getAll: () => apiRequest("/executing-agency/all"),
    getById: (id) => {
        if (!id) throw new Error("Executing agency ID is required");
        return apiRequest(`/executing-agency/get/${id}`);
    },
    add: (agencyData) => {
        if (!agencyData || !agencyData.name)
            throw new Error("Executing agency name is required");
        return apiRequest("/executing-agency/add", {
            method: "POST",
            body: JSON.stringify(agencyData),
        });
    },
    update: (id, agencyData) => {
        if (!id) throw new Error("Executing agency ID is required");
        if (!agencyData) throw new Error("Executing agency data is required");
        return apiRequest(`/executing-agency/update/${id}`, {
            method: "PUT",
            body: JSON.stringify(agencyData),
        });
    },
    delete: (id) => {
        if (!id) throw new Error("Executing agency ID is required");
        return apiRequest(`/executing-agency/delete/${id}`, {
            method: "DELETE",
        });
    },
};

// Delivery Partner API endpoints
export const deliveryPartnerApi = {
    getAll: () => apiRequest("/delivery-partner/all"),
    getById: (id) => {
        if (!id) throw new Error("Delivery partner ID is required");
        return apiRequest(`/delivery-partner/get/${id}`);
    },
    add: (partnerData) => {
        if (!partnerData || !partnerData.name)
            throw new Error("Delivery partner name is required");
        return apiRequest("/delivery-partner/add", {
            method: "POST",
            body: JSON.stringify(partnerData),
        });
    },
    update: (id, partnerData) => {
        if (!id) throw new Error("Delivery partner ID is required");
        if (!partnerData) throw new Error("Delivery partner data is required");
        return apiRequest(`/delivery-partner/update/${id}`, {
            method: "PUT",
            body: JSON.stringify(partnerData),
        });
    },
    delete: (id) => {
        if (!id) throw new Error("Delivery partner ID is required");
        return apiRequest(`/delivery-partner/delete/${id}`, {
            method: "DELETE",
        });
    },
};

// Funding Source API endpoints
export const fundingSourceApi = {
    getAll: () => apiRequest("/funding-source/all"),
    getById: (id) => {
        if (!id) throw new Error("Funding source ID is required");
        return apiRequest(`/funding-source/get/${id}`);
    },
    add: (fundingSourceData) => {
        if (!fundingSourceData || !fundingSourceData.name)
            throw new Error("Funding source name is required");
        return apiRequest("/funding-source/add-funding-source", {
            method: "POST",
            body: JSON.stringify(fundingSourceData),
        });
    },
    update: (id, fundingSourceData) => {
        if (!id) throw new Error("Funding source ID is required");
        if (!fundingSourceData)
            throw new Error("Funding source data is required");
        return apiRequest(`/funding-source/update/${id}`, {
            method: "PUT",
            body: JSON.stringify(fundingSourceData),
        });
    },
    delete: (id) => {
        if (!id) throw new Error("Funding source ID is required");
        return apiRequest(`/funding-source/delete/${id}`, {
            method: "DELETE",
        });
    },

    // Funding Source Analytics
    getFundingSourceByType: () =>
        apiRequest("/project/get-funding-source-by-type"),
    getFundingSourceOverview: () =>
        apiRequest("/project/get-funding-source-overview"),
    getFundingSourceTrend: () =>
        apiRequest("/project/get-funding-source-trend"),
    getFundingSource: () => apiRequest("/project/get-funding-source"),
    getFundingSourceSectorAllocation: () =>
        apiRequest("/project/get-funding-source-sector-allocation"),
    getFundingSourceCount: () =>
        apiRequest("/funding-source/get-funding-source-count"),
    getFundingSourceOverviewStats: () =>
        apiRequest("/funding-source/get-funding-source-overview"),
};

// Focal Area API endpoints (from Postman)
export const focalAreaApi = {
    getAll: () => apiRequest("/focal-area/all"),
    getById: (id) => {
        if (!id) throw new Error("Focal area ID is required");
        return apiRequest(`/focal-area/get/${id}`);
    },
    add: (focalAreaData) => {
        if (!focalAreaData || !focalAreaData.name)
            throw new Error("Focal area name is required");
        return apiRequest("/focal-area/add-focal-area", {
            method: "POST",
            body: JSON.stringify(focalAreaData),
        });
    },
    update: (id, focalAreaData) => {
        if (!id) throw new Error("Focal area ID is required");
        if (!focalAreaData) throw new Error("Focal area data is required");
        return apiRequest(`/focal-area/update/${id}`, {
            method: "PUT",
            body: JSON.stringify(focalAreaData),
        });
    },
    delete: (id) => {
        if (!id) throw new Error("Focal area ID is required");
        return apiRequest(`/focal-area/delete/${id}`, {
            method: "DELETE",
        });
    },
};

// SDG API endpoints (from Postman)
export const sdgApi = {
    add: (sdgData) => {
        if (!sdgData || !sdgData.sdg_number)
            throw new Error("SDG number is required");
        return apiRequest("/sdg/add", {
            method: "POST",
            body: JSON.stringify(sdgData),
        });
    },
};

// Auth API endpoints
export const authApi = {
    register: (userData) => {
        if (!userData || !userData.email || !userData.password) {
            throw new Error("Email and password are required");
        }
        return apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    },
    login: (credentials) => {
        if (!credentials || !credentials.email || !credentials.password) {
            throw new Error("Email and password are required");
        }
        return apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
    },
    getAllUsers: () => apiRequest("/auth/get-all-user"),
    getUserById: (id) => {
        if (!id) throw new Error("User ID is required");
        return apiRequest(`/auth/user/${id}`);
    },
    updateUser: (id, userData) => {
        if (!id) throw new Error("User ID is required");
        if (!userData) throw new Error("User data is required");
        return apiRequest(`/auth/user/${id}`, {
            method: "PUT",
            body: JSON.stringify(userData),
        });
    },
    deleteUser: (id) => {
        if (!id) throw new Error("User ID is required");
        return apiRequest(`/auth/user/${id}`, {
            method: "DELETE",
        });
    },
    // Compatibility methods for AdminFormPage and AdminListPage
    getAll: () => apiRequest("/auth/get-all-user"),
    getById: (id) => {
        if (!id) throw new Error("User ID is required");
        return apiRequest(`/auth/user/${id}`);
    },
    update: (id, userData) => {
        if (!id) throw new Error("User ID is required");
        if (!userData) throw new Error("User data is required");
        return apiRequest(`/auth/user/${id}`, {
            method: "PUT",
            body: JSON.stringify(userData),
        });
    },
    delete: (id) => {
        if (!id) throw new Error("User ID is required");
        return apiRequest(`/auth/user/${id}`, {
            method: "DELETE",
        });
    },
    add: (userData) => {
        if (!userData || !userData.email || !userData.password) {
            throw new Error("Email and password are required");
        }
        return apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    },
};

// Feedback API endpoints
export const feedbackApi = {
    // Submit feedback/issue report
    submitFeedback: (feedbackData) => {
        if (!feedbackData) throw new Error("Feedback data is required");
        return apiRequest("/feedback", {
            method: "POST",
            body: JSON.stringify(feedbackData),
        });
    },
    // Get all feedbacks (admin only)
    getAll: () => apiRequest("/feedback"),
    // Get feedback by ID
    getById: (id) => {
        if (!id) throw new Error("Feedback ID is required");
        return apiRequest(`/feedback/${id}`);
    },
    // Update feedback (admin only)
    update: (id, feedbackData) => {
        if (!id) throw new Error("Feedback ID is required");
        if (!feedbackData) throw new Error("Feedback data is required");
        return apiRequest(`/feedback/${id}`, {
            method: "PUT",
            body: JSON.stringify(feedbackData),
        });
    },
    // Delete feedback (admin only)
    delete: (id) => {
        if (!id) throw new Error("Feedback ID is required");
        return apiRequest(`/feedback/${id}`, {
            method: "DELETE",
        });
    },
};

export default apiRequest;
