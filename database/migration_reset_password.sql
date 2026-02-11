-- Migration to add Forgot Password functionality

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reset_password_expiry TIMESTAMP NULL DEFAULT NULL;

-- Index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_reset_token ON users(reset_password_token);
