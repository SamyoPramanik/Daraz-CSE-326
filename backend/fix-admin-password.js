const pool = require('./config/db');

async function fixAdmin() {
    try {
        const correctHash = '$2b$10$JxPJGPQ15Cwi2P6y0aUI4OkK3zzTIpPf/8rye.VuupOFvqqDu5M8i';
        console.log('Updating admin user password and is_admin flag...');
        // const result = await pool.query(
        //     `UPDATE users 
        //      SET password = $1, is_admin = true
        //      WHERE email = 'admin@daraz.com'
        //      RETURNING id, email, is_admin`,
        //     [correctHash]
        // );
        const result = await pool.query(`select id, email, is_admin, password from users where email = 'admin@daraz.com'`);
        
        if (result.rowCount === 0) {
            console.log('❌ Admin user not found!');
            process.exit(1);
        }
        
        console.log('✅ Admin user found:');
        console.log(result.rows[0]);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixAdmin();
