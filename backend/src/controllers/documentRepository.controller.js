const documentRepository = require('../models/documentRepository.model');
const { uploadFile } = require('../utils/fileUpload'); // adjust path if needed

const documentRepositoryController = {};

// ✅ Create a new document
documentRepositoryController.create = async (req, res) => {
    try {
        const { categories, heading, sub_heading, agency_name, programme_code, document_size, supporting_link } = req.body;
        const data = { categories, heading, sub_heading, agency_name, programme_code, document_size, supporting_link };

        // Handle file upload if provided
        if (req.files && req.files.supporting_document) {
            const fileUrl = await uploadFile(req.files.supporting_document);
            data.document_link = fileUrl;
        }

        const result = await documentRepository.create(data);
        res.status(201).json({ status: true, data: result });
    } catch (e) {
        console.error("Error creating document:", e);
        res.status(500).json({ status: false, data: `Server Error: ${e.message}` });
    }
};

// ✅ Get all documents
documentRepositoryController.getAll = async (req, res) => {
    try {
        const results = await documentRepository.getAll();
        res.status(200).json({ status: true, data: results });
    } catch (e) {
        console.error("Error fetching documents:", e);
        res.status(500).json({ status: false, data: `Server Error: ${e.message}` });
    }
};

// ✅ Get single document by ID
documentRepositoryController.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await documentRepository.getById(id);

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
documentRepositoryController.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { categories, heading, sub_heading, agency_name, programme_code, document_size } = req.body;
        const data = { categories, heading, sub_heading, agency_name, programme_code, document_size };

        // Handle file upload if new document file is provided
        if (req.files && req.files.supporting_document) {
            const fileUrl = await uploadFile(req.files.supporting_document);
            data.document_link = fileUrl;
        }

        const result = await documentRepository.update(id, data);

        if (!result) {
            return res.status(404).json({ status: false, data: "Document not found or not updated" });
        }

        res.status(200).json({ status: true, data: result });
    } catch (e) {
        console.error("Error updating document:", e);
        res.status(500).json({ status: false, data: `Server Error: ${e.message}` });
    }
};

// ✅ Delete a document
documentRepositoryController.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await documentRepository.delete(id);

        if (!result) {
            return res.status(404).json({ status: false, data: "Document not found or already deleted" });
        }

        res.status(200).json({ status: true, data: "Document deleted successfully" });
    } catch (e) {
        console.error("Error deleting document:", e);
        res.status(500).json({ status: false, data: `Server Error: ${e.message}` });
    }
};

module.exports = documentRepositoryController;
