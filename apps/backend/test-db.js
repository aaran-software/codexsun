const mariadb = require('mariadb');
async function test() {
    try {
        console.log('🧪 TESTING DIRECT CONNECTION...');
        const pool = mariadb.createPool({
            host: 'mariadb',
            port: 3306,
            user: 'root',
            password: 'DbPass1@@',
            connectionLimit: 50,
            acquireTimeout: 10000
        });

        const conn = await pool.getConnection();
        console.log('✅ DIRECT CONNECTION SUCCESS!');
        console.log('📊 POOL INFO:', {
            active: pool._allConnections?.length || 0,
            idle: pool._freeConnections?.length || 0
        });

        await conn.query('SELECT 1');
        console.log('✅ QUERY SUCCESS!');

        conn.release();
        await pool.end();
    } catch (err) {
        console.error('❌ DIRECT TEST FAILED:', err.message);
    }
}
test();