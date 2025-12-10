const Project = require("../models/Project.model");
const { uploadFile } = require("../utils/fileUpload");

exports.addProject = async (req, res) => {
    try {
        let projectData = req.body;

        // Handle file upload if present
        if (req.files && req.files.supporting_document) {
            const fileUrl = await uploadFile(req.files.supporting_document);
            projectData.supporting_document = fileUrl;
        }

        const result = await Project.addProjectWithRelations(projectData);
        res.status(201).json({
            status: true,
            message: "Project added successfully",
            data: result,
        });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const result = await Project.getAllProjects();
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.updateProject = async (req, res) => {
    try {
        let projectData = req.body;

        // Handle file upload if present
        if (req.files && req.files.supporting_document) {
            const fileUrl = await uploadFile(req.files.supporting_document);
            projectData.supporting_document = fileUrl;
        }

        const result = await Project.updateProject(req.params.id, projectData);
        res.status(200).json({
            status: true,
            message: "Project updated",
            data: result,
        });
    } catch (e) {
        console.error("Update Project Controller Error:", e.message);
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        await Project.deleteProject(req.params.id);
        res.status(200).json({ status: true, message: "Project deleted" });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const result = await Project.getProjectById(req.params.id);
        if (!result) {
            return res
                .status(404)
                .json({ status: false, message: "Project not found" });
        }
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getProjectsOverviewStats = async (req, res) => {
    try {
        const response = await Project.getProjectsOverviewStats();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getProjectByStatus = async (req, res) => {
    try {
        const response = await Project.getProjectByStatus();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getProjectBySector = async (req, res) => {
    try {
        const response = await Project.getProjectBySector();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getProjectByType = async (req, res) => {
    try {
        const response = await Project.getProjectByType();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getWASHStat = async (req, res) => {
    try {
        const response = await Project.getWashStat();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getFundingSourceByType = async (req, res) => {
    try {
        const response = await Project.getFundingSourceByType();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getProjectTrend = async (req, res) => {
    try {
        const response = await Project.getProjectTrend();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getClimateFinanceTrend = async (req, res) => {
    try {
        const response = await Project.getClimateFinanceTrend();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getFundingSourceOverview = async (req, res) => {
    try {
        const response = await Project.getFundingSourceOverviewStats();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getFundingSourceTrend = async (req, res) => {
    try {
        const response = await Project.getFundingSourceTrend();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getFundingSourceSectorAllocation = async (req, res) => {
    try {
        const response = await Project.getFundingSourceSectorAllocation();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getFundingSource = async (req, res) => {
    try {
        const response = await Project.getFundingSource();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

//Dashboard

exports.getOverViewStats = async (req, res) => {
    try {
        const response = await Project.getOverviewStats();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getRegionalDistribution = async (req, res) => {
    try {
        const response = await Project.getRegionalDistribution();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getDistrictProjectDistribution = async (req, res) => {
    try {
        const response = await Project.getDistrictProjectDistribution();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

// ================== NEW STATISTICS ENDPOINTS ==================

exports.getProjectByHotspot = async (req, res) => {
    try {
        const response = await Project.getProjectByHotspot();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getProjectByVulnerabilityType = async (req, res) => {
    try {
        const response = await Project.getProjectByVulnerabilityType();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getProjectByPortfolioType = async (req, res) => {
    try {
        const response = await Project.getProjectByPortfolioType();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getImplementingEntityStats = async (req, res) => {
    try {
        const response = await Project.getImplementingEntityStats();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getExecutingAgencyStats = async (req, res) => {
    try {
        const response = await Project.getExecutingAgencyStats();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getDeliveryPartnerStats = async (req, res) => {
    try {
        const response = await Project.getDeliveryPartnerStats();
        res.status(200).json({ status: true, data: response });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};
