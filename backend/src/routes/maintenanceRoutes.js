const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { pool } = require('../config/database');

// @route   GET /api/maintenance
// @desc    Get maintenance requests
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        let query;
        const params = [req.user.user_id];

        if (req.user.role === 'tenant') {
            query = `
        SELECT m.*, p.title as property_title, p.address
        FROM maintenance_requests m
        JOIN properties p ON m.property_id = p.property_id
        WHERE m.tenant_id = ?
        ORDER BY m.created_at DESC
      `;
        } else if (req.user.role === 'owner') {
            query = `
        SELECT m.*, p.title as property_title, p.address,
        u.full_name as tenant_name, u.phone as tenant_phone
        FROM maintenance_requests m
        JOIN properties p ON m.property_id = p.property_id
        JOIN users u ON m.tenant_id = u.user_id
        WHERE m.owner_id = ?
        ORDER BY m.created_at DESC
      `;
        } else {
            query = `
        SELECT m.*, p.title as property_title, p.address,
        t.full_name as tenant_name, o.full_name as owner_name
        FROM maintenance_requests m
        JOIN properties p ON m.property_id = p.property_id
        JOIN users t ON m.tenant_id = t.user_id
        JOIN users o ON m.owner_id = o.user_id
        ORDER BY m.created_at DESC
      `;
            params.pop();
        }

        const [requests] = await pool.query(query, req.user.role === 'admin' ? [] : params);

        res.json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error('Get maintenance requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch maintenance requests' });
    }
});

// @route   POST /api/maintenance
// @desc    Create maintenance request
// @access  Private/Tenant
router.post('/', authenticate, authorize('tenant'), upload.array('maintenanceImages', 5), async (req, res) => {
    try {
        const { property_id, title, description, priority } = req.body;

        // Get property owner
        const [properties] = await pool.query(
            'SELECT owner_id FROM properties WHERE property_id = ?',
            [property_id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const images = req.files ? req.files.map(file => file.path) : [];

        const [result] = await pool.query(
            `INSERT INTO maintenance_requests (property_id, tenant_id, owner_id, title, description, priority, images)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [property_id, req.user.user_id, properties[0].owner_id, title, description, priority, JSON.stringify(images)]
        );

        res.status(201).json({
            success: true,
            message: 'Maintenance request created successfully',
            request_id: result.insertId
        });
    } catch (error) {
        console.error('Create maintenance request error:', error);
        res.status(500).json({ success: false, message: 'Failed to create maintenance request' });
    }
});

// @route   PUT /api/maintenance/:id/status
// @desc    Update maintenance request status
// @access  Private/Owner
router.put('/:id/status', authenticate, authorize('owner', 'admin'), async (req, res) => {
    try {
        const { status, notes } = req.body;

        await pool.query(
            'UPDATE maintenance_requests SET status = ?, notes = ?, resolved_date = ? WHERE request_id = ?',
            [status, notes, status === 'completed' ? new Date() : null, req.params.id]
        );

        res.json({
            success: true,
            message: 'Maintenance request updated successfully'
        });
    } catch (error) {
        console.error('Update maintenance request error:', error);
        res.status(500).json({ success: false, message: 'Failed to update maintenance request' });
    }
});

module.exports = router;
