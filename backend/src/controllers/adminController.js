const { pool } = require('../config/database');

// Helper function to log admin actions
const logAdminAction = async (adminId, actionType, targetType, targetId, oldValue, newValue, notes) => {
    try {
        await pool.query(
            'INSERT INTO system_logs (admin_id, action_type, target_type, target_id, old_value, new_value, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [adminId, actionType, targetType, targetId, oldValue, newValue, notes]
        );
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
};

// ==================== USER MANAGEMENT ====================

// Get all users with filters
exports.getAllUsers = async (req, res) => {
    try {
        const { role, approval_status, trust_level, search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT user_id, email, full_name, phone, role, is_verified, is_active, approval_status, trust_level, suspension_reason, suspended_at, created_at FROM users WHERE 1=1';
        const params = [];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }
        if (approval_status) {
            query += ' AND approval_status = ?';
            params.push(approval_status);
        }
        if (trust_level) {
            query += ' AND trust_level = ?';
            params.push(trust_level);
        }
        if (search) {
            query += ' AND (full_name LIKE ? OR email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [users] = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const countParams = [];
        if (role) {
            countQuery += ' AND role = ?';
            countParams.push(role);
        }
        if (approval_status) {
            countQuery += ' AND approval_status = ?';
            countParams.push(approval_status);
        }
        if (trust_level) {
            countQuery += ' AND trust_level = ?';
            countParams.push(trust_level);
        }
        if (search) {
            countQuery += ' AND (full_name LIKE ? OR email LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }

        const [countResult] = await pool.query(countQuery, countParams);

        res.json({
            success: true,
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

// Get user details with documents
exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;

        const [users] = await pool.query(
            'SELECT user_id, email, full_name, phone, role, profile_image, is_verified, is_active, approval_status, approved_by, approved_at, trust_level, bank_account_number, bank_name, citizenship_number, permanent_address, trust_level_updated_at, suspension_reason, suspended_at, created_at, updated_at FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get user's documents
        const [documents] = await pool.query(
            'SELECT document_id, document_type, file_name, file_path, is_verified, uploaded_at FROM documents WHERE user_id = ?',
            [userId]
        );

        // Get user's properties if owner
        let properties = [];
        if (users[0].role === 'owner') {
            [properties] = await pool.query(
                'SELECT property_id, title, property_type, city, price_per_month, is_available, admin_approval_status, created_at FROM properties WHERE owner_id = ?',
                [userId]
            );
        }

        // Get user's bookings if tenant
        let bookings = [];
        if (users[0].role === 'tenant') {
            [bookings] = await pool.query(
                'SELECT booking_id, property_id, status, monthly_rent, start_date, end_date, created_at FROM bookings WHERE tenant_id = ?',
                [userId]
            );
        }

        res.json({
            success: true,
            user: users[0],
            documents,
            properties,
            bookings
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user details' });
    }
};

// Suspend user
exports.suspendUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { reason } = req.body;
        const adminId = req.user.user_id;

        if (!reason) {
            return res.status(400).json({ success: false, message: 'Suspension reason is required' });
        }

        const [users] = await pool.query('SELECT full_name, is_active FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await pool.query(
            'UPDATE users SET is_active = FALSE, suspension_reason = ?, suspended_at = NOW() WHERE user_id = ?',
            [reason, userId]
        );

        await logAdminAction(adminId, 'user_suspension', 'user', userId, 'active', 'suspended', reason);

        res.json({
            success: true,
            message: `User ${users[0].full_name} suspended successfully`
        });
    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({ success: false, message: 'Failed to suspend user' });
    }
};

// Activate user
exports.activateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const adminId = req.user.user_id;

        const [users] = await pool.query('SELECT full_name FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await pool.query(
            'UPDATE users SET is_active = TRUE, suspension_reason = NULL, suspended_at = NULL WHERE user_id = ?',
            [userId]
        );

        await logAdminAction(adminId, 'user_suspension', 'user', userId, 'suspended', 'active', 'Account reactivated');

        res.json({
            success: true,
            message: `User ${users[0].full_name} activated successfully`
        });
    } catch (error) {
        console.error('Activate user error:', error);
        res.status(500).json({ success: false, message: 'Failed to activate user' });
    }
};

// Update trust level
exports.updateTrustLevel = async (req, res) => {
    try {
        const userId = req.params.id;
        const { trust_level } = req.body;
        const adminId = req.user.user_id;

        if (!['regular', 'trusted'].includes(trust_level)) {
            return res.status(400).json({ success: false, message: 'Invalid trust level' });
        }

        const [users] = await pool.query('SELECT full_name, role, trust_level FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (users[0].role !== 'owner') {
            return res.status(400).json({ success: false, message: 'Trust level can only be set for owners' });
        }

        await pool.query(
            'UPDATE users SET trust_level = ?, trust_level_updated_at = NOW() WHERE user_id = ?',
            [trust_level, userId]
        );

        await logAdminAction(adminId, 'trust_level_update', 'user', userId, users[0].trust_level, trust_level, `Trust level updated to ${trust_level}`);

        res.json({
            success: true,
            message: `Trust level updated to ${trust_level} for ${users[0].full_name}`
        });
    } catch (error) {
        console.error('Update trust level error:', error);
        res.status(500).json({ success: false, message: 'Failed to update trust level' });
    }
};

// ==================== PROPERTY MANAGEMENT ====================

// Get all properties with filters
exports.getAllProperties = async (req, res) => {
    try {
        const { admin_approval_status, city, property_type, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*, u.full_name as owner_name, u.email as owner_email, u.trust_level
            FROM properties p
            JOIN users u ON p.owner_id = u.user_id
            WHERE 1=1
        `;
        const params = [];

        if (admin_approval_status) {
            query += ' AND p.admin_approval_status = ?';
            params.push(admin_approval_status);
        }
        if (city) {
            query += ' AND p.city = ?';
            params.push(city);
        }
        if (property_type) {
            query += ' AND p.property_type = ?';
            params.push(property_type);
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [properties] = await pool.query(query, params);

        const processedProperties = properties.map(p => ({
            ...p,
            images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
        }));

        res.json({
            success: true,
            properties: processedProperties,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch properties' });
    }
};

// Get pending properties
exports.getPendingProperties = async (req, res) => {
    try {
        const [properties] = await pool.query(`
            SELECT p.*, u.full_name as owner_name, u.email as owner_email, u.phone as owner_phone, u.trust_level
            FROM properties p
            JOIN users u ON p.owner_id = u.user_id
            WHERE p.admin_approval_status = 'pending'
            ORDER BY p.created_at DESC
        `);

        const processedProperties = properties.map(p => ({
            ...p,
            images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
        }));

        res.json({
            success: true,
            count: processedProperties.length,
            properties: processedProperties
        });
    } catch (error) {
        console.error('Get pending properties error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending properties' });
    }
};

// Approve property
exports.approveProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const adminId = req.user.user_id;
        const { notes } = req.body;

        const [properties] = await pool.query('SELECT title, admin_approval_status FROM properties WHERE property_id = ?', [propertyId]);
        if (properties.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        if (properties[0].admin_approval_status !== 'pending') {
            return res.status(400).json({ success: false, message: `Property is already ${properties[0].admin_approval_status}` });
        }

        await pool.query(
            'UPDATE properties SET admin_approval_status = ?, approved_by_admin = ?, approval_date = NOW(), admin_notes = ? WHERE property_id = ?',
            ['approved', adminId, notes || null, propertyId]
        );

        await logAdminAction(adminId, 'property_approval', 'property', propertyId, 'pending', 'approved', notes);

        res.json({
            success: true,
            message: `Property "${properties[0].title}" approved successfully`
        });
    } catch (error) {
        console.error('Approve property error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve property' });
    }
};

// Reject property
exports.rejectProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const adminId = req.user.user_id;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        }

        const [properties] = await pool.query('SELECT title, admin_approval_status FROM properties WHERE property_id = ?', [propertyId]);
        if (properties.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        await pool.query(
            'UPDATE properties SET admin_approval_status = ?, approved_by_admin = ?, approval_date = NOW(), admin_notes = ? WHERE property_id = ?',
            ['rejected', adminId, reason, propertyId]
        );

        await logAdminAction(adminId, 'property_rejection', 'property', propertyId, 'pending', 'rejected', reason);

        res.json({
            success: true,
            message: `Property "${properties[0].title}" rejected`
        });
    } catch (error) {
        console.error('Reject property error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject property' });
    }
};

// Deactivate property
exports.deactivateProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const adminId = req.user.user_id;
        const { reason } = req.body;

        const [properties] = await pool.query('SELECT title FROM properties WHERE property_id = ?', [propertyId]);
        if (properties.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        await pool.query(
            'UPDATE properties SET is_available = FALSE, admin_notes = ? WHERE property_id = ?',
            [reason || 'Deactivated by admin', propertyId]
        );

        await logAdminAction(adminId, 'other', 'property', propertyId, 'active', 'deactivated', reason);

        res.json({
            success: true,
            message: `Property "${properties[0].title}" deactivated`
        });
    } catch (error) {
        console.error('Deactivate property error:', error);
        res.status(500).json({ success: false, message: 'Failed to deactivate property' });
    }
};

// ==================== DASHBOARD STATS ====================

exports.getDashboardStats = async (req, res) => {
    try {
        // User stats
        const [userStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN role = 'owner' THEN 1 ELSE 0 END) as total_owners,
                SUM(CASE WHEN role = 'tenant' THEN 1 ELSE 0 END) as total_tenants,
                SUM(CASE WHEN approval_status = 'pending' THEN 1 ELSE 0 END) as pending_approvals,
                SUM(CASE WHEN trust_level = 'trusted' AND role = 'owner' THEN 1 ELSE 0 END) as trusted_owners
            FROM users WHERE role != 'admin'
        `);

        // Property stats
        const [propertyStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_properties,
                SUM(CASE WHEN admin_approval_status = 'pending' THEN 1 ELSE 0 END) as pending_properties,
                SUM(CASE WHEN admin_approval_status = 'approved' THEN 1 ELSE 0 END) as approved_properties,
                SUM(CASE WHEN is_available = TRUE THEN 1 ELSE 0 END) as available_properties
            FROM properties
        `);

        // Booking stats
        const [bookingStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_bookings,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_bookings,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings
            FROM bookings
        `);

        // Payment stats
        const [paymentStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_transactions,
                SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_revenue,
                SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_payments
            FROM payments
        `);

        // Complaint stats
        const [complaintStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_complaints,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_complaints,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_complaints
            FROM complaints
        `);

        res.json({
            success: true,
            stats: {
                users: userStats[0],
                properties: propertyStats[0],
                bookings: bookingStats[0],
                payments: paymentStats[0],
                complaints: complaintStats[0]
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics' });
    }
};

module.exports = exports;
