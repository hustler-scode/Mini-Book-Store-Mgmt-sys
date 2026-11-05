const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// #swagger.tags = ['Books']
router.get('/api/books', bookController.getBooks);
router.get('/api/books/copies', bookController.getCopies);
router.get('/api/books/copies/:id', bookController.getCopyById);
router.put('/api/books/copies/:id', bookController.updateCopyStatus);
router.get('/api/books/:id', bookController.getBookById);
router.post('/api/books', bookController.createBook);
router.put('/api/books/:id', bookController.updateBook);
router.delete('/api/books/:id', bookController.deleteBook);
router.post('/api/books/:id/copies', bookController.addCopiesToBook);

module.exports = router;
