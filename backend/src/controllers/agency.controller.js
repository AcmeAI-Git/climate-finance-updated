const Agency = require('../models/Agency.model');

exports.addAgency = async (req, res) => {
    try {
        const result = await Agency.addAgency(req.body);
        res.status(201).json({ status: true, message: 'Agency added successfully', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getAllAgencies = async (req, res) => {
    try {
        const result = await Agency.getAllAgencies();
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.updateAgency = async (req, res) => {
    try {
        const result = await Agency.updateAgency(req.params.id, req.body);
        res.status(200).json({ status: true, message: 'Agency updated', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.deleteAgency = async (req, res) => {
    try {
        await Agency.deleteAgency(req.params.id);
        res.status(200).json({ status: true, message: 'Agency deleted' });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getAgencyById = async (req, res) => {
    try {
        const result = await Agency.getAgencyById(req.params.id);
        if (!result) return res.status(404).json({ status: false, message: 'Agency not found' });
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};
