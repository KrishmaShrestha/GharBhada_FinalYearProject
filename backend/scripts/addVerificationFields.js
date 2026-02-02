const mysql = require('mysql2/promise');
require('dotenv').config();

async function addVerificationFields() {
    let connection;

    try {
        console.log('🔄 Connecting to MySQL...');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_NAME || 'gharbhada_fyp'
        });

        console.log('✅ Connected to database');
        console.log('🔄 Adding verification fields to users table...\n');

        // Add profiling fields
        await connection.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS street_address VARCHAR(255) AFTER phone,
            ADD COLUMN IF NOT EXISTS city VARCHAR(100) AFTER street_address,
            ADD COLUMN IF NOT EXISTS district VARCHAR(100) AFTER city,
            ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20) AFTER district,
            ADD COLUMN IF NOT EXISTS citizen_number VARCHAR(50) AFTER postal_code,
            ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE AFTER approval_status
        `);

        console.log('✅ Migration successful!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

addVerificationFields();
