const express = require('express');
const router = express.Router();
const controller = require('../controllers/agency.controller');

router.post('/add-agency', controller.addAgency);
router.get('/all', controller.getAllAgencies);
router.put('/update/:id', controller.updateAgency);
router.delete('/delete/:id', controller.deleteAgency);
router.get('/get/:id', controller.getAgencyById);


module.exports = router;
