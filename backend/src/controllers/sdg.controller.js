const SDGAlignment = require("../models/SDGAlignment.model");

exports.addSDG = async (req, res) => {
    try {
        const result = await SDGAlignment.addSDG(req.body);
        res.status(201).json({
            status: true,
            message: "SDG added successfully",
            data: result,
        });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getAllSDGs = async (req, res) => {
    try {
        const result = await SDGAlignment.getAllSDGs();
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getSDGById = async (req, res) => {
    try {
        const result = await SDGAlignment.getSDGById(req.params.id);
        if (!result)
            return res
                .status(404)
                .json({ status: false, message: "SDG not found" });
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.updateSDG = async (req, res) => {
    try {
        const result = await SDGAlignment.updateSDG(req.params.id, req.body);
        res.status(200).json({
            status: true,
            message: "SDG updated",
            data: result,
        });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.deleteSDG = async (req, res) => {
    try {
        await SDGAlignment.deleteSDG(req.params.id);
        res.status(200).json({ status: true, message: "SDG deleted" });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};
