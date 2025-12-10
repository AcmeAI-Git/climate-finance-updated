const DeliveryPartner = require('../models/DeliveryPartner.model');

exports.addDeliveryPartner = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: false, message: 'Name is required' });
        }
        const result = await DeliveryPartner.add({ name });
        res.status(201).json({ status: true, message: 'Delivery partner added successfully', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.getAllDeliveryPartners = async (req, res) => {
    try {
        const result = await DeliveryPartner.getAll();
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.updateDeliveryPartner = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: false, message: 'Name is required' });
        }
        const result = await DeliveryPartner.update(req.params.id, { name });
        if (!result) {
            return res.status(404).json({ status: false, message: 'Delivery partner not found' });
        }
        res.status(200).json({ status: true, message: 'Delivery partner updated', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.deleteDeliveryPartner = async (req, res) => {
    try {
        await DeliveryPartner.delete(req.params.id);
        res.status(200).json({ status: true, message: 'Delivery partner deleted' });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.getDeliveryPartnerById = async (req, res) => {
    try {
        const result = await DeliveryPartner.getById(req.params.id);
        if (!result) {
            return res.status(404).json({ status: false, message: 'Delivery partner not found' });
        }
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

exports.findOrCreateDeliveryPartner = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: false, message: 'Name is required' });
        }
        const result = await DeliveryPartner.findOrCreate(name);
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};
