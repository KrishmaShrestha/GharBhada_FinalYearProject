const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const ownerController = require('../controllers/ownerController');

// All routes here are private and for owners/admins
router.use(authenticate, authorize('owner', 'admin'));

// @route   GET /api/owner/dashboard/stats
router.get('/dashboard/stats', ownerController.getDashboardStats);

// @route   PUT /api/owner/bank-details
router.put('/bank-details', ownerController.updateBankDetails);

// @route   GET /api/owner/properties
router.get('/properties', ownerController.getProperties);

// @route   GET /api/owner/booking-requests
router.get('/booking-requests', ownerController.getBookingRequests);

// @route   GET /api/owner/agreements
router.get('/agreements', ownerController.getAgreements);

// @route   GET /api/owner/notifications
router.get('/notifications', ownerController.getNotifications);

// @route   GET /api/owner/payments
router.get('/payments', ownerController.getPaymentHistory);

// @route   POST /api/owner/record-payment
router.post('/record-payment', ownerController.recordPayment);

module.exports = router;
