const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// #swagger.tags = ['Suppliers']
router.get('/api/suppliers', supplierController.getSuppliers);
router.get('/api/suppliers/:id', supplierController.getSupplierById);
router.post('/api/suppliers', supplierController.createSupplier);
router.put('/api/suppliers/:id', supplierController.updateSupplier);
router.delete('/api/suppliers/:id', supplierController.deleteSupplier);

module.exports = router;
