const express = require('express');
const router = express.Router();
const controller = require('../controllers/fundingSource.controller');

// Basic CRUD operations
router.post('/add-funding-source', controller.addFundingSource);
router.get('/all', controller.getAllFundingSources);
router.put('/update/:id', controller.updateFundingSource);
router.delete('/delete/:id', controller.deleteFundingSource);
router.get('/get/:id', controller.getFundingSourceById);

module.exports = router;
