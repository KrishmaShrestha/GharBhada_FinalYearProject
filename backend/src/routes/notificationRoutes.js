const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

// @route   GET /api/notifications
// @desc    Get notifications for current user
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const [notifications] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [req.user.user_id]
        );

        res.json({
            success: true,
            count: notifications.length,
            notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
            [req.params.id, req.user.user_id]
        );

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', authenticate, async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
            [req.user.user_id]
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
});

// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get('/unread-count', authenticate, async (req, res) => {
    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [req.user.user_id]
        );

        res.json({
            success: true,
            count: result[0].count
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ success: false, message: 'Failed to get unread count' });
    }
});

module.exports = router;
