const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateAdminFeatures() {
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
        console.log('🔄 Running migrations...\n');

        // Add trust level fields to users
        console.log('📝 Adding trust level fields to users table...');
        await connection.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS trust_level ENUM('regular', 'trusted') DEFAULT 'regular',
            ADD COLUMN IF NOT EXISTS trust_level_updated_at TIMESTAMP NULL,
            ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
            ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP NULL
        `);

        try {
            await connection.query(`ALTER TABLE users ADD INDEX IF NOT EXISTS idx_trust_level (trust_level)`);
        } catch (err) {
            if (!err.message.includes('Duplicate')) console.log('   Note: Index may already exist');
        }

        // Add admin approval fields to properties
        console.log('📝 Adding admin approval fields to properties table...');
        await connection.query(`
            ALTER TABLE properties 
            ADD COLUMN IF NOT EXISTS admin_approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS admin_notes TEXT,
            ADD COLUMN IF NOT EXISTS approved_by_admin INT,
            ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL
        `);

        try {
            await connection.query(`ALTER TABLE properties ADD INDEX IF NOT EXISTS idx_admin_approval (admin_approval_status)`);
        } catch (err) {
            if (!err.message.includes('Duplicate')) console.log('   Note: Index may already exist');
        }

        try {
            await connection.query(`
                ALTER TABLE properties 
                ADD CONSTRAINT fk_approved_by_admin 
                FOREIGN KEY (approved_by_admin) REFERENCES users(user_id) ON DELETE SET NULL
            `);
        } catch (err) {
            if (!err.message.includes('Duplicate')) console.log('   Note: Foreign key may already exist');
        }

        // Create complaints table
        console.log('📝 Creating complaints table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS complaints (
                complaint_id INT PRIMARY KEY AUTO_INCREMENT,
                complainant_id INT NOT NULL,
                against_user_id INT,
                property_id INT,
                booking_id INT,
                complaint_type ENUM('payment', 'property', 'agreement', 'behavior', 'other') NOT NULL,
                priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
                status ENUM('pending', 'investigating', 'resolved', 'closed') NOT NULL DEFAULT 'pending',
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                resolution_notes TEXT,
                resolved_by INT,
                resolved_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (complainant_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (against_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
                FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
                FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
                FOREIGN KEY (resolved_by) REFERENCES users(user_id) ON DELETE SET NULL,
                INDEX idx_complainant (complainant_id),
                INDEX idx_status (status),
                INDEX idx_priority (priority),
                INDEX idx_type (complaint_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create system_logs table
        console.log('📝 Creating system_logs table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS system_logs (
                log_id INT PRIMARY KEY AUTO_INCREMENT,
                admin_id INT NOT NULL,
                action_type ENUM('user_approval', 'user_rejection', 'user_suspension', 'property_approval', 'property_rejection', 'trust_level_update', 'complaint_resolution', 'other') NOT NULL,
                target_type ENUM('user', 'property', 'booking', 'payment', 'complaint') NOT NULL,
                target_id INT NOT NULL,
                old_value TEXT,
                new_value TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_admin (admin_id),
                INDEX idx_action (action_type),
                INDEX idx_target (target_type, target_id),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Update existing data
        console.log('📝 Updating existing data...');
        await connection.query(`
            UPDATE users 
            SET trust_level = CASE 
                WHEN role = 'owner' AND TIMESTAMPDIFF(YEAR, created_at, NOW()) >= 1 THEN 'trusted'
                ELSE 'regular'
            END,
            trust_level_updated_at = NOW()
            WHERE role IN ('owner', 'tenant')
        `);

        await connection.query(`
            UPDATE properties 
            SET admin_approval_status = 'approved',
                approval_date = created_at
            WHERE admin_approval_status = 'pending'
        `);

        console.log('\n' + '='.repeat(50));
        console.log('✨ Migration completed successfully!');
        console.log('='.repeat(50));
        console.log('\n✅ New features added:');
        console.log('   - User trust levels');
        console.log('   - User suspension tracking');
        console.log('   - Property admin approval workflow');
        console.log('   - Complaints/disputes system');
        console.log('   - System audit logs');
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

migrateAdminFeatures();
