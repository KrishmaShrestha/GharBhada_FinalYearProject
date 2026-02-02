const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixGoogleAuthSchema() {
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
        console.log('🔄 Fixing schema for Google Auth...\n');

        // 1. Add google_id column if not exists
        console.log('📝 Adding google_id column to users table...');
        await connection.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE AFTER email
        `);

        // 2. Make password_hash nullable
        console.log('📝 Making password_hash NULLABLE...');
        await connection.query(`
            ALTER TABLE users 
            MODIFY COLUMN password_hash VARCHAR(255) NULL
        `);

        console.log('\n' + '='.repeat(50));
        console.log('✨ Schema fix completed successfully!');
        console.log('='.repeat(50));
        console.log('\n✅ Changes:');
        console.log('   - Added google_id column');
        console.log('   - Made password_hash nullable for Google users');
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.error('❌ Schema fix failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixGoogleAuthSchema();
