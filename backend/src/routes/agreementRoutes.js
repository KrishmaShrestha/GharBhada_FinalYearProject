const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { pool } = require('../config/database');
const { createNotification } = require('../utils/notificationHelper');

// @route   GET /api/agreements
// @desc    Get agreements for current user
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        let query;
        if (req.user.role === 'tenant') {
            query = `
                SELECT a.*, 
                a.base_rent as monthly_rent, a.water_bill as water_charge, a.garbage_bill as garbage_charge,
                a.deposit_amount as security_deposit,
                p.title as property_title, p.address as property_address, p.city,
                o.full_name as owner_name, o.phone as owner_phone, o.bank_name, o.bank_account_number,
                (TIMESTAMPDIFF(MONTH, o.created_at, NOW()) >= 1) as is_trusted_owner,
                b.rental_years, b.rental_months, b.start_date as booking_start_date
                FROM rental_agreements a
                JOIN properties p ON a.property_id = p.property_id
                JOIN users o ON a.owner_id = o.user_id
                JOIN bookings b ON a.booking_id = b.booking_id
                WHERE a.tenant_id = ?
                ORDER BY a.created_at DESC
            `;
        } else {
            query = `
                SELECT a.*, 
                a.base_rent as monthly_rent, a.water_bill as water_charge, a.garbage_bill as garbage_charge,
                a.deposit_amount as security_deposit,
                p.title as property_title, p.address as property_address, p.city,
                t.full_name as tenant_name, t.phone as tenant_phone,
                b.rental_years, b.rental_months
                FROM rental_agreements a
                JOIN properties p ON a.property_id = p.property_id
                JOIN users t ON a.tenant_id = t.user_id
                JOIN bookings b ON a.booking_id = b.booking_id
                WHERE a.owner_id = ?
                ORDER BY a.created_at DESC
            `;
        }

        const [agreements] = await pool.query(query, [req.user.user_id]);

        res.json({
            success: true,
            agreements
        });
    } catch (error) {
        console.error('Get agreements error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch agreements' });
    }
});

// @route   PUT /api/agreements/:id/respond
// @desc    Tenant approves or declines agreement
// @access  Private/Tenant
router.put('/:id/respond', authenticate, authorize('tenant'), async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'

        const [agreements] = await pool.query(
            `SELECT a.*, p.title as property_title, p.address, p.city,
             o.full_name as owner_name, o.bank_name, o.bank_account_number
             FROM rental_agreements a 
             JOIN properties p ON a.property_id = p.property_id 
             JOIN users o ON a.owner_id = o.user_id
             WHERE a.agreement_id = ?`,
            [req.params.id]
        );

        if (agreements.length === 0) return res.status(404).json({ success: false, message: 'Agreement not found' });
        if (agreements[0].tenant_id !== req.user.user_id) return res.status(403).json({ success: false, message: 'Unauthorized' });

        const agreement = agreements[0];
        const newStatus = status === 'approved' ? 'active' : 'terminated';
        const signatureDate = status === 'approved' ? new Date() : null;

        await pool.query(
            'UPDATE rental_agreements SET status = ?, tenant_signature_date = ? WHERE agreement_id = ?',
            [newStatus, signatureDate, req.params.id]
        );

        // If approved, update booking status to 'payment_pending'
        if (status === 'approved') {
            await pool.query(
                'UPDATE bookings SET status = "payment_pending" WHERE booking_id = ?',
                [agreement.booking_id]
            );

            // Notify Owner about approval
            await createNotification(
                agreement.owner_id,
                'Agreement Signed! ✅',
                `${req.user.full_name} has approved and signed the rental agreement for "${agreement.property_title}". They will now proceed with the security deposit payment.`,
                'agreement',
                req.params.id
            );
        } else {
            // Tenant declined the agreement
            await pool.query(
                'UPDATE bookings SET status = "cancelled" WHERE booking_id = ?',
                [agreement.booking_id]
            );

            // Notify Owner about decline
            await createNotification(
                agreement.owner_id,
                'Agreement Declined',
                `${req.user.full_name} has declined the rental agreement for "${agreement.property_title}". The booking has been cancelled.`,
                'agreement',
                req.params.id
            );
        }

        res.json({
            success: true,
            message: status === 'approved'
                ? 'Agreement approved! Please proceed with deposit payment.'
                : 'Agreement declined successfully.'
        });
    } catch (error) {
        console.error('Respond to agreement error:', error);
        res.status(500).json({ success: false, message: 'Failed to respond to agreement' });
    }
});

// @route   PUT /api/agreements/:id/status
// @desc    Owner terminates or suspends agreement
// @access  Private/Owner
router.put('/:id/status', authenticate, authorize('owner'), async (req, res) => {
    try {
        const { status } = req.body; // 'terminated' or 'suspended'

        const [agreements] = await pool.query(
            'SELECT * FROM rental_agreements WHERE agreement_id = ?',
            [req.params.id]
        );

        if (agreements.length === 0) return res.status(404).json({ success: false, message: 'Agreement not found' });
        if (agreements[0].owner_id !== req.user.user_id) return res.status(403).json({ success: false, message: 'Unauthorized' });

        await pool.query(
            'UPDATE rental_agreements SET status = ? WHERE agreement_id = ?',
            [status, req.params.id]
        );

        // If terminated, we might also want to update the booking status to 'completed' or 'cancelled'
        if (status === 'terminated') {
            await pool.query(
                'UPDATE bookings SET status = "cancelled" WHERE booking_id = ?',
                [agreements[0].booking_id]
            );
        }

        res.json({ success: true, message: `Agreement ${status} successfully` });
    } catch (error) {
        console.error('Update agreement status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update agreement status' });
    }
});

module.exports = router;
