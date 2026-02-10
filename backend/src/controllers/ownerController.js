const { pool } = require('../config/database');
console.log('DEBUG: ownerController.js is loading - v2-FIXED-SQL');

// ==================== DASHBOARD STATS ====================
exports.getDashboardStats = async (req, res) => {
    try {
        const ownerId = req.user.user_id;

        // Use the owner_statistics view if it exists, otherwise fall back to manual query
        try {
            const [stats] = await pool.query('SELECT * FROM owner_statistics WHERE owner_id = ?', [ownerId]);
            if (stats.length > 0) {
                return res.json({ success: true, stats: stats[0] });
            }
        } catch (e) {
            console.log('owner_statistics view not found, using manual query');
        }

        // Manual Query fallback
        const [propStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_properties,
                SUM(CASE WHEN admin_approval_status = 'approved' THEN 1 ELSE 0 END) as approved_properties,
                SUM(CASE WHEN is_available = TRUE THEN 1 ELSE 0 END) as available_properties
            FROM properties WHERE owner_id = ?
        `, [ownerId]);

        const [bookingStats] = await pool.query(`
            SELECT 
                COUNT(*) as pending_requests
            FROM bookings WHERE owner_id = ? AND status = 'pending'
        `, [ownerId]);

        const [paymentStats] = await pool.query(`
            SELECT 
                COALESCE(SUM(amount), 0) as monthly_earnings
            FROM payments 
            WHERE owner_id = ? AND payment_status = 'completed' 
            AND MONTH(payment_date) = MONTH(CURRENT_DATE())
        `, [ownerId]);

        res.json({
            success: true,
            stats: {
                total_properties: propStats[0].total_properties,
                active_rentals: propStats[0].total_properties - propStats[0].available_properties,
                pending_requests: bookingStats[0].pending_requests,
                monthly_earnings: paymentStats[0].monthly_earnings
            }
        });
    } catch (error) {
        console.error('Get owner stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics' });
    }
};

// ==================== BOOKING REQUESTS ====================
exports.getBookingRequests = async (req, res) => {
    try {
        const ownerId = req.user.user_id;
        const { status = 'pending' } = req.query;

        let query = `
            SELECT b.*, p.title as property_title, u.full_name as tenant_name, u.email as tenant_email,
            u.phone as tenant_phone, u.citizen_number as tenant_citizen_number, u.street_address as tenant_address
            FROM bookings b
            JOIN properties p ON b.property_id = p.property_id
            JOIN users u ON b.tenant_id = u.user_id
            WHERE b.owner_id = ?
        `;
        const params = [ownerId];

        if (status !== 'all') {
            query += ' AND b.status = ?';
            params.push(status);
        }

        query += ' ORDER BY b.created_at DESC';

        const [requests] = await pool.query(query, params);

        res.json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error('Get booking requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch booking requests' });
    }
};

// ==================== BANK DETAILS ====================
exports.updateBankDetails = async (req, res) => {
    try {
        const { bank_name, bank_account_number } = req.body;
        const ownerId = req.user.user_id;

        await pool.query(
            'UPDATE users SET bank_name = ?, bank_account_number = ? WHERE user_id = ?',
            [bank_name, bank_account_number, ownerId]
        );

        res.json({ success: true, message: 'Bank details updated successfully' });
    } catch (error) {
        console.error('Update bank details error:', error);
        res.status(500).json({ success: false, message: 'Failed to update bank details' });
    }
};


// ==================== PROPERTIES ====================
exports.getProperties = async (req, res) => {
    try {
        const ownerId = req.user.user_id;
        const [properties] = await pool.query(`
            SELECT p.*, 
            (SELECT AVG(rating) FROM reviews WHERE property_id = p.property_id) as avg_rating,
            (SELECT COUNT(*) FROM reviews WHERE property_id = p.property_id) as review_count
            FROM properties p
            WHERE p.owner_id = ?
            ORDER BY p.created_at DESC
        `, [ownerId]);

        // Parse JSON fields if necessary
        const processedProperties = properties.map(p => ({
            ...p,
            amenities: typeof p.amenities === 'string' ? JSON.parse(p.amenities || '[]') : p.amenities,
            images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
        }));

        res.json({
            success: true,
            count: processedProperties.length,
            properties: processedProperties
        });
    } catch (error) {
        console.error('Get owner properties error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch properties' });
    }
};

// ==================== AGREEMENTS ====================
exports.getAgreements = async (req, res) => {
    try {
        const ownerId = req.user.user_id;
        const [agreements] = await pool.query(`
            SELECT a.*, p.title as property_title, u.full_name as tenant_name, u.phone as tenant_phone
            FROM rental_agreements a
            JOIN properties p ON a.property_id = p.property_id
            JOIN users u ON a.tenant_id = u.user_id
            WHERE a.owner_id = ?
            ORDER BY a.created_at DESC
        `, [ownerId]);

        res.json({
            success: true,
            count: agreements.length,
            agreements
        });
    } catch (error) {
        console.error('Get agreements error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch agreements' });
    }
};


// ==================== NOTIFICATIONS ====================
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const [notifications] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
            [userId]
        );

        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('Get owner notifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};

// ==================== PAYMENTS ====================
exports.getPaymentHistory = async (req, res) => {
    try {
        const ownerId = req.user.user_id;
        // FIXED QUERY VERSION 2
        const [payments] = await pool.query(`
            SELECT p.*, u.full_name as tenant_name, pr.title as property_title,
            p.electricity_units, p.water_amount, p.garbage_amount, p.deposit_adjustment, p.base_rent
            FROM payments p
            JOIN users u ON p.tenant_id = u.user_id
            JOIN bookings b ON p.booking_id = b.booking_id
            JOIN properties pr ON b.property_id = pr.property_id
            WHERE p.owner_id = ?
            ORDER BY p.payment_date DESC
        `, [ownerId]);

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Get owner payments error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
};

// ==================== RECORD PAYMENT ====================
exports.recordPayment = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            booking_id, amount, payment_type, payment_method, notes,
            electricity_units, water_amount, garbage_amount, deposit_adjustment, base_rent
        } = req.body;
        const ownerId = req.user.user_id;

        // Verify booking ownership
        const [bookings] = await connection.query(
            'SELECT * FROM bookings WHERE booking_id = ? AND owner_id = ?',
            [booking_id, ownerId]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
        }

        // Map frontend payment types to DB enum
        let dbPaymentType = payment_type;
        if (payment_type === 'deposit') dbPaymentType = 'security_deposit';
        if (payment_type === 'monthly_rent') dbPaymentType = 'rent';

        // Record the payment
        const [result] = await connection.query(
            `INSERT INTO payments (
                booking_id, tenant_id, owner_id, amount, payment_type, 
                payment_method, payment_status, notes, payment_date,
                electricity_units, water_amount, garbage_amount, deposit_adjustment, base_rent
            ) VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, NOW(), ?, ?, ?, ?, ?)`,
            [
                booking_id, bookings[0].tenant_id, ownerId, amount, dbPaymentType || 'rent',
                payment_method || 'bank_transfer', notes,
                electricity_units || 0, water_amount || 0, garbage_amount || 0,
                deposit_adjustment || 0, base_rent || amount
            ]
        );

        // If it's a deposit payment, activate the booking and agreement
        if (payment_type === 'security_deposit' || payment_type === 'deposit') {
            await connection.query(
                'UPDATE bookings SET status = "active" WHERE booking_id = ?',
                [booking_id]
            );

            // Also update any pending agreements for this booking to active if not already
            await connection.query(
                'UPDATE rental_agreements SET status = "active" WHERE booking_id = ? AND status = "agreement_pending"',
                [booking_id]
            );
        }

        await connection.commit();
        res.json({
            success: true,
            message: 'Payment recorded successfully',
            payment_id: result.insertId
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Record payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to record payment', error: error.message });
    } finally {
        connection.release();
    }
};

module.exports = exports;
