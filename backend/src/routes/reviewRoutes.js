const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

// @route   GET /api/reviews/property/:propertyId
// @desc    Get reviews for a property
// @access  Public
router.get('/property/:propertyId', async (req, res) => {
    try {
        const [reviews] = await pool.query(
            `SELECT r.*, u.full_name as tenant_name, u.profile_image
       FROM reviews r
       JOIN users u ON r.tenant_id = u.user_id
       WHERE r.property_id = ?
       ORDER BY r.created_at DESC`,
            [req.params.propertyId]
        );

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private/Tenant
router.post('/', authenticate, async (req, res) => {
    try {
        const { property_id, booking_id, rating, comment } = req.body;

        // Check if user has a completed booking for this property
        const [bookings] = await pool.query(
            'SELECT booking_id FROM bookings WHERE booking_id = ? AND tenant_id = ? AND status IN ("completed", "active")',
            [booking_id, req.user.user_id]
        );

        if (bookings.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'You can only review properties you have booked'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO reviews (property_id, tenant_id, booking_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [property_id, req.user.user_id, booking_id, rating, comment]
        );

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review_id: result.insertId
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
});

module.exports = router;
