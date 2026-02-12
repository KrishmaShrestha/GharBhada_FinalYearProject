const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fullDiagnosis() {
    console.log('🚀 --- GHARBHADA BACKEND DIAGNOSIS --- 🚀');

    // 1. Check Database
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gharbhada_fyp'
    };

    console.log(`📡 Database Config: ${dbConfig.user}@${dbConfig.host}/${dbConfig.database}`);

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL successfully.');

        // Check users table
        const [usersCols] = await connection.query('DESCRIBE users');
        const colNames = usersCols.map(c => c.Field);
        console.log('📋 users table columns:', colNames.join(', '));

        const required = ['reset_password_token', 'reset_password_expiry', 'bank_name', 'bank_account_number'];
        required.forEach(col => {
            if (colNames.includes(col)) {
                console.log(`  ✅ ${col}: Present`);
            } else {
                console.log(`  ❌ ${col}: MISSING!`);
            }
        });

        await connection.end();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }

    // 2. Check SMTP Config
    console.log('📧 SMTP Configuration:');
    console.log(`  Host: ${process.env.EMAIL_HOST}`);
    console.log(`  User: ${process.env.EMAIL_USER}`);
    console.log(`  Pass: ${process.env.EMAIL_PASS ? '********' : 'NOT SET'}`);

    if (process.env.EMAIL_USER === 'your_email@gmail.com') {
        console.log('  ⚠️ WARNING: SMTP is using default placeholders. Email sending WILL fail.');
    }

    console.log('🚀 --- END OF DIAGNOSIS --- 🚀');
}

fullDiagnosis();
