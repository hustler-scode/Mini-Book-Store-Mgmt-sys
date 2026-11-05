const express = require('express');
const router = express.Router();
const inLibraryController = require('../controllers/inLibraryController');

// #swagger.tags = ['In-Library']
router.get('/api/in-library', inLibraryController.getSessions);
router.get('/api/in-library/overdue', inLibraryController.getOverdueSessions);
router.get('/api/in-library/:id', inLibraryController.getSessionById);
router.post('/api/in-library/start', inLibraryController.startSession);
router.post('/api/in-library/:id/return', inLibraryController.returnSession);

module.exports = router;
