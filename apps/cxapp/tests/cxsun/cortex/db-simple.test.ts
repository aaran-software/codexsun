import mariadb from 'mariadb';

describe('Database Harden Tests', () => {
    let pool: mariadb.Pool;

    // MariaDB configuration
    const dbConfig = {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'Computer.1',
        database: 'codexsun_db',
        connectionLimit: 10,
        acquireTimeout: 30000, // 30 seconds
    };

    // Setup before each test
    beforeEach(async () => {
        pool = mariadb.createPool(dbConfig);
    }, 30000); // Increased timeout for setup

    // Clean up after each test
    afterEach(async () => {
        if (pool) {
            try {
                await pool.end();
            } catch (err: unknown) {
                console.warn(`Failed to close pool: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }
    }, 30000); // Increased timeout for cleanup

    // Connection Test
    it('should initialize and close connection', async () => {
        const conn = await pool.getConnection();
        expect(conn).toBeDefined();
        await conn.release();
    }, 30000); // Increased timeout

    // Query Test
    it('should execute a simple query', async () => {
        const conn = await pool.getConnection();
        try {
            const result = await conn.query('SELECT 1 AS value');
            expect(result).toBeDefined();
            expect(result[0].value).toBe(1);
        } finally {
            await conn.release();
        }
    }, 30000); // Increased timeout
});