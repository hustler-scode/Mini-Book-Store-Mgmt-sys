const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

// #swagger.tags = ['Purchases']
router.get('/api/purchases', purchaseController.getPurchases);
router.get('/api/purchases/:id', purchaseController.getPurchaseById);
router.post('/api/purchases', purchaseController.createPurchase);
router.post('/api/purchases/:id/receive', purchaseController.receivePurchase);

module.exports = router;
