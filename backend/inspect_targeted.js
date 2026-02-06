const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function inspectTargeted() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: 'gharbhada_fyp',
        port: process.env.DB_PORT || 3306
    });

    const tables = ['users', 'properties', 'bookings', 'rental_agreements', 'payments'];

    try {
        for (const table of tables) {
            console.log(`\n\n--- ${table.toUpperCase()} SCHEMA ---`);
            const [schema] = await pool.query(`DESCRIBE ${table}`);
            schema.forEach(col => {
                console.log(`${col.Field} | ${col.Type} | ${col.Null} | ${col.Key} | ${col.Default}`);
            });
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

inspectTargeted();
