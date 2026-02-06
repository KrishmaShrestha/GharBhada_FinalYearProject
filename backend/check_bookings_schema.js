const { pool } = require('./src/config/database');

async function checkBookingsSchema() {
    try {
        const [rows] = await pool.query(`DESCRIBE bookings`);
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBookingsSchema();
