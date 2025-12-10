const express = require('express');
const router = express.Router();
const controller = require('../controllers/implementingEntity.controller');

router.post('/add', controller.addImplementingEntity);
router.get('/all', controller.getAllImplementingEntities);
router.put('/update/:id', controller.updateImplementingEntity);
router.delete('/delete/:id', controller.deleteImplementingEntity);
router.get('/get/:id', controller.getImplementingEntityById);
router.post('/find-or-create', controller.findOrCreateImplementingEntity);

module.exports = router;
