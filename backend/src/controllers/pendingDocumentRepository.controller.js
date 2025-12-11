const PendingDocumentRepository = require('../models/PendingDocumentRepository.model');
const { uploadFile } = require('../utils/fileUpload');
const documentRepository = require("../models/documentRepository.model"); // adjust path if needed

const PendingDocumentRepositoryController = {};

// ✅ Create a new document
PendingDocumentRepositoryController.create = async (req, res) => {
    try {
        const { categories, heading, sub_heading, agency_name, submitter_email, document_size, programme_code, supporting_link } = req.body;
        const data = { categories, heading, sub_heading, agency_name, submitter_email, document_size, programme_code, supporting_link };

        // Handle file upload if provided
        if (req.files && req.files.supporting_document) {
            const fileUrl = await uploadFile(req.files.supporting_document);
            data.document_link = fileUrl;
        }

        const result = await PendingDocumentRepository.create(data);
        res.status(201).json({ status: true, data: result });
    } catch (e) {
        console.error("Error creating document:", e);
        res.status(500).json({ status: false, data: `Server Error: ${e.message}` });
    }
};

// ✅ Get all documents
PendingDocumentRepositoryController.getAll = async (req, res) => {
    try {
        const results = await PendingDocumentRepository.getAll();
        res.status(200).json({ status: true, data: results });
    } catch (e) {
        console.error("Error fetching documents:", e);
        res.status(500).json({ status: false, data: `Server Error: ${e.message}` });
    }
};

// ✅ Get single document by ID
PendingDocumentRepositoryController.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await PendingDocumentRepository.getById(id);

        if (!result) {
            return res.status(404).json({ status: false, data: "Document not found" });
        }

        res.status(200).json({ status: true, data: result });
    } catch (e) {
        console.error("Error fetching document:", e);
        res.status(500).json({ status: false, data: `Server Error: ${e.message}` });
    }
};

// ✅ Update an existing document
PendingDocumentRepositoryController.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { categories, heading, sub_heading, agency_name, submitter_email, document_size, programme_code } = req.body;
        const data = { categories, heading, sub_heading, agency_name, submitter_email, document_size, programme_code };

        // Handle file upload if new document file is provided
        if (req.files && req.files.supporting_document) {
            const fileUrl = await uploadFile(req.files.supporting_document);
            data.document_link = fileUrl;
        }

        const result = await PendingDocumentRepository.update(id, data);

        if (!result) {
            return res.status(404).json({ status: false, data: "Document not found or not updated" });
        }

        res.status(200).json({ status: true, data: result });
    } catch (e) {
        console.error("Error updating document:", e);
        res.status(500).json({ status: false, data: `Server Error: ${e.message}` });
    }
};

PendingDocumentRepositoryController.accept = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await PendingDocumentRepository.getById(id);
        const data = { categories: result.categories, heading:result.heading, sub_heading: result.sub_heading, document_link: result.document_link, agency_name: result.agency_name, document_size: result.document_size, programme_code: result.programme_code };

        if (!result) {
            return res.status(404).json({ status: false, data: "Document not found" });
        }

        const response = await documentRepository.create(data)
        await PendingDocumentRepository.delete({repo_id: result.repo_id})

        res.status(200).json({ status: true, data: response });
    } catch (e) {
        console.error("Error fetching document:", e);
        res.status(500).json({ status: false, data: `Server Error: ${e.message}` });
    }
};

// ✅ Delete a document
PendingDocumentRepositoryController.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await PendingDocumentRepository.delete({repo_id:id});

        if (!result) {
            return res.status(404).json({ status: false, data: "Document not found or already deleted" });
        }

        res.status(200).json({ status: true, data: "Document deleted successfully" });
    } catch (e) {
        console.error("Error deleting document:", e);
        res.status(500).json({ status: false, data: `Server Error: ${e.message}` });
    }
};

module.exports = PendingDocumentRepositoryController;
