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
