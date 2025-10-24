import {getMasterDbConfig} from "./cortex/config/db-config";

const mariadb = require('mariadb');

const config = getMasterDbConfig()


async function test() {
    try {
        console.log('🧪 TESTING DIRECT CONNECTION...');
        const pool = mariadb.createPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            connectionLimit: config.connectionLimit,
            acquireTimeout: config.acquireTimeout,
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