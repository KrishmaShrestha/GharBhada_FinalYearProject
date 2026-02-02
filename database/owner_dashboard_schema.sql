-- Owner Dashboard Database Schema Updates
-- Run this after the main schema to add owner-specific features

USE gharbhada_fyp;

-- Add owner-specific fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS citizenship_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS permanent_address TEXT;

-- Property Utilities Table
CREATE TABLE IF NOT EXISTS property_utilities (
    utility_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    electricity_rate DECIMAL(10, 2) DEFAULT 0,
    water_charge DECIMAL(10, 2) DEFAULT 0,
    garbage_charge DECIMAL(10, 2) DEFAULT 0,
    other_charges JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    INDEX idx_property (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Requests Table
CREATE TABLE IF NOT EXISTS booking_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    tenant_id INT NOT NULL,
    owner_id INT NOT NULL,
    lease_duration_years INT DEFAULT 1,
    lease_duration_months INT DEFAULT 0,
    move_in_date DATE,
    status ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
    tenant_message TEXT,
    owner_response TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_tenant (tenant_id),
    INDEX idx_owner (owner_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rental Agreements Table
CREATE TABLE IF NOT EXISTS rental_agreements (
    agreement_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_request_id INT,
    property_id INT NOT NULL,
    owner_id INT NOT NULL,
    tenant_id INT NOT NULL,
    monthly_rent DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    lease_start_date DATE NOT NULL,
    lease_end_date DATE NOT NULL,
    lease_duration_years INT DEFAULT 1,
    lease_duration_months INT DEFAULT 0,
    electricity_rate DECIMAL(10, 2) DEFAULT 0,
    water_charge DECIMAL(10, 2) DEFAULT 0,
    garbage_charge DECIMAL(10, 2) DEFAULT 0,
    terms_and_conditions TEXT,
    house_rules TEXT,
    owner_signed BOOLEAN DEFAULT FALSE,
    tenant_signed BOOLEAN DEFAULT FALSE,
    owner_signed_at TIMESTAMP NULL,
    tenant_signed_at TIMESTAMP NULL,
    status ENUM('draft', 'pending_tenant', 'active', 'completed', 'terminated') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_request_id) REFERENCES booking_requests(request_id) ON DELETE SET NULL,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_owner (owner_id),
    INDEX idx_tenant (tenant_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Monthly Payments Table
CREATE TABLE IF NOT EXISTS monthly_payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    agreement_id INT NOT NULL,
    booking_id INT,
    month_year DATE NOT NULL,
    base_rent DECIMAL(10, 2) NOT NULL,
    electricity_units INT DEFAULT 0,
    electricity_amount DECIMAL(10, 2) DEFAULT 0,
    water_amount DECIMAL(10, 2) DEFAULT 0,
    garbage_amount DECIMAL(10, 2) DEFAULT 0,
    other_charges DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    deposit_adjustment DECIMAL(10, 2) DEFAULT 0,
    payment_status ENUM('pending', 'paid', 'overdue', 'partial') DEFAULT 'pending',
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    paid_at TIMESTAMP NULL,
    due_date DATE NOT NULL,
    payment_method ENUM('esewa', 'khalti', 'bank_transfer', 'cash') NULL,
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agreement_id) REFERENCES rental_agreements(agreement_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    INDEX idx_agreement (agreement_id),
    INDEX idx_status (payment_status),
    INDEX idx_month (month_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Property House Rules Table
CREATE TABLE IF NOT EXISTS property_rules (
    rule_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    rule_category ENUM('general', 'pets', 'smoking', 'guests', 'noise', 'parking', 'other') DEFAULT 'general',
    rule_text TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    INDEX idx_property (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Owner Statistics View
CREATE OR REPLACE VIEW owner_statistics AS
SELECT 
    u.user_id as owner_id,
    u.full_name as owner_name,
    u.trust_level,
    COUNT(DISTINCT p.property_id) as total_properties,
    COUNT(DISTINCT CASE WHEN p.admin_approval_status = 'approved' THEN p.property_id END) as approved_properties,
    COUNT(DISTINCT CASE WHEN p.is_available = TRUE THEN p.property_id END) as available_properties,
    COUNT(DISTINCT ra.agreement_id) as total_agreements,
    COUNT(DISTINCT CASE WHEN ra.status = 'active' THEN ra.agreement_id END) as active_rentals,
    COUNT(DISTINCT br.request_id) as total_booking_requests,
    COUNT(DISTINCT CASE WHEN br.status = 'pending' THEN br.request_id END) as pending_requests,
    COALESCE(SUM(CASE WHEN mp.payment_status = 'paid' THEN mp.total_amount ELSE 0 END), 0) as total_earnings,
    COALESCE(SUM(CASE WHEN mp.payment_status = 'pending' THEN mp.total_amount ELSE 0 END), 0) as pending_payments
FROM users u
LEFT JOIN properties p ON u.user_id = p.owner_id
LEFT JOIN rental_agreements ra ON u.user_id = ra.owner_id
LEFT JOIN booking_requests br ON u.user_id = br.owner_id
LEFT JOIN monthly_payments mp ON ra.agreement_id = mp.agreement_id
WHERE u.role = 'owner'
GROUP BY u.user_id, u.full_name, u.trust_level;

-- Insert sample data for testing (optional)
-- You can uncomment these if you want test data

/*
-- Sample property utilities
INSERT INTO property_utilities (property_id, electricity_rate, water_charge, garbage_charge) 
SELECT property_id, 12.50, 500.00, 200.00 
FROM properties 
LIMIT 3;

-- Sample booking request
INSERT INTO booking_requests (property_id, tenant_id, owner_id, lease_duration_years, lease_duration_months, tenant_message, status)
SELECT 
    p.property_id,
    (SELECT user_id FROM users WHERE role = 'tenant' LIMIT 1),
    p.owner_id,
    1,
    0,
    'I am interested in renting this property. Please let me know if it is still available.',
    'pending'
FROM properties p
WHERE p.admin_approval_status = 'approved'
LIMIT 1;
*/

-- Verify tables created
SELECT 'Owner Dashboard schema updated successfully!' AS status;
SELECT TABLE_NAME, TABLE_ROWS 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'gharbhada_fyp' 
AND TABLE_NAME IN ('property_utilities', 'booking_requests', 'rental_agreements', 'monthly_payments', 'property_rules')
ORDER BY TABLE_NAME;
