const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const passport = require('../config/passport');
const upload = require('../middleware/upload');

// Validation middleware
const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('role').isIn(['tenant', 'owner']).withMessage('Role must be tenant or owner'),
    body('citizen_number').trim().notEmpty().withMessage('Citizenship number is required'),
    body('street_address').trim().notEmpty().withMessage('Street address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('district').trim().notEmpty().withMessage('District is required')
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', upload.single('id_proof'), registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'ID proof image is required' });
        }

        const {
            email, password, full_name, phone, role,
            citizen_number, street_address, city, district, postal_code
        } = req.body;

        const id_proof_path = `/uploads/documents/${req.file.filename}`;

        // Check if user already exists
        const [existingUsers] = await pool.query(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert user
            const [result] = await connection.query(
                `INSERT INTO users (
                    email, password_hash, full_name, phone, role, 
                    citizen_number, street_address, city, district, postal_code,
                    approval_status, is_profile_complete
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    email, password_hash, full_name, phone, role,
                    citizen_number, street_address, city, district, postal_code,
                    'pending', true
                ]
            );

            const user_id = result.insertId;

            // Insert into documents table
            await connection.query(
                'INSERT INTO documents (user_id, document_type, file_name, file_path) VALUES (?, ?, ?, ?)',
                [user_id, 'id_proof', req.file.originalname, id_proof_path]
            );

            await connection.commit();

            res.status(201).json({
                success: true,
                message: 'Registration successful! Your account is pending admin approval. You will be able to login once approved.',
                user: {
                    user_id,
                    email,
                    full_name,
                    role,
                    approval_status: 'pending'
                }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        // Get user from database
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check approval status
        if (user.approval_status === 'pending') {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending admin approval. Please wait for approval before logging in.'
            });
        }

        if (user.approval_status === 'rejected') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been rejected. Please contact support for more information.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                profile_image: user.profile_image,
                is_profile_complete: !!user.is_profile_complete,
                approval_status: user.approval_status,
                google_id: user.google_id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT user_id, email, full_name, phone, role, profile_image, is_verified, is_profile_complete, approval_status, google_id, created_at FROM users WHERE user_id = ?',
            [req.user.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];
        res.json({
            success: true,
            user: {
                ...user,
                is_profile_complete: !!user.is_profile_complete
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, (req, res) => {
    // With JWT, logout is handled on client side by removing token
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// @route   GET /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed` }),
    (req, res) => {
        try {
            const user = req.user;

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.user_id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            // 1. Check if profile is complete first
            // If incomplete, we MUST allow them to reach /auth-success so they can go to /complete-profile
            if (!user.is_profile_complete) {
                // Proceed to redirect with token so they can complete profile
            } else {
                // 2. If profile IS complete, check approval status
                if (user.approval_status === 'pending') {
                    return res.redirect(`${process.env.FRONTEND_URL}/login?status=pending`);
                }

                if (user.approval_status === 'rejected') {
                    return res.redirect(`${process.env.FRONTEND_URL}/login?status=rejected`);
                }
            }

            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}&user=${Buffer.from(JSON.stringify({
                user_id: user.user_id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                profile_image: user.profile_image,
                is_profile_complete: !!user.is_profile_complete
            })).toString('base64')}`);
        } catch (error) {
            console.error('Google auth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_error`);
        }
    }
);

// @route   POST /api/auth/complete-profile
// @desc    Complete profile (for Google users)
// @access  Private
router.post('/complete-profile', authenticate, upload.single('id_proof'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'ID proof image is required' });
        }

        const {
            phone, citizen_number, street_address, city, district, postal_code
        } = req.body;

        const id_proof_path = `/uploads/documents/${req.file.filename}`;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Update user
            await connection.query(
                `UPDATE users SET 
                    phone = ?, citizen_number = ?, street_address = ?, 
                    city = ?, district = ?, postal_code = ?,
                    role = ?,
                    is_profile_complete = true,
                    approval_status = 'pending'
                WHERE user_id = ?`,
                [
                    phone, citizen_number, street_address,
                    city, district, postal_code,
                    req.body.role || 'tenant',
                    req.user.user_id
                ]
            );

            // Insert into documents table
            await connection.query(
                'INSERT INTO documents (user_id, document_type, file_name, file_path) VALUES (?, ?, ?, ?)',
                [req.user.user_id, 'id_proof', req.file.originalname, id_proof_path]
            );

            await connection.commit();

            res.json({
                success: true,
                message: 'Profile completed successfully! Your account is now pending admin approval.'
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Complete profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete profile'
        });
    }
});

module.exports = router;
