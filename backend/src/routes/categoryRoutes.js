const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// #swagger.tags = ['Categories']
router.get('/api/categories', categoryController.getCategories);
router.get('/api/categories/:id', categoryController.getCategoryById);
router.post('/api/categories', categoryController.createCategory);
router.put('/api/categories/:id', categoryController.updateCategory);
router.delete('/api/categories/:id', categoryController.deleteCategory);

module.exports = router;
