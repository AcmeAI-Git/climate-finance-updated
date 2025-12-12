const PendingProject = require("../models/PendingProject.model");
const { uploadFile } = require("../utils/fileUpload");
const Agency = require('../models/Agency.model')
const FundingSource = require('../models/FundingSource.model')
const SDGAlignment = require("../models/SDGAlignment.model");

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

        const projectsWithDetails = await Promise.all(
            result.map(async (project) => {
                // Safely handle arrays - ensure they exist and are arrays
                const agencyIds = Array.isArray(project.agency_ids) ? project.agency_ids : [];
                const fundingSourceIds = Array.isArray(project.funding_source_ids) ? project.funding_source_ids : [];
                const sdgIds = Array.isArray(project.sdg_ids) ? project.sdg_ids : [];

                const agencies = agencyIds.length > 0
                    ? await Promise.all(
                        agencyIds.map((id) => Agency.getById(id).catch(() => null))
                    ).then(results => results.filter(r => r !== null))
                    : [];

                const funding_sources = fundingSourceIds.length > 0
                    ? await Promise.all(
                        fundingSourceIds.map((id) => FundingSource.getById(id).catch(() => null))
                    ).then(results => results.filter(r => r !== null))
                    : [];

                const sdg = sdgIds.length > 0
                    ? await Promise.all(
                        sdgIds.map((id) => SDGAlignment.getSDGById(id).catch(() => null))
                    ).then(results => results.filter(r => r !== null))
                    : [];

                return {
                    ...project,
                    agencies,
                    funding_sources,
                    sdg
                };
            })
        );

        res.status(200).json({ status: true, data: projectsWithDetails });
    } catch (e) {
        console.error('Error in getAllPendingProjects:', e);
        res.status(500).json({ 
            status: false, 
            message: `Error: ${e.message || 'Unknown error occurred'}` 
        });
    }
};


const DeliveryPartner = require('../models/DeliveryPartner.model');

exports.getPendingProjectById = async (req, res) => {
    try {
        const project = await PendingProject.getPendingProjectById(
            req.params.id
        );
        if (!project) {
            return res
                .status(404)
                .json({ status: false, message: "Pending project not found" });
        }

        // Fetch agencies (from agency_ids - backward compatibility)
        const agencies = project.agency_ids && project.agency_ids.length > 0
            ? await Promise.all(
                project.agency_ids.map((id) => Agency.getById(id))
            )
            : [];

        // Fetch implementing entities
        const implementing_entities = project.implementing_entity_ids && project.implementing_entity_ids.length > 0
            ? await Promise.all(
                project.implementing_entity_ids.map((id) => Agency.getById(id))
            )
            : [];

        // Fetch executing agencies
        const executing_agencies = project.executing_agency_ids && project.executing_agency_ids.length > 0
            ? await Promise.all(
                project.executing_agency_ids.map((id) => Agency.getById(id))
            )
            : [];

        // Fetch delivery partners
        const delivery_partners = project.delivery_partner_ids && project.delivery_partner_ids.length > 0
            ? await Promise.all(
                project.delivery_partner_ids.map((id) => DeliveryPartner.getById(id))
            )
            : [];

        // Fetch funding sources
        const funding_sources = project.funding_source_ids && project.funding_source_ids.length > 0
            ? await Promise.all(
                project.funding_source_ids.map((id) => FundingSource.getById(id))
            )
            : [];

        // Fetch SDGs
        const sdg = project.sdg_ids && project.sdg_ids.length > 0
            ? await Promise.all(
                project.sdg_ids.map((id) => SDGAlignment.getSDGById(id))
            )
            : [];

        res.status(200).json({ 
            status: true, 
            data: {
                ...project, 
                agencies, 
                implementing_entities,
                executing_agencies,
                delivery_partners,
                funding_sources, 
                sdg
            } 
        });
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
