const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateTenantFlow() {
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

        // 0. Update users table with bank details and verification info
        console.log('🔄 Updating users table...');
        const userCols = [
            { name: 'bank_name', type: 'VARCHAR(255)' },
            { name: 'bank_account_number', type: 'VARCHAR(100)' },
            { name: 'citizen_number', type: 'VARCHAR(100)' },
            { name: 'street_address', type: 'TEXT' },
            { name: 'city', type: 'VARCHAR(100)' },
            { name: 'district', type: 'VARCHAR(100)' },
            { name: 'is_profile_complete', type: 'BOOLEAN DEFAULT FALSE' }
        ];

        for (const col of userCols) {
            const [check] = await connection.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.columns 
                WHERE table_schema = ? AND table_name = 'users' AND column_name = ?
            `, [process.env.DB_NAME || 'gharbhada_fyp', col.name]);

            if (check[0].count === 0) {
                console.log(`➕ Adding column to users: ${col.name}`);
                await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        // 1. Add columns to bookings
        console.log('🔄 Updating bookings table...');
        const bookingCols = [
            { name: 'tenant_fullname', type: 'VARCHAR(255)' },
            { name: 'tenant_phone', type: 'VARCHAR(20)' },
            { name: 'tenant_address', type: 'TEXT' },
            { name: 'tenant_citizen_number', type: 'VARCHAR(100)' },
            { name: 'rental_years', type: 'INT DEFAULT 1' },
            { name: 'rental_months', type: 'INT DEFAULT 0' },
            { name: 'approved_duration', type: 'BOOLEAN DEFAULT FALSE' }
        ];

        for (const col of bookingCols) {
            const [check] = await connection.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.columns 
                WHERE table_schema = ? AND table_name = 'bookings' AND column_name = ?
            `, [process.env.DB_NAME || 'gharbhada_fyp', col.name]);

            if (check[0].count === 0) {
                console.log(`➕ Adding column: ${col.name}`);
                await connection.query(`ALTER TABLE bookings ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        // 2. Add columns to rental_agreements if missing
        console.log('🔄 Updating rental_agreements table...');

        // Ensure table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS rental_agreements (
                agreement_id INT PRIMARY KEY AUTO_INCREMENT,
                booking_id INT NOT NULL,
                property_id INT NOT NULL,
                tenant_id INT NOT NULL,
                owner_id INT NOT NULL,
                base_rent DECIMAL(10, 2) NOT NULL,
                deposit_amount DECIMAL(10, 2) NOT NULL,
                start_date DATE,
                end_date DATE,
                status ENUM('draft', 'pending_tenant', 'active', 'terminated') DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        const agreementCols = [
            { name: 'electricity_rate', type: 'DECIMAL(10, 2) DEFAULT 0' },
            { name: 'water_bill', type: 'DECIMAL(10, 2) DEFAULT 0' },
            { name: 'garbage_bill', type: 'DECIMAL(10, 2) DEFAULT 0' },
            { name: 'security_deposit', type: 'DECIMAL(10, 2) DEFAULT 5000' }
        ];

        for (const col of agreementCols) {
            const [check] = await connection.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.columns 
                WHERE table_schema = ? AND table_name = 'rental_agreements' AND column_name = ?
            `, [process.env.DB_NAME || 'gharbhada_fyp', col.name]);

            if (check[0].count === 0) {
                console.log(`➕ Adding column: ${col.name}`);
                await connection.query(`ALTER TABLE rental_agreements ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        console.log('\n✅ Database migration for Tenant Flow completed!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

migrateTenantFlow();
