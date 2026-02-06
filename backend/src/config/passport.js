const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('./database');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    proxy: true,
    passReqToCallback: true
},
    async (req, accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const googleId = profile.id;
            const fullName = profile.displayName;
            const profileImage = profile.photos[0]?.value;

            // Get role from state parameter passed in the initial request
            const role = req.query.state || 'tenant';

            // Check if user exists with google_id
            let [users] = await pool.query(
                'SELECT * FROM users WHERE google_id = ?',
                [googleId]
            );

            if (users.length > 0) {
                return done(null, users[0]);
            }

            // Check if user exists with email
            const [usersByEmail] = await pool.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (usersByEmail.length > 0) {
                const existingUser = usersByEmail[0];
                // Link Google ID to existing account
                await pool.query(
                    'UPDATE users SET google_id = ?, profile_image = COALESCE(profile_image, ?) WHERE user_id = ?',
                    [googleId, profileImage, existingUser.user_id]
                );

                // Return updated user
                const [updatedUser] = await pool.query('SELECT * FROM users WHERE user_id = ?', [existingUser.user_id]);
                return done(null, updatedUser[0]);
            }

            // Create new user (flag as incomplete)
            const [result] = await pool.query(
                'INSERT INTO users (email, google_id, full_name, role, profile_image, approval_status, is_active, is_profile_complete) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [email, googleId, fullName, role.toLowerCase(), profileImage, 'pending', true, false]
            );

            const [newUser] = await pool.query(
                'SELECT * FROM users WHERE user_id = ?',
                [result.insertId]
            );

            return done(null, newUser[0]);
        } catch (error) {
            return done(error, null);
        }
    }
));

// We don't need sessions since we're using JWT
passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [id]);
        done(null, users[0]);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
