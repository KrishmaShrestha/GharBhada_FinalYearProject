const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

// @route   GET /api/payments
// @desc    Get payments for current user
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        let query;
        const params = [req.user.user_id];

        if (req.user.role === 'tenant') {
            query = `
        SELECT p.*, b.property_id, pr.title as property_title,
        u.full_name as owner_name
        FROM payments p
        JOIN bookings b ON p.booking_id = b.booking_id
        JOIN properties pr ON b.property_id = pr.property_id
        JOIN users u ON p.owner_id = u.user_id
        WHERE p.tenant_id = ?
        ORDER BY p.created_at DESC
      `;
        } else if (req.user.role === 'owner') {
            query = `
        SELECT p.*, b.property_id, pr.title as property_title,
        u.full_name as tenant_name
        FROM payments p
        JOIN bookings b ON p.booking_id = b.booking_id
        JOIN properties pr ON b.property_id = pr.property_id
        JOIN users u ON p.tenant_id = u.user_id
        WHERE p.owner_id = ?
        ORDER BY p.created_at DESC
      `;
        } else {
            query = `
        SELECT p.*, b.property_id, pr.title as property_title,
        t.full_name as tenant_name, o.full_name as owner_name
        FROM payments p
        JOIN bookings b ON p.booking_id = b.booking_id
        JOIN properties pr ON b.property_id = pr.property_id
        JOIN users t ON p.tenant_id = t.user_id
        JOIN users o ON p.owner_id = o.user_id
        ORDER BY p.created_at DESC
      `;
            params.pop(); // Remove user_id for admin
        }

        const [payments] = await pool.query(query, req.user.role === 'admin' ? [] : params);

        res.json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
});

// @route   POST /api/payments/esewa
// @desc    Process eSewa payment
// @access  Private/Tenant
router.post('/esewa', authenticate, async (req, res) => {
    try {
        const { booking_id, amount, payment_type, payment_for_month } = req.body;

        // Get booking details
        const [bookings] = await pool.query(
            'SELECT owner_id FROM bookings WHERE booking_id = ? AND tenant_id = ?',
            [booking_id, req.user.user_id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // In production, integrate with actual eSewa API
        const transaction_id = 'ESW' + Date.now();

        const [result] = await pool.query(
            `INSERT INTO payments (booking_id, tenant_id, owner_id, amount, payment_type, payment_method, transaction_id, payment_status, payment_for_month)
       VALUES (?, ?, ?, ?, ?, 'esewa', ?, 'completed', ?)`,
            [booking_id, req.user.user_id, bookings[0].owner_id, amount, payment_type, transaction_id, payment_for_month]
        );

        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            payment_id: result.insertId,
            transaction_id
        });
    } catch (error) {
        console.error('eSewa payment error:', error);
        res.status(500).json({ success: false, message: 'Payment processing failed' });
    }
});

// @route   POST /api/payments/khalti
// @desc    Process Khalti payment
// @access  Private/Tenant
router.post('/khalti', authenticate, async (req, res) => {
    try {
        const { booking_id, amount, payment_type, payment_for_month } = req.body;

        const [bookings] = await pool.query(
            'SELECT owner_id FROM bookings WHERE booking_id = ? AND tenant_id = ?',
            [booking_id, req.user.user_id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // In production, integrate with actual Khalti API
        const transaction_id = 'KHL' + Date.now();

        const [result] = await pool.query(
            `INSERT INTO payments (booking_id, tenant_id, owner_id, amount, payment_type, payment_method, transaction_id, payment_status, payment_for_month)
       VALUES (?, ?, ?, ?, ?, 'khalti', ?, 'completed', ?)`,
            [booking_id, req.user.user_id, bookings[0].owner_id, amount, payment_type, transaction_id, payment_for_month]
        );

        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            payment_id: result.insertId,
            transaction_id
        });
    } catch (error) {
        console.error('Khalti payment error:', error);
        res.status(500).json({ success: false, message: 'Payment processing failed' });
    }
});

// @route   POST /api/payments/stripe
// @desc    Process Stripe payment
// @access  Private/Tenant
router.post('/stripe', authenticate, async (req, res) => {
    try {
        const { booking_id, amount, payment_type, payment_for_month } = req.body;

        const [bookings] = await pool.query(
            'SELECT owner_id FROM bookings WHERE booking_id = ? AND tenant_id = ?',
            [booking_id, req.user.user_id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // In production, integrate with actual Stripe API
        const transaction_id = 'STR_' + Date.now();

        const [result] = await pool.query(
            `INSERT INTO payments (booking_id, tenant_id, owner_id, amount, payment_type, payment_method, transaction_id, payment_status, payment_for_month)
       VALUES (?, ?, ?, ?, ?, 'stripe', ?, 'completed', ?)`,
            [booking_id, req.user.user_id, bookings[0].owner_id, amount, payment_type, transaction_id, payment_for_month]
        );

        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            payment_id: result.insertId,
            transaction_id
        });
    } catch (error) {
        console.error('Stripe payment error:', error);
        res.status(500).json({ success: false, message: 'Payment processing failed' });
    }
});

module.exports = router;
