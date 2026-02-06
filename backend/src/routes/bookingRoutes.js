const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { pool } = require('../config/database');
const { createNotification } = require('../utils/notificationHelper');

// @route   GET /api/bookings
// @desc    Get bookings for current user
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        let query;
        if (req.user.role === 'tenant') {
            query = `
        SELECT b.*, p.title as property_title, p.address, p.city, p.images as property_images,
        u.full_name as owner_name, u.phone as owner_phone
        FROM bookings b
        JOIN properties p ON b.property_id = p.property_id
        LEFT JOIN users u ON b.owner_id = u.user_id
        WHERE b.tenant_id = ?
        ORDER BY b.created_at DESC
      `;
        } else if (req.user.role === 'owner') {
            query = `
        SELECT b.*, p.title as property_title, p.address, p.city, p.images as property_images,
        u.full_name as tenant_name, u.phone as tenant_phone
        FROM bookings b
        JOIN properties p ON b.property_id = p.property_id
        LEFT JOIN users u ON b.tenant_id = u.user_id
        WHERE b.owner_id = ?
        ORDER BY b.created_at DESC
      `;
        } else {
            query = `
        SELECT b.*, p.title as property_title, p.address, p.city, p.images as property_images,
        t.full_name as tenant_name, o.full_name as owner_name
        FROM bookings b
        JOIN properties p ON b.property_id = p.property_id
        LEFT JOIN users t ON b.tenant_id = t.user_id
        LEFT JOIN users o ON b.owner_id = o.user_id
        ORDER BY b.created_at DESC
      `;
        }

        const [bookings] = await pool.query(query, [req.user.user_id]);

        // Process images
        const processedBookings = bookings.map(booking => {
            let images = [];
            try {
                images = typeof booking.property_images === 'string'
                    ? JSON.parse(booking.property_images)
                    : booking.property_images;
            } catch (e) {
                images = [];
            }

            return {
                ...booking,
                property_image: images && images.length > 0 ? images[0] : null
            };
        });

        res.json({
            success: true,
            count: processedBookings.length,
            bookings: processedBookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
});

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private/Tenant
router.post('/', authenticate, authorize('tenant'), async (req, res) => {
    try {
        const {
            property_id, start_date, end_date, notes,
            tenant_fullname, tenant_phone, tenant_address, tenant_citizen_number,
            full_name, phone, address, citizen_number // Mapped from frontend
        } = req.body;

        if (!property_id || !start_date) {
            return res.status(400).json({ success: false, message: 'Property ID and Start Date are required' });
        }

        // Get property details
        const [properties] = await pool.query(
            'SELECT owner_id, title, price_per_month, security_deposit, is_available FROM properties WHERE property_id = ?',
            [property_id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const property = properties[0];

        if (!property.is_available) {
            return res.status(400).json({ success: false, message: 'Property is not available' });
        }

        // Create booking with tenant details
        const [result] = await pool.query(
            `INSERT INTO bookings (
                property_id, tenant_id, owner_id, start_date, end_date, 
                monthly_rent, security_deposit, notes,
                tenant_fullname, tenant_phone, tenant_address, tenant_citizen_number,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                property_id, req.user.user_id, property.owner_id, start_date || null, end_date || null,
                property.price_per_month, property.security_deposit || 5000, notes,
                tenant_fullname || full_name || req.user.full_name,
                tenant_phone || phone || req.user.phone,
                tenant_address || address,
                tenant_citizen_number || citizen_number,
            ]
        );

        const bookingId = result.insertId;

        // Notify Owner
        await createNotification(
            property.owner_id,
            'New Booking Request',
            `You have a new booking request for "${properties[0].title || 'your property'}" from ${req.user.full_name}.`,
            'booking',
            bookingId
        );

        res.status(201).json({
            success: true,
            message: 'Booking request created successfully',
            booking_id: bookingId
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
    }
});

// @route   PUT /api/bookings/:id/duration
// @desc    Tenant submits desired lease duration
// @access  Private/Tenant
router.put('/:id/duration', authenticate, authorize('tenant'), async (req, res) => {
    try {
        const { rental_years, rental_months } = req.body;

        const [bookings] = await pool.query(
            'SELECT tenant_id, status FROM bookings WHERE booking_id = ?',
            [req.params.id]
        );

        if (bookings.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (bookings[0].tenant_id !== req.user.user_id) return res.status(403).json({ success: false, message: 'Unauthorized' });
        if (bookings[0].status !== 'accepted') return res.status(400).json({ success: false, message: 'Owner must approve request first' });

        await pool.query(
            'UPDATE bookings SET rental_years = ?, rental_months = ?, status = "duration_pending" WHERE booking_id = ?',
            [rental_years || 1, rental_months || 0, req.params.id]
        );

        res.json({ success: true, message: 'Duration submitted for owner review' });
    } catch (error) {
        console.error('Update duration error:', error);
        res.status(500).json({ success: false, message: 'Failed to update duration' });
    }
});

// @route   PUT /api/bookings/:id/approve-duration
// @desc    Owner approves/rejects the lease duration
// @access  Private/Owner
router.put('/:id/approve-duration', authenticate, authorize('owner'), async (req, res) => {
    try {
        const { approved } = req.body;

        const [bookings] = await pool.query(
            'SELECT owner_id, status FROM bookings WHERE booking_id = ?',
            [req.params.id]
        );

        if (bookings.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (bookings[0].owner_id !== req.user.user_id) return res.status(403).json({ success: false, message: 'Unauthorized' });
        if (bookings[0].status !== 'duration_pending') return res.status(400).json({ success: false, message: 'No duration pending approval' });

        await pool.query(
            'UPDATE bookings SET status = ?, approved_duration = ?, duration_approval_date = NOW() WHERE booking_id = ?',
            [approved ? 'duration_approved' : 'duration_rejected', approved, req.params.id]
        );

        res.json({
            success: true,
            message: approved ? 'Duration approved successfully' : 'Duration rejected'
        });
    } catch (error) {
        console.error('Approve duration error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve duration' });
    }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (Accept/Reject by Owner)
// @access  Private/Owner
router.put('/:id/status', authenticate, authorize('owner', 'admin'), async (req, res) => {
    try {
        const { status, reason, electricity_rate, water_bill, garbage_bill, rules_and_regulations } = req.body;

        // Get full booking details
        const [bookings] = await pool.query(
            `SELECT b.*, p.title as property_title, p.price_per_month, p.security_deposit,
             t.full_name as tenant_name, t.phone as tenant_phone
             FROM bookings b
             JOIN properties p ON b.property_id = p.property_id
             JOIN users t ON b.tenant_id = t.user_id
             WHERE b.booking_id = ?`,
            [req.params.id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const booking = bookings[0];

        if (booking.owner_id !== req.user.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Update booking status
        await pool.query(
            'UPDATE bookings SET status = ?, approved_date = ?, rejection_reason = ? WHERE booking_id = ?',
            [status, status === 'accepted' ? new Date() : null, reason || null, req.params.id]
        );

        // If accepted, automatically create rental agreement
        if (status === 'accepted') {
            // Create rental agreement with default or provided values
            const [agreementResult] = await pool.query(
                `INSERT INTO rental_agreements (
                    booking_id, property_id, tenant_id, owner_id, 
                    base_rent, deposit_amount, electricity_rate, water_bill, garbage_bill,
                    rules_and_regulations, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'agreement_pending')`,
                [
                    req.params.id,
                    booking.property_id,
                    booking.tenant_id,
                    booking.owner_id,
                    booking.monthly_rent || booking.price_per_month,
                    booking.security_deposit || 5000,
                    electricity_rate || 12,
                    water_bill || 500,
                    garbage_bill || 200,
                    rules_and_regulations || 'Follow house rules, maintain cleanliness, no illegal activities.'
                ]
            );

            // Update booking status to agreement_pending
            await pool.query(
                'UPDATE bookings SET status = "agreement_pending" WHERE booking_id = ?',
                [req.params.id]
            );

            // Notify tenant about approval and agreement
            await createNotification(
                booking.tenant_id,
                'Booking Approved! 🎉',
                `Great news! ${req.user.full_name} has approved your booking request for "${booking.property_title}". Please review and sign the rental agreement to proceed.`,
                'agreement',
                agreementResult.insertId
            );
        } else if (status === 'rejected') {
            // Notify tenant about rejection
            await createNotification(
                booking.tenant_id,
                'Booking Request Declined',
                `Unfortunately, your booking request for "${booking.property_title}" has been declined. ${reason ? 'Reason: ' + reason : 'Please try other properties.'}`,
                'booking',
                req.params.id
            );
        }

        res.json({
            success: true,
            message: status === 'accepted'
                ? 'Booking approved and agreement sent to tenant!'
                : `Booking ${status} successfully`
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update booking status' });
    }
});

// @route   POST /api/bookings/:id/agreement
// @desc    Owner creates agreement after duration approval
// @access  Private/Owner
router.post('/:id/agreement', authenticate, authorize('owner'), async (req, res) => {
    try {
        const { electricity_rate, water_bill, garbage_bill, security_deposit, rules } = req.body;

        const [bookings] = await pool.query(
            'SELECT * FROM bookings WHERE booking_id = ?',
            [req.params.id]
        );

        if (bookings.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (bookings[0].owner_id !== req.user.user_id) return res.status(403).json({ success: false, message: 'Unauthorized' });

        // Create agreement entry
        await pool.query(
            `INSERT INTO rental_agreements (
                booking_id, property_id, tenant_id, owner_id, 
                base_rent, deposit_amount, electricity_rate, water_bill, garbage_bill,
                rules_and_regulations, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'agreement_pending')`,
            [
                req.params.id, bookings[0].property_id, bookings[0].tenant_id, req.user.user_id,
                bookings[0].monthly_rent, security_deposit || 5000,
                electricity_rate || 0, water_bill || 0, garbage_bill || 0,
                rules || ''
            ]
        );

        // Update booking status
        await pool.query('UPDATE bookings SET status = "agreement_pending" WHERE booking_id = ?', [req.params.id]);

        // Notify Tenant
        await createNotification(
            bookings[0].tenant_id,
            'Agreement Received',
            `The owner has sent you a rental agreement for "${bookings[0].property_title || 'the property'}". Please review and sign it.`,
            'agreement',
            req.params.id
        );

        res.json({ success: true, message: 'Agreement sent to tenant' });
    } catch (error) {
        console.error('Create agreement error:', error);
        res.status(500).json({ success: false, message: 'Failed to create agreement' });
    }
});

// @route   POST /api/bookings/:id/deposit
// @desc    Tenant pays the initial security deposit
// @access  Private/Tenant
router.post('/:id/deposit', authenticate, authorize('tenant'), async (req, res) => {
    try {
        const { amount, transaction_id, notes } = req.body;

        const [bookings] = await pool.query(
            'SELECT * FROM bookings WHERE booking_id = ?',
            [req.params.id]
        );

        if (bookings.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (bookings[0].tenant_id !== req.user.user_id) return res.status(403).json({ success: false, message: 'Unauthorized' });

        // Build the connection for transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Create payment record
            await connection.query(
                `INSERT INTO payments (
                    booking_id, tenant_id, owner_id, amount, 
                    payment_type, payment_method, transaction_id, 
                    payment_status, notes, property_id
                ) VALUES (?, ?, ?, ?, 'security_deposit', 'bank_transfer', ?, 'completed', ?, ?)`,
                [
                    req.params.id, req.user.user_id, bookings[0].owner_id,
                    amount || bookings[0].security_deposit,
                    transaction_id || 'BANK-' + Date.now(),
                    notes || 'Booking deposit',
                    bookings[0].property_id
                ]
            );

            // 2. Update booking status to active
            await connection.query(
                'UPDATE bookings SET status = "active" WHERE booking_id = ?',
                [req.params.id]
            );

            // 3. Update property availability
            await connection.query(
                'UPDATE properties SET is_available = FALSE WHERE property_id = ?',
                [bookings[0].property_id]
            );

            // 4. Update agreement status to active
            await connection.query(
                'UPDATE rental_agreements SET status = "active", start_date = CURDATE() WHERE booking_id = ?',
                [req.params.id]
            );

            await connection.commit();
            res.json({ success: true, message: 'Deposit paid successfully! Welcome to your new home.' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Pay deposit error:', error);
        res.status(500).json({ success: false, message: 'Failed to record deposit payment' });
    }
});

module.exports = router;
