const { pool } = require('../config/database');

/**
 * Create a notification for a user
 * @param {number} userId - The ID of the user to notify
 * @param {string} title - Notification title
 * @param {string} message - Notification message body
 * @param {string} type - Type of notification (booking, agreement, payment, system)
 * @param {number} relatedId - ID of the related entity (booking_id, agreement_id, etc.)
 */
const createNotification = async (userId, title, message, type, relatedId = null) => {
    try {
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?)',
            [userId, title, message, type, relatedId]
        );
        return true;
    } catch (error) {
        console.error('Error creating notification:', error);
        return false;
    }
};

module.exports = {
    createNotification
};
