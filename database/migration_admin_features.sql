-- Migration: Add Admin Management Fields
-- Run this to update existing database with new admin features

USE gharbhada_fyp;

-- Add trust level fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS trust_level ENUM('regular', 'trusted') DEFAULT 'regular' AFTER approved_at,
ADD COLUMN IF NOT EXISTS trust_level_updated_at TIMESTAMP NULL AFTER trust_level,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT AFTER trust_level_updated_at,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP NULL AFTER suspension_reason,
ADD INDEX IF NOT EXISTS idx_trust_level (trust_level);

-- Add admin approval fields to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS admin_approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' AFTER is_verified,
ADD COLUMN IF NOT EXISTS admin_notes TEXT AFTER admin_approval_status,
ADD COLUMN IF NOT EXISTS approved_by_admin INT AFTER admin_notes,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL AFTER approved_by_admin,
ADD INDEX IF NOT EXISTS idx_admin_approval (admin_approval_status);

-- Add foreign key for approved_by_admin
ALTER TABLE properties 
ADD CONSTRAINT fk_approved_by_admin 
FOREIGN KEY (approved_by_admin) REFERENCES users(user_id) ON DELETE SET NULL;

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id INT PRIMARY KEY AUTO_INCREMENT,
    complainant_id INT NOT NULL,
    against_user_id INT,
    property_id INT,
    booking_id INT,
    complaint_type ENUM('payment', 'property', 'agreement', 'behavior', 'other') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    status ENUM('pending', 'investigating', 'resolved', 'closed') NOT NULL DEFAULT 'pending',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    resolution_notes TEXT,
    resolved_by INT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (complainant_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (against_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_complainant (complainant_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_type (complaint_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action_type ENUM('user_approval', 'user_rejection', 'user_suspension', 'property_approval', 'property_rejection', 'trust_level_update', 'complaint_resolution', 'other') NOT NULL,
    target_type ENUM('user', 'property', 'booking', 'payment', 'complaint') NOT NULL,
    target_id INT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_admin (admin_id),
    INDEX idx_action (action_type),
    INDEX idx_target (target_type, target_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Set existing approved users to have trust level based on registration date
UPDATE users 
SET trust_level = CASE 
    WHEN role = 'owner' AND TIMESTAMPDIFF(YEAR, created_at, NOW()) >= 1 THEN 'trusted'
    ELSE 'regular'
END,
trust_level_updated_at = NOW()
WHERE role IN ('owner', 'tenant');

-- Set existing properties to approved status
UPDATE properties 
SET admin_approval_status = 'approved',
    approval_date = created_at
WHERE admin_approval_status = 'pending';

SELECT 'Migration completed successfully!' AS status;
SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'gharbhada_fyp';
