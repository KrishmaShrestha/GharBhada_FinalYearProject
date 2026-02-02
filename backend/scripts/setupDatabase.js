const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupCompleteDatabase() {
    let connection;

    try {
        console.log('🔄 Connecting to MySQL...');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to MySQL');

        const dbName = process.env.DB_NAME || 'gharbhada_fyp';
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`✅ Database '${dbName}' ready`);

        await connection.query(`USE ${dbName}`);

        console.log('🔄 Reading schema file...');
        const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by CREATE TABLE and execute each
        const statements = schema.split(/(?=CREATE TABLE|ALTER TABLE)/);

        console.log(`🔄 Creating ${statements.length} database objects...\n`);

        for (const statement of statements) {
            const trimmed = statement.trim();
            if (trimmed && !trimmed.startsWith('--')) {
                try {
                    await connection.query(trimmed);
                } catch (err) {
                    if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
                        console.log('   Warning:', err.message.substring(0, 100));
                    }
                }
            }
        }

        console.log('✅ All tables created\n');

        console.log('='.repeat(50));
        console.log('✨ Database setup completed successfully!');
        console.log('='.repeat(50));
        console.log('\n📊 Database ready with:');
        console.log('   - Users (with approval & trust levels)');
        console.log('   - Properties (with admin approval)');
        console.log('   - Bookings & Agreements');
        console.log('   - Payments');
        console.log('   - Reviews');
        console.log('   - Notifications');
        console.log('   - Maintenance Requests');
        console.log('   - Documents');
        console.log('   - Favorites');
        console.log('   - Messages');
        console.log('   - Complaints');
        console.log('   - System Logs (Audit Trail)');
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupCompleteDatabase();
