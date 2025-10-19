const express = require('express');
const router = express.Router();
const controller = require('../controllers/location.controller');

router.post('/add-location', controller.addLocation);
router.get('/all', controller.getAllLocations);
router.put('/update/:id', controller.updateLocation);
router.delete('/delete/:id', controller.deleteLocation);
router.get('/get/:id', controller.getLocationById);

module.exports = router;
