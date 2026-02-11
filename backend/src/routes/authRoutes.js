const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const passport = require('../config/passport');
const upload = require('../middleware/upload');
const crypto = require('crypto');
const sendEmail = require('../utils/emailHelper');

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
    body('district').trim().notEmpty().withMessage('District is required'),
    body('bank_name').optional().trim(),
    body('bank_account_number').optional().trim()
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

        const {
            email, password, full_name, phone, role,
            citizen_number, street_address, city, district, postal_code,
            bank_name, bank_account_number
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
                    bank_name, bank_account_number,
                    approval_status, is_profile_complete
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    email, password_hash, full_name, phone, role,
                    citizen_number, street_address, city, district, postal_code,
                    bank_name, bank_account_number,
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

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email } = req.body;

        // 1. Find user by email
        const [users] = await pool.query('SELECT user_id, full_name FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Professional security: Don't reveal if user exists
            return res.json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        const user = users[0];

        // 2. Generate random reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Expiry: 1 hour from now
        const expiry = new Date(Date.now() + 60 * 60 * 1000);

        // 3. Save to database
        await pool.query(
            'UPDATE users SET reset_password_token = ?, reset_password_expiry = ? WHERE user_id = ?',
            [tokenHash, expiry, user.user_id]
        );

        // 4. Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) have requested the reset of a password. 
        Please click on the following link, or paste this into your browser to complete the process: 
        \n\n${resetUrl}\n\n 
        If you did not request this, please ignore this email and your password will remain unchanged.`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #3b82f6; text-align: center;">GharBhada Password Reset</h2>
                <p>Hello ${user.full_name},</p>
                <p>You requested a password reset for your GharBhada account. Click the button below to reset it:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2026 GharBhada. All rights reserved.</p>
            </div>
        `;

        try {
            await sendEmail({
                email: email,
                subject: 'Password Reset Request - GharBhada',
                message,
                html
            });

            res.json({
                success: true,
                message: 'Password reset link sent to your email.'
            });
        } catch (err) {
            console.error('Email error:', err);
            // Reset token if email fails
            await pool.query(
                'UPDATE users SET reset_password_token = NULL, reset_password_expiry = NULL WHERE user_id = ?',
                [user.user_id]
            );
            return res.status(500).json({
                success: false,
                message: 'There was an error sending the email. Try again later.'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const resetToken = req.params.token;
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // 1. Find user with valid token
        const [users] = await pool.query(
            'SELECT user_id FROM users WHERE reset_password_token = ? AND reset_password_expiry > NOW()',
            [tokenHash]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Token is invalid or has expired'
            });
        }

        const user = users[0];

        // 2. Hash new password
        const password_hash = await bcrypt.hash(req.body.password, 10);

        // 3. Update password and clear reset fields
        await pool.query(
            'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expiry = NULL WHERE user_id = ?',
            [password_hash, user.user_id]
        );

        res.json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
