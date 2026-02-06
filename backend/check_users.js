const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
    console.log('Using DB:', process.env.DB_NAME);
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'gharbhada_fyp',
        port: process.env.DB_PORT || 3306
    });

    try {
        const [rows] = await pool.query('SELECT user_id, email, role, is_profile_complete, approval_status FROM users');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkUsers();
