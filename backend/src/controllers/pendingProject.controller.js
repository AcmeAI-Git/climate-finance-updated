const PendingProject = require("../models/PendingProject.model");
const { uploadFile } = require("../utils/fileUpload");

exports.addPendingProject = async (req, res) => {
    try {
        let projectData = req.body;

        // Handle file upload if present
        if (req.files && req.files.supporting_document) {
            const fileUrl = await uploadFile(req.files.supporting_document);
            projectData.supporting_document = fileUrl;
        }

        const result = await PendingProject.addPendingProject(projectData);
        res.status(201).json({
            status: true,
            message:
                "Project submitted successfully. It will be visible once approved by an administrator.",
            data: result,
        });
    } catch (e) {
        res.status(500).json({
            status: false,
            message: `Server Error: ${e.message}`,
        });
    }
};

exports.getAllPendingProjects = async (req, res) => {
    try {
        const result = await PendingProject.getAllPendingProjects();
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getPendingProjectById = async (req, res) => {
    try {
        const result = await PendingProject.getPendingProjectById(
            req.params.id
        );
        if (!result) {
            return res
                .status(404)
                .json({ status: false, message: "Pending project not found" });
        }
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.approveProject = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await PendingProject.approveProject(id);
        res.status(200).json({
            status: true,
            message: "Project approved and moved to main projects",
            data: result,
        });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.rejectProject = async (req, res) => {
    try {
        const result = await PendingProject.deletePendingProject(req.params.id);
        res.status(200).json({
            status: true,
            message: "Project rejected and removed from pending list",
        });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};
