import { createApp } from '../../../cortex/core/app';
import { Connection } from '../../../cortex/db/connection';

const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

describe('[29. API] Login Endpoint Test', () => {
    let connection: Connection;

    beforeAll(async () => {
        const testConfig = {
            type: 'mariadb' as const,
            database: MASTER_DB,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'Computer.1',
            ssl: process.env.DB_SSL === 'true',
            connectionLimit: 10,
            acquireTimeout: 10000,
            idleTimeout: 10000,
        };

        connection = await Connection.initialize(testConfig);
    });

    afterAll(async () => {
        await connection.close();
    });

    test('[test 1] POST /login succeeds with valid credentials and returns token', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'admin@example.com',
            password: 'admin123'
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('token');
        expect(typeof response.body.user.token).toBe('string');
        expect(response.body.user).toHaveProperty('role', 'admin');
        expect(response.body).toHaveProperty('tenant');
    });
});

async function mockRequest(app: any, method: string, url: string, body: any, ip: string = '127.0.0.1'): Promise<any> {
    return new Promise((resolve) => {
        const req = { method, url, body, headers: {}, context: {}, ip };
        const res = {
            statusCode: 200,
            status: (code: number) => {
                res.statusCode = code;
                return res;
            },
            json: (data: any) => {
                resolve({ status: res.statusCode, body: data });
            },
        };
        app(req, res);
    });
}