const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { pool } = require('../config/database');

// @route   GET /api/properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { city, property_type, min_price, max_price, bedrooms, is_available, admin_approval_status } = req.query;

        let query = `
      SELECT p.*, u.full_name as owner_name, u.phone as owner_phone,
      u.created_at as owner_since,
      (TIMESTAMPDIFF(MONTH, u.created_at, NOW()) >= 1) as is_trusted_owner,
      (SELECT AVG(rating) FROM reviews WHERE property_id = p.property_id) as avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE property_id = p.property_id) as review_count
      FROM properties p
      JOIN users u ON p.owner_id = u.user_id
      WHERE 1=1
    `;
        const params = [];

        // By default, only show approved properties for public
        if (admin_approval_status) {
            query += ' AND p.admin_approval_status = ?';
            params.push(admin_approval_status);
        } else {
            query += " AND p.admin_approval_status = 'approved'";
        }

        if (city) {
            query += ' AND p.city = ?';
            params.push(city);
        }
        if (property_type) {
            query += ' AND p.property_type = ?';
            params.push(property_type);
        }
        if (min_price) {
            query += ' AND p.price_per_month >= ?';
            params.push(min_price);
        }
        if (max_price) {
            query += ' AND p.price_per_month <= ?';
            params.push(max_price);
        }
        if (bedrooms) {
            query += ' AND p.bedrooms >= ?';
            params.push(bedrooms);
        }
        if (is_available !== undefined) {
            query += ' AND p.is_available = ?';
            params.push(is_available === 'true' ? 1 : 0);
        }

        query += ' ORDER BY p.created_at DESC';

        const [properties] = await pool.query(query, params);

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
        console.error('Get properties error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch properties' });
    }
});

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const [properties] = await pool.query(
            `SELECT p.*, u.full_name as owner_name, u.phone as owner_phone, u.email as owner_email,
      u.bank_name, u.bank_account_number, u.created_at as owner_since,
      (TIMESTAMPDIFF(MONTH, u.created_at, NOW()) >= 1) as is_trusted_owner,
      (SELECT AVG(rating) FROM reviews WHERE property_id = p.property_id) as avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE property_id = p.property_id) as review_count
      FROM properties p
      JOIN users u ON p.owner_id = u.user_id
      WHERE p.property_id = ?`,
            [req.params.id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const property = {
            ...properties[0],
            amenities: typeof properties[0].amenities === 'string' ? JSON.parse(properties[0].amenities || '[]') : properties[0].amenities,
            images: typeof properties[0].images === 'string' ? JSON.parse(properties[0].images || '[]') : properties[0].images
        };

        res.json({
            success: true,
            property
        });
    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch property' });
    }
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private/Owner
router.post('/', authenticate, authorize('owner', 'admin'), upload.array('propertyImages', 10), async (req, res) => {
    try {
        const {
            title, description, property_type, address, city, state, postal_code,
            latitude, longitude, bedrooms, bathrooms, has_kitchen, has_parking,
            area_sqft, price_per_month, security_deposit, lease_duration_min,
            lease_duration_max, electricity_rate, water_charge, garbage_charge,
            house_rules, amenities
        } = req.body;

        const images = req.files ? req.files.map(file => file.path) : [];

        const [result] = await pool.query(
            `INSERT INTO properties (
                owner_id, title, description, property_type, address, city, state, postal_code,
                latitude, longitude, bedrooms, bathrooms, has_kitchen, has_parking,
                area_sqft, price_per_month, security_deposit, lease_duration_min,
                lease_duration_max, electricity_rate, water_charge, garbage_charge,
                house_rules, amenities, images
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.user_id,
                title,
                description,
                property_type,
                address,
                city,
                state || null,
                postal_code || null,
                latitude || null,
                longitude || null,
                parseInt(bedrooms) || 0,
                parseInt(bathrooms) || 0,
                has_kitchen === 'true' || has_kitchen === true,
                has_parking === 'true' || has_parking === true,
                parseFloat(area_sqft) || 0,
                parseFloat(price_per_month) || 0,
                parseFloat(security_deposit) || 0,
                parseInt(lease_duration_min) || 1,
                parseInt(lease_duration_max) || 5,
                parseFloat(electricity_rate) || 0,
                parseFloat(water_charge) || 0,
                parseFloat(garbage_charge) || 0,
                house_rules || '',
                typeof amenities === 'string' ? amenities : JSON.stringify(amenities || []),
                JSON.stringify(images)
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            property_id: result.insertId
        });
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ success: false, message: 'Failed to create property' });
    }
});

// @route   POST /api/properties/:id/images
// @desc    Upload images for an existing property
// @access  Private/Owner
router.post('/:id/images', authenticate, authorize('owner', 'admin'), upload.array('propertyImages', 10), async (req, res) => {
    try {
        const propertyId = req.params.id;
        const [properties] = await pool.query(
            'SELECT owner_id, images FROM properties WHERE property_id = ?',
            [propertyId]
        );

        if (properties.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        if (properties[0].owner_id !== req.user.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const newImages = req.files ? req.files.map(file => file.path) : [];
        const existingImages = JSON.parse(properties[0].images || '[]');
        const updatedImages = [...existingImages, ...newImages];

        await pool.query(
            'UPDATE properties SET images = ? WHERE property_id = ?',
            [JSON.stringify(updatedImages), propertyId]
        );

        res.json({
            success: true,
            message: 'Images uploaded successfully',
            images: updatedImages
        });
    } catch (error) {
        console.error('Upload images error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload images' });
    }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private/Owner
router.put('/:id', authenticate, authorize('owner', 'admin'), async (req, res) => {
    try {
        const [properties] = await pool.query(
            'SELECT owner_id FROM properties WHERE property_id = ?',
            [req.params.id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        if (properties[0].owner_id !== req.user.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updates = req.body;
        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), req.params.id];

        await pool.query(
            `UPDATE properties SET ${setClause} WHERE property_id = ?`,
            values
        );

        res.json({
            success: true,
            message: 'Property updated successfully'
        });
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ success: false, message: 'Failed to update property' });
    }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private/Owner
router.delete('/:id', authenticate, authorize('owner', 'admin'), async (req, res) => {
    try {
        const [properties] = await pool.query(
            'SELECT owner_id FROM properties WHERE property_id = ?',
            [req.params.id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        if (properties[0].owner_id !== req.user.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await pool.query('DELETE FROM properties WHERE property_id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete property' });
    }
});

module.exports = router;
