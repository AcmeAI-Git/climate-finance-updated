const Location = require('../models/Location.model');

exports.addLocation = async (req, res) => {
    try {
        const result = await Location.addLocation(req.body);
        res.status(201).json({ status: true, message: 'Location added successfully', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getAllLocations = async (req, res) => {
    try {
        const result = await Location.getAllLocations();
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const result = await Location.updateLocation(req.params.id, req.body);
        res.status(200).json({ status: true, message: 'Location updated', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        await Location.deleteLocation(req.params.id);
        res.status(200).json({ status: true, message: 'Location deleted' });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getLocationById = async (req, res) => {
    try {
        const result = await Location.getLocationById(req.params.id);
        if (!result) return res.status(404).json({ status: false, message: 'Location not found' });
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};


