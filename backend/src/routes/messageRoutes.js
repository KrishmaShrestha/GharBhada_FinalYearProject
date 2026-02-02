const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

// @route   GET /api/messages
// @desc    Get messages for current user
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const [messages] = await pool.query(
            `SELECT m.*, 
       sender.full_name as sender_name, sender.profile_image as sender_image,
       receiver.full_name as receiver_name, receiver.profile_image as receiver_image,
       p.title as property_title
       FROM messages m
       JOIN users sender ON m.sender_id = sender.user_id
       JOIN users receiver ON m.receiver_id = receiver.user_id
       LEFT JOIN properties p ON m.property_id = p.property_id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.created_at DESC`,
            [req.user.user_id, req.user.user_id]
        );

        res.json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', authenticate, async (req, res) => {
    try {
        const { receiver_id, property_id, message } = req.body;

        const [result] = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, property_id, message) VALUES (?, ?, ?, ?)',
            [req.user.user_id, receiver_id, property_id, message]
        );

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            message_id: result.insertId
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        await pool.query(
            'UPDATE messages SET is_read = TRUE WHERE message_id = ? AND receiver_id = ?',
            [req.params.id, req.user.user_id]
        );

        res.json({
            success: true,
            message: 'Message marked as read'
        });
    } catch (error) {
        console.error('Mark message read error:', error);
        res.status(500).json({ success: false, message: 'Failed to update message' });
    }
});

module.exports = router;
