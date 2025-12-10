const express = require('express');
const router = express.Router();
const controller = require('../controllers/executingAgency.controller');

router.post('/add', controller.addExecutingAgency);
router.get('/all', controller.getAllExecutingAgencies);
router.put('/update/:id', controller.updateExecutingAgency);
router.delete('/delete/:id', controller.deleteExecutingAgency);
router.get('/get/:id', controller.getExecutingAgencyById);
router.post('/find-or-create', controller.findOrCreateExecutingAgency);

module.exports = router;
