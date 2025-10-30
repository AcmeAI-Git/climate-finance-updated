const express = require('express');
const router = express.Router();
const controller = require('../controllers/pendingDocumentRepository.controller');

router.post('/create', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
