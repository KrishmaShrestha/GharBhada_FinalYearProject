const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function migrate() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: 'gharbhada_fyp',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('Starting migration...');

        // 1. Update Users table
        console.log('Updating users table...');
        await pool.query(`ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100) AFTER district,
            ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100) AFTER bank_name`);

        // 2. Update Properties table
        console.log('Updating properties table...');
        await pool.query(`ALTER TABLE properties 
            ADD COLUMN IF NOT EXISTS electricity_rate DECIMAL(10, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS water_bill DECIMAL(10, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS garbage_bill DECIMAL(10, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS property_type ENUM('room', 'house', '1bhk', '2bhk', '3bhk', 'apartment') DEFAULT 'room' AFTER category`);

        // 3. Update Bookings table
        console.log('Updating bookings table...');
        await pool.query(`ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS rental_years INT DEFAULT 1,
            ADD COLUMN IF NOT EXISTS rental_months INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS duration_approval_date DATETIME`);

        // 4. Update Rental Agreements table
        console.log('Updating rental_agreements table...');
        await pool.query(`ALTER TABLE rental_agreements 
            ADD COLUMN IF NOT EXISTS base_rent DECIMAL(10, 2),
            ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10, 2),
            ADD COLUMN IF NOT EXISTS electricity_rate DECIMAL(10, 2),
            ADD COLUMN IF NOT EXISTS water_bill DECIMAL(10, 2),
            ADD COLUMN IF NOT EXISTS garbage_bill DECIMAL(10, 2),
            ADD COLUMN IF NOT EXISTS rules_and_regulations TEXT`);

        console.log('✅ Migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
