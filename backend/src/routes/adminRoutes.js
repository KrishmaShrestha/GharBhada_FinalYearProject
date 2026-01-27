const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// ==================== USER MANAGEMENT ====================
router.get('/users', adminController.getAllUsers);
router.get('/users/:id/details', adminController.getUserDetails);
router.put('/users/:id/suspend', adminController.suspendUser);
router.put('/users/:id/activate', adminController.activateUser);
router.put('/users/:id/trust-level', adminController.updateTrustLevel);

// ==================== PROPERTY MANAGEMENT ====================
router.get('/properties', adminController.getAllProperties);
router.get('/properties/pending', adminController.getPendingProperties);
router.put('/properties/:id/approve', adminController.approveProperty);
router.put('/properties/:id/reject', adminController.rejectProperty);
router.delete('/properties/:id/deactivate', adminController.deactivateProperty);

// ==================== DASHBOARD & REPORTS ====================
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;
