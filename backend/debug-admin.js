const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function debugAdmin() {
    try {
        console.log('\n========== DATABASE DEBUG ==========\n');
        
        // 1. Check if admin user exists
        console.log('1. Checking for admin user...');
        const userResult = await pool.query(
            `SELECT id, name, email, password, is_admin FROM users WHERE email = 'admin@daraz.com'`
        );
        
        if (userResult.rowCount === 0) {
            console.log('❌ Admin user NOT found in database!');
            console.log('\nAll users in database:');
            const allUsers = await pool.query(`SELECT id, email, is_admin FROM users LIMIT 10`);
            console.table(allUsers.rows);
        } else {
            const admin = userResult.rows[0];
            console.log('✅ Admin user found:');
            console.log(`   ID: ${admin.id}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Is Admin: ${admin.is_admin}`);
            console.log(`   Password Hash: ${admin.password}`);
            console.log(`   Hash Length: ${admin.password.length}`);
            
            // 2. Test password match
            console.log('\n2. Testing password verification...');
            const testPassword = 'admin123';
            const correctHash = '$2b$10$JxPJGPQ15Cwi2P6y0aUI4OkK3zzTIpPf/8rye.VuupOFvqqDu5M8i';
            
            const match1 = await bcrypt.compare(testPassword, admin.password);
            const match2 = await bcrypt.compare(testPassword, correctHash);
            
            console.log(`   Password '${testPassword}' matches stored hash: ${match1}`);
            console.log(`   Password '${testPassword}' matches correct hash: ${match2}`);
            
            if (!match1 && match2) {
                console.log('\n⚠️  ISSUE FOUND: Stored hash is wrong!');
                console.log('   Updating to correct hash...');
                
                const updateResult = await pool.query(
                    `UPDATE users SET password = $1 WHERE email = 'admin@daraz.com' RETURNING id, email, password`,
                    [correctHash]
                );
                
                console.log('✅ Updated successfully:');
                console.log(updateResult.rows[0]);
            } else if (match1) {
                console.log('\n✅ Password hash is CORRECT!');
            } else {
                console.log('\n❌ Password hash does NOT match!');
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugAdmin();
