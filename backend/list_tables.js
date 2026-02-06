const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function listTables() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: 'gharbhada_fyp',
        port: process.env.DB_PORT || 3306
    });

    try {
        const [tables] = await pool.query('SHOW TABLES');
        console.log(JSON.stringify(tables, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

listTables();
