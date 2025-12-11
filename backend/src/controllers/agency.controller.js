const Agency = require('../models/Agency.model');

// Get all agencies (unified table - for implementing and executing roles)
exports.getAllAgencies = async (req, res) => {
    try {
        const agencies = await Agency.getAll();
        res.status(200).json({ status: true, data: agencies });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

// Add agency (no type needed - role determined by project relationship)
exports.addAgency = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ 
                status: false, 
                message: 'Name is required' 
            });
        }

        const result = await Agency.add({ name });
        res.status(201).json({ 
            status: true, 
            message: 'Agency added successfully', 
            data: { agency_id: result.agency_id, id: result.agency_id, name: result.name } 
        });
    } catch (e) {
        if (e.code === '23505') { // Unique constraint violation
            return res.status(400).json({ 
                status: false, 
                message: 'An agency with this name already exists' 
            });
        }
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

// Update agency
exports.updateAgency = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        
        if (!name) {
            return res.status(400).json({ 
                status: false, 
                message: 'Name is required' 
            });
        }

        const result = await Agency.update(id, { name });
        if (!result) {
            return res.status(404).json({ status: false, message: 'Agency not found' });
        }

        res.status(200).json({ 
            status: true, 
            message: 'Agency updated', 
            data: { agency_id: result.id, id: result.id, name: result.name } 
        });
    } catch (e) {
        if (e.code === '23505') { // Unique constraint violation
            return res.status(400).json({ 
                status: false, 
                message: 'An agency with this name already exists' 
            });
        }
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

// Delete agency
exports.deleteAgency = async (req, res) => {
    try {
        const { id } = req.params;
        await Agency.delete(id);
        res.status(200).json({ status: true, message: 'Agency deleted' });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

// Get agency by ID
exports.getAgencyById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Agency.getById(id);
        
        if (!result) {
            return res.status(404).json({ status: false, message: 'Agency not found' });
        }

        res.status(200).json({ 
            status: true, 
            data: { agency_id: result.id, id: result.id, name: result.name } 
        });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};
