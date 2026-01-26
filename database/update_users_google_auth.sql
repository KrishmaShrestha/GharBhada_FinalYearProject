-- Update users table to support Google Authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE AFTER user_id;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT TRUE AFTER is_active;
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;
