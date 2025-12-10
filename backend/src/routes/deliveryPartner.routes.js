const express = require('express');
const router = express.Router();
const controller = require('../controllers/deliveryPartner.controller');

router.post('/add', controller.addDeliveryPartner);
router.get('/all', controller.getAllDeliveryPartners);
router.put('/update/:id', controller.updateDeliveryPartner);
router.delete('/delete/:id', controller.deleteDeliveryPartner);
router.get('/get/:id', controller.getDeliveryPartnerById);
router.post('/find-or-create', controller.findOrCreateDeliveryPartner);

module.exports = router;
