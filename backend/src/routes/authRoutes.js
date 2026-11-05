const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// #swagger.tags = ['Auth']
router.post('/api/auth/register', authController.register);
router.post('/api/auth/login', authController.login);
router.get('/api/auth/me', authController.me);
router.get('/api/auth/roles', authController.getRoles);

module.exports = router;
