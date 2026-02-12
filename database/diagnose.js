const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function diagnose() {
    console.log('🔍 Starting Diagnosis...');
    const dbName = process.env.DB_NAME || 'gharbhada_fyp';
    console.log(`📡 Database: ${dbName}`);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: dbName
    });

    try {
        console.log('--- Table: users ---');
        const [columns] = await connection.query('DESCRIBE users');
        columns.forEach(col => {
            console.log(`Field: ${col.Field}, Type: ${col.Type}`);
        });

        const resetCols = columns.filter(col => col.Field === 'reset_password_token' || col.Field === 'reset_password_expiry');
        if (resetCols.length === 2) {
            console.log('✅ Password reset columns EXIST.');
        } else {
            console.log('❌ Password reset columns MISSING!');
        }

        // Check if there are other missing columns from my previous viewed code
        const otherCols = ['bank_name', 'bank_account_number', 'citizen_number', 'trust_level'];
        otherCols.forEach(name => {
            if (!columns.find(c => c.Field === name)) {
                console.log(`❌ Column ${name} is MISSING!`);
            }
        });

    } catch (error) {
        console.error('❌ Error during diagnosis:', error.message);
    } finally {
        await connection.end();
    }
}

diagnose();
