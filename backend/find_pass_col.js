const { pool } = require('./src/config/database');

async function findPasswordCol() {
    try {
        const [rows] = await pool.query(`DESCRIBE users`);
        const fields = rows.map(r => r.Field);
        console.log('All fields:', fields.join(', '));
        const passCols = fields.filter(f => f.toLowerCase().includes('pass') || f.toLowerCase().includes('hash'));
        console.log('Potential password columns:', passCols);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findPasswordCol();
