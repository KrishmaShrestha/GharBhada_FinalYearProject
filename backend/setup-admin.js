const bcrypt = require('bcrypt');
const { pool, testConnection } = require('./src/config/database');

async function setupAdmin() {
    try {
        console.log('🔧 GharBhada Admin Setup for XAMPP\n');

        // Test database connection
        console.log('1️⃣ Testing database connection...');
        const connected = await testConnection();

        if (!connected) {
            console.error('❌ Database connection failed!');
            console.log('\n📋 Troubleshooting:');
            console.log('   - Make sure XAMPP MySQL is running');
            console.log('   - Check .env file has correct credentials');
            console.log('   - Verify database "gharbhada_fyp" exists');
            process.exit(1);
        }

        // Generate password hash
        console.log('\n2️⃣ Generating admin password hash...');
        const password = 'admin123';
        const passwordHash = await bcrypt.hash(password, 10);
        console.log('✅ Password hash generated');

        // Check if admin exists
        console.log('\n3️⃣ Checking for existing admin user...');
        const [existingAdmin] = await pool.query(
            'SELECT user_id, email FROM users WHERE email = ?',
            ['admin@gharbhada.com']
        );

        if (existingAdmin.length > 0) {
            console.log('⚠️  Admin user already exists. Updating password...');
            await pool.query(
                'UPDATE users SET password_hash = ?, approval_status = ?, is_active = ?, approved_at = NOW() WHERE email = ?',
                [passwordHash, 'approved', true, 'admin@gharbhada.com']
            );
            console.log('✅ Admin password updated');
        } else {
            console.log('📝 Creating new admin user...');
            await pool.query(
                `INSERT INTO users (email, password_hash, full_name, phone, role, is_verified, is_active, approval_status, approved_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                ['admin@gharbhada.com', passwordHash, 'System Administrator', '9841234567', 'admin', true, true, 'approved']
            );
            console.log('✅ Admin user created');
        }

        // Verify admin user
        console.log('\n4️⃣ Verifying admin user...');
        const [admin] = await pool.query(
            'SELECT user_id, email, full_name, role, approval_status, is_active FROM users WHERE email = ?',
            ['admin@gharbhada.com']
        );

        if (admin.length > 0) {
            console.log('✅ Admin user verified:');
            console.log(`   User ID: ${admin[0].user_id}`);
            console.log(`   Email: ${admin[0].email}`);
            console.log(`   Name: ${admin[0].full_name}`);
            console.log(`   Role: ${admin[0].role}`);
            console.log(`   Status: ${admin[0].approval_status}`);
            console.log(`   Active: ${admin[0].is_active ? 'Yes' : 'No'}`);
        }

        // Show login credentials
        console.log('\n✅ Setup completed successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 ADMIN LOGIN CREDENTIALS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:    admin@gharbhada.com');
        console.log('Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

setupAdmin();
