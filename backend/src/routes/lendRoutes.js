const express = require('express');
const router = express.Router();
const lendController = require('../controllers/lendController');

// #swagger.tags = ['Lending']
router.get('/api/lends', lendController.getLends);
router.get('/api/lends/overdue', lendController.getOverdueLends);
router.get('/api/lends/:id', lendController.getLendById);
router.post('/api/lends/borrow', lendController.borrowBook);
router.post('/api/lends/:id/return', lendController.returnBook);

module.exports = router;
