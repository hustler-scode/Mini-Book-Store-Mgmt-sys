const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const bookRoutes = require('./bookRoutes');
const donationRoutes = require('./donationRoutes');
const supplierRoutes = require('./supplierRoutes');
const purchaseRoutes = require('./purchaseRoutes');
const lendRoutes = require('./lendRoutes');
const fineRoutes = require('./fineRoutes');
const inLibraryRoutes = require('./inLibraryRoutes');

router.use(authRoutes);
router.use(userRoutes);
router.use(categoryRoutes);
router.use(bookRoutes);
router.use(donationRoutes);
router.use(supplierRoutes);
router.use(purchaseRoutes);
router.use(lendRoutes);
router.use(fineRoutes);
router.use(inLibraryRoutes);

router.get('/api/health', (req, res) => {
  // #swagger.tags = ['System']
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Mini Book Store & Library Management System API'
  });
});

module.exports = router;
