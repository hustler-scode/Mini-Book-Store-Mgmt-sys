const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');

// #swagger.tags = ['Fines']
router.get('/api/fines', fineController.getFines);
router.get('/api/fines/:id', fineController.getFineById);
router.post('/api/fines/:id/pay', fineController.payFine);

module.exports = router;
