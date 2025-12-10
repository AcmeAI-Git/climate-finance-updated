const ImplementingEntity = require('../models/ImplementingEntity.model');
const ExecutingAgency = require('../models/ExecutingAgency.model');
const DeliveryPartner = require('../models/DeliveryPartner.model');

// Legacy agency controller - provides backward compatibility
// by combining implementing entities, executing agencies, and delivery partners

// Get all agencies (combined from all three types)
exports.getAllAgencies = async (req, res) => {
    try {
        const [implementingEntities, executingAgencies, deliveryPartners] = await Promise.all([
            ImplementingEntity.getAll(),
            ExecutingAgency.getAll(),
            DeliveryPartner.getAll()
        ]);

        // Combine and format for backward compatibility
        const agencies = [
            ...implementingEntities.map(e => ({ 
                agency_id: e.id, 
                name: e.name, 
                type: 'Implementing Entity' 
            })),
            ...executingAgencies.map(e => ({ 
                agency_id: e.id, 
                name: e.name, 
                type: 'Executing Agency' 
            })),
            ...deliveryPartners.map(e => ({ 
                agency_id: e.id, 
                name: e.name, 
                type: 'Delivery Partner' 
            }))
        ];

        res.status(200).json({ status: true, data: agencies });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

// Add agency - requires type to determine which table
exports.addAgency = async (req, res) => {
    try {
        const { name, type } = req.body;
        if (!name || !type) {
            return res.status(400).json({ 
                status: false, 
                message: 'Name and type are required. Type must be one of: Implementing Entity, Executing Agency, Delivery Partner' 
            });
        }

        let result;
        switch (type.toLowerCase().replace(/\s+/g, '_')) {
            case 'implementing_entity':
            case 'implementing':
                result = await ImplementingEntity.add({ name });
                result.type = 'Implementing Entity';
                break;
            case 'executing_agency':
            case 'executing':
                result = await ExecutingAgency.add({ name });
                result.type = 'Executing Agency';
                break;
            case 'delivery_partner':
            case 'delivery':
                result = await DeliveryPartner.add({ name });
                result.type = 'Delivery Partner';
                break;
            default:
                return res.status(400).json({ 
                    status: false, 
                    message: 'Invalid type. Must be one of: Implementing Entity, Executing Agency, Delivery Partner' 
                });
        }

        res.status(201).json({ 
            status: true, 
            message: 'Agency added successfully', 
            data: { agency_id: result.id, name: result.name, type: result.type } 
        });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

// Update agency - requires type to determine which table
exports.updateAgency = async (req, res) => {
    try {
        const { name, type } = req.body;
        const { id } = req.params;
        
        if (!name || !type) {
            return res.status(400).json({ 
                status: false, 
                message: 'Name and type are required' 
            });
        }

        let result;
        switch (type.toLowerCase().replace(/\s+/g, '_')) {
            case 'implementing_entity':
            case 'implementing':
                result = await ImplementingEntity.update(id, { name });
                break;
            case 'executing_agency':
            case 'executing':
                result = await ExecutingAgency.update(id, { name });
                break;
            case 'delivery_partner':
            case 'delivery':
                result = await DeliveryPartner.update(id, { name });
                break;
            default:
                return res.status(400).json({ 
                    status: false, 
                    message: 'Invalid type' 
                });
        }

        if (!result) {
            return res.status(404).json({ status: false, message: 'Agency not found' });
        }

        res.status(200).json({ 
            status: true, 
            message: 'Agency updated', 
            data: { agency_id: result.id, name: result.name, type } 
        });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

// Delete agency - requires type to determine which table
exports.deleteAgency = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;

        if (!type) {
            return res.status(400).json({ 
                status: false, 
                message: 'Type query parameter is required' 
            });
        }

        switch (type.toLowerCase().replace(/\s+/g, '_')) {
            case 'implementing_entity':
            case 'implementing':
                await ImplementingEntity.delete(id);
                break;
            case 'executing_agency':
            case 'executing':
                await ExecutingAgency.delete(id);
                break;
            case 'delivery_partner':
            case 'delivery':
                await DeliveryPartner.delete(id);
                break;
            default:
                return res.status(400).json({ 
                    status: false, 
                    message: 'Invalid type' 
                });
        }

        res.status(200).json({ status: true, message: 'Agency deleted' });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};

// Get agency by ID - tries all three tables
exports.getAgencyById = async (req, res) => {
    try {
        const { id } = req.params;

        // Try implementing entity first
        let result = await ImplementingEntity.getById(id);
        if (result) {
            return res.status(200).json({ 
                status: true, 
                data: { agency_id: result.id, name: result.name, type: 'Implementing Entity' } 
            });
        }

        // Try executing agency
        result = await ExecutingAgency.getById(id);
        if (result) {
            return res.status(200).json({ 
                status: true, 
                data: { agency_id: result.id, name: result.name, type: 'Executing Agency' } 
            });
        }

        // Try delivery partner
        result = await DeliveryPartner.getById(id);
        if (result) {
            return res.status(200).json({ 
                status: true, 
                data: { agency_id: result.id, name: result.name, type: 'Delivery Partner' } 
            });
        }

        return res.status(404).json({ status: false, message: 'Agency not found' });
    } catch (e) {
        res.status(500).json({ status: false, message: `Server Error: ${e.message}` });
    }
};
