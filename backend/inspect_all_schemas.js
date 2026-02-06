const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function inspectAll() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: 'gharbhada_fyp',
        port: process.env.DB_PORT || 3306
    });

    try {
        const [tables] = await pool.query('SHOW TABLES');
        const dbName = 'Tables_in_gharbhada_fyp';

        for (const row of tables) {
            const table = row[dbName];
            console.log(`\n\n--- ${table.toUpperCase()} SCHEMA ---`);
            const [schema] = await pool.query(`DESCRIBE ${table}`);
            console.table(schema);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

inspectAll();
