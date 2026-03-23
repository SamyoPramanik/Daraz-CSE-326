const bcrypt = require('bcryptjs');

// The hash from seed.sql
const hash = '$2b$10$JxPJGPQ15Cwi2P6y0aUI4OkK3zzTIpPf/8rye.VuupOFvqqDu5M8i';
const password = 'admin123';

console.log('Testing bcrypt password verification:');
console.log('Hash:', hash);
console.log('Password:', password);

bcrypt.compare(password, hash).then(result => {
    console.log('Password matches:', result);
    if (result) {
        console.log('✅ SUCCESS: Password "admin123" matches the hash');
    } else {
        console.log('❌ FAILURE: Password "admin123" does NOT match the hash');
    }
}).catch(err => {
    console.error('Error:', err.message);
});
