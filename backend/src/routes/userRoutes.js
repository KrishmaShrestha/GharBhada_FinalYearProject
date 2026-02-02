const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { pool } = require('../config/database');

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT user_id, email, full_name, phone, role, is_verified, is_active, created_at FROM users ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, upload.single('profileImage'), async (req, res) => {
    try {
        const { full_name, phone } = req.body;
        const updates = {};

        if (full_name) updates.full_name = full_name;
        if (phone) updates.phone = phone;
        if (req.file) updates.profile_image = req.file.path;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No updates provided' });
        }

        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), req.user.user_id];

        await pool.query(
            `UPDATE users SET ${setClause} WHERE user_id = ?`,
            values
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// @route   GET /api/users/pending
// @desc    Get all pending users (Admin only)
// @access  Private/Admin
router.get('/pending', authenticate, authorize('admin'), async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT user_id, email, full_name, phone, role, created_at FROM users WHERE approval_status = ? ORDER BY created_at DESC',
            ['pending']
        );

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Get pending users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending users' });
    }
});

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private/Admin
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN approval_status = 'pending' THEN 1 ELSE 0 END) as pending_users,
                SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) as approved_users,
                SUM(CASE WHEN approval_status = 'rejected' THEN 1 ELSE 0 END) as rejected_users,
                SUM(CASE WHEN role = 'owner' THEN 1 ELSE 0 END) as total_owners,
                SUM(CASE WHEN role = 'tenant' THEN 1 ELSE 0 END) as total_tenants
            FROM users
            WHERE role != 'admin'
        `);

        res.json({
            success: true,
            stats: stats[0]
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
});

// @route   PUT /api/users/:id/approve
// @desc    Approve a user (Admin only)
// @access  Private/Admin
router.put('/:id/approve', authenticate, authorize('admin'), async (req, res) => {
    try {
        const userId = req.params.id;
        const adminId = req.user.user_id;

        // Check if user exists and is pending
        const [users] = await pool.query(
            'SELECT user_id, email, full_name, approval_status FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (users[0].approval_status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `User is already ${users[0].approval_status}`
            });
        }

        // Approve the user
        await pool.query(
            'UPDATE users SET approval_status = ?, approved_by = ?, approved_at = NOW() WHERE user_id = ?',
            ['approved', adminId, userId]
        );

        res.json({
            success: true,
            message: `User ${users[0].full_name} approved successfully`
        });
    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve user' });
    }
});

// @route   PUT /api/users/:id/reject
// @desc    Reject a user (Admin only)
// @access  Private/Admin
router.put('/:id/reject', authenticate, authorize('admin'), async (req, res) => {
    try {
        const userId = req.params.id;
        const adminId = req.user.user_id;

        // Check if user exists and is pending
        const [users] = await pool.query(
            'SELECT user_id, email, full_name, approval_status FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (users[0].approval_status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `User is already ${users[0].approval_status}`
            });
        }

        // Reject the user
        await pool.query(
            'UPDATE users SET approval_status = ?, approved_by = ?, approved_at = NOW() WHERE user_id = ?',
            ['rejected', adminId, userId]
        );

        res.json({
            success: true,
            message: `User ${users[0].full_name} rejected`
        });
    } catch (error) {
        console.error('Reject user error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject user' });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT user_id, email, full_name, phone, role, profile_image, is_verified, created_at FROM users WHERE user_id = ?',
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
});

module.exports = router;
