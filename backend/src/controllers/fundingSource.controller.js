const FundingSource = require('../models/FundingSource.model');
const Agency = require("../models/Agency.model");

exports.addFundingSource = async (req, res) => {
    try {
        const result = await FundingSource.addFundingSource(req.body);
        res.status(201).json({ status: true, message: 'Funding source added successfully', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getAllFundingSources = async (req, res) => {
    try {
        const result = await FundingSource.getAllFundingSources();
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.updateFundingSource = async (req, res) => {
    try {
        const result = await FundingSource.updateFundingSource(req.params.id, req.body);
        res.status(200).json({ status: true, message: 'FundingSource updated', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.deleteFundingSource = async (req, res) => {
    try {
        await FundingSource.deleteFundingSource(req.params.id);
        res.status(200).json({ status: true, message: 'FundingSource deleted' });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getFundingSourceById = async (req, res) => {
    try {
        const result = await FundingSource.getFundingSourceById(req.params.id);
        if (!result) return res.status(404).json({ status: false, message: 'Funding Source not found' });
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};
