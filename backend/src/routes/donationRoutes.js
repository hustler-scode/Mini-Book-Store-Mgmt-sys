const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

// #swagger.tags = ['Donations']
router.get('/api/donations', donationController.getDonationRequests);
router.get('/api/donations/:id', donationController.getDonationRequestById);
router.post('/api/donations', donationController.createDonationRequest);
router.post('/api/donations/:id/approve', donationController.approveDonationRequest);
router.post('/api/donations/:id/reject', donationController.rejectDonationRequest);
router.delete('/api/donations/:id', donationController.deleteDonationRequest);

module.exports = router;
