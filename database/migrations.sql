-- Enhanced User Registration Schema Updates
-- Run this after the main schema.sql

-- Add new fields to users table
ALTER TABLE users ADD COLUMN citizen_number VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN street_address VARCHAR(255);
ALTER TABLE users ADD COLUMN city VARCHAR(100);
ALTER TABLE users ADD COLUMN district VARCHAR(100);
ALTER TABLE users ADD COLUMN postal_code VARCHAR(20);
ALTER TABLE users ADD COLUMN id_proof_path VARCHAR(255);
ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN approved_by INT;
ALTER TABLE users ADD COLUMN approved_date TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN is_trusted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN trust_badge_date TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN bank_name VARCHAR(100);
ALTER TABLE users ADD COLUMN bank_account_number VARCHAR(50);
ALTER TABLE users ADD COLUMN bank_account_name VARCHAR(255);

-- Add foreign key for approved_by
ALTER TABLE users ADD CONSTRAINT fk_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- Enhanced Properties Table
ALTER TABLE properties ADD COLUMN bhk_type ENUM('Studio', 'Room', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK') NOT NULL DEFAULT '1BHK';
ALTER TABLE properties ADD COLUMN is_furnished BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN electricity_rate_per_unit DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE properties ADD COLUMN water_bill_monthly DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE properties ADD COLUMN garbage_bill_monthly DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE properties ADD COLUMN property_rules TEXT;
ALTER TABLE properties ADD COLUMN minimum_deposit DECIMAL(10, 2) DEFAULT 5000.00;
ALTER TABLE properties ADD COLUMN floor_number INT;
ALTER TABLE properties ADD COLUMN total_floors INT;
ALTER TABLE properties ADD COLUMN parking_available BOOLEAN DEFAULT FALSE;

-- Enhanced Bookings Table
ALTER TABLE bookings ADD COLUMN rental_years INT DEFAULT 1;
ALTER TABLE bookings ADD COLUMN rental_months INT DEFAULT 0;
ALTER TABLE bookings ADD COLUMN contract_start_date DATE;
ALTER TABLE bookings ADD COLUMN contract_end_date DATE;
ALTER TABLE bookings ADD COLUMN agreement_path VARCHAR(255);
ALTER TABLE bookings ADD COLUMN tenant_approved_agreement BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN tenant_approved_date TIMESTAMP NULL;
ALTER TABLE bookings ADD COLUMN owner_approved_period BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN owner_period_approved_date TIMESTAMP NULL;
ALTER TABLE bookings ADD COLUMN deposit_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN deposit_payment_id INT;

-- Rental Agreements Table
CREATE TABLE IF NOT EXISTS rental_agreements (
    agreement_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    property_id INT NOT NULL,
    tenant_id INT NOT NULL,
    owner_id INT NOT NULL,
    base_rent DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    electricity_rate DECIMAL(10, 2) DEFAULT 0,
    water_bill DECIMAL(10, 2) DEFAULT 0,
    garbage_bill DECIMAL(10, 2) DEFAULT 0,
    terms_and_conditions TEXT,
    rules_and_regulations TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    agreement_pdf_path VARCHAR(255),
    tenant_signature_date TIMESTAMP NULL,
    owner_signature_date TIMESTAMP NULL,
    status ENUM('draft', 'pending_tenant', 'pending_owner', 'active', 'terminated', 'expired') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Monthly Rent Payments Table
CREATE TABLE IF NOT EXISTS monthly_rent_payments (
    rent_payment_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    agreement_id INT NOT NULL,
    tenant_id INT NOT NULL,
    owner_id INT NOT NULL,
    payment_month DATE NOT NULL,
    base_rent DECIMAL(10, 2) NOT NULL,
    electricity_units INT DEFAULT 0,
    electricity_amount DECIMAL(10, 2) DEFAULT 0,
    water_bill DECIMAL(10, 2) DEFAULT 0,
    garbage_bill DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_date TIMESTAMP NULL,
    payment_method ENUM('esewa', 'khalti', 'stripe', 'cash', 'bank_transfer'),
    transaction_id VARCHAR(255),
    receipt_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (agreement_id) REFERENCES rental_agreements(agreement_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_status (payment_status),
    INDEX idx_month (payment_month),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Status History Table
CREATE TABLE IF NOT EXISTS booking_status_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT NOT NULL,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
