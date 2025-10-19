const FocalArea = require('../models/FocalArea.model');
const Agency = require("../models/Agency.model");

exports.addFocalArea = async (req, res) => {
    try {
        const result = await FocalArea.addFocalArea(req.body);
        res.status(201).json({ status: true, message: 'Focal area added successfully', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getAllFocalAreas = async (req, res) => {
    try {
        const result = await FocalArea.getAllFocalAreas();
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.updateFocalArea = async (req, res) => {
    try {
        const result = await FocalArea.updateFocalArea(req.params.id, req.body);
        res.status(200).json({ status: true, message: 'Focal Area updated', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.deleteFocalArea = async (req, res) => {
    try {
        await FocalArea.deleteFocalArea(req.params.id);
        res.status(200).json({ status: true, message: 'Focal Area deleted' });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getFocalAreaById = async (req, res) => {
    try {
        const result = await FocalArea.getFocalAreaById(req.params.id);
        if (!result) return res.status(404).json({ status: false, message: 'Focal Area not found' });
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};
