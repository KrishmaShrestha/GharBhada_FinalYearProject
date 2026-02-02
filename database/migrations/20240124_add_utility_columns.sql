-- Migration: Add missing utility and rule columns to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS has_kitchen BOOLEAN DEFAULT TRUE AFTER bathrooms,
ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT FALSE AFTER has_kitchen,
ADD COLUMN IF NOT EXISTS lease_duration_min INT DEFAULT 1 AFTER security_deposit,
ADD COLUMN IF NOT EXISTS lease_duration_max INT DEFAULT 5 AFTER lease_duration_min,
ADD COLUMN IF NOT EXISTS electricity_rate DECIMAL(10, 2) AFTER lease_duration_max,
ADD COLUMN IF NOT EXISTS water_charge DECIMAL(10, 2) AFTER electricity_rate,
ADD COLUMN IF NOT EXISTS garbage_charge DECIMAL(10, 2) AFTER water_charge,
ADD COLUMN IF NOT EXISTS house_rules TEXT AFTER garbage_charge;

-- Update existing records if necessary (optional)
-- UPDATE properties SET has_kitchen = TRUE, has_parking = FALSE WHERE has_kitchen IS NULL;
