-- Quick Migration Script for Admin Approval System
-- This can be run via MySQL Workbench or any MySQL client

-- Step 1: Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' AFTER is_active,
ADD COLUMN IF NOT EXISTS approved_by INT AFTER approval_status,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL AFTER approved_by;

-- Step 2: Add foreign key constraint
ALTER TABLE users 
ADD CONSTRAINT fk_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- Step 3: Add index for approval_status
ALTER TABLE users 
ADD INDEX IF NOT EXISTS idx_approval_status (approval_status);

-- Step 4: Set existing users to 'approved' status
UPDATE users 
SET approval_status = 'approved', 
    approved_at = created_at 
WHERE approval_status = 'pending';

-- Step 5: Set admin users to approved automatically
UPDATE users 
SET approval_status = 'approved', 
    approved_at = created_at 
WHERE role = 'admin' AND approval_status != 'approved';

-- Verify the migration
SELECT 
    'Migration completed successfully' AS status,
    COUNT(*) AS total_users,
    SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) AS approved_users,
    SUM(CASE WHEN approval_status = 'pending' THEN 1 ELSE 0 END) AS pending_users
FROM users;
