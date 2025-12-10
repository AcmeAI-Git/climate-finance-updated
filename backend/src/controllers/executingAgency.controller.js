const ExecutingAgency = require('../models/ExecutingAgency.model');

exports.addExecutingAgency = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: false, message: 'Name is required' });
        }
        const result = await ExecutingAgency.add({ name });
        res.status(201).json({ status: true, message: 'Executing agency added successfully', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.getAllExecutingAgencies = async (req, res) => {
    try {
        const result = await ExecutingAgency.getAll();
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.updateExecutingAgency = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: false, message: 'Name is required' });
        }
        const result = await ExecutingAgency.update(req.params.id, { name });
        if (!result) {
            return res.status(404).json({ status: false, message: 'Executing agency not found' });
        }
        res.status(200).json({ status: true, message: 'Executing agency updated', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.deleteExecutingAgency = async (req, res) => {
    try {
        await ExecutingAgency.delete(req.params.id);
        res.status(200).json({ status: true, message: 'Executing agency deleted' });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.getExecutingAgencyById = async (req, res) => {
    try {
        const result = await ExecutingAgency.getById(req.params.id);
        if (!result) {
            return res.status(404).json({ status: false, message: 'Executing agency not found' });
        }
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.findOrCreateExecutingAgency = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: false, message: 'Name is required' });
        }
        const result = await ExecutingAgency.findOrCreate(name);
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};
