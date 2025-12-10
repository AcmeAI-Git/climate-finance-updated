const ImplementingEntity = require('../models/ImplementingEntity.model');

exports.addImplementingEntity = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: false, message: 'Name is required' });
        }
        const result = await ImplementingEntity.add({ name });
        res.status(201).json({ status: true, message: 'Implementing entity added successfully', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.getAllImplementingEntities = async (req, res) => {
    try {
        const result = await ImplementingEntity.getAll();
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.updateImplementingEntity = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: false, message: 'Name is required' });
        }
        const result = await ImplementingEntity.update(req.params.id, { name });
        if (!result) {
            return res.status(404).json({ status: false, message: 'Implementing entity not found' });
        }
        res.status(200).json({ status: true, message: 'Implementing entity updated', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.deleteImplementingEntity = async (req, res) => {
    try {
        await ImplementingEntity.delete(req.params.id);
        res.status(200).json({ status: true, message: 'Implementing entity deleted' });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.getImplementingEntityById = async (req, res) => {
    try {
        const result = await ImplementingEntity.getById(req.params.id);
        if (!result) {
            return res.status(404).json({ status: false, message: 'Implementing entity not found' });
        }
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.findOrCreateImplementingEntity = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: false, message: 'Name is required' });
        }
        const result = await ImplementingEntity.findOrCreate(name);
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};
