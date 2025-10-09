import { createApp } from '../../../cortex/core/app';
import { Connection } from '../../../cortex/db/connection';
import { query } from '../../../cortex/db/mdb';
import { RequestContext } from '../../../cortex/core/app.types';

const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';
const API_URL = 'http://localhost:3006'; // Matches live environment

describe('[29. API] Login Endpoint Test', () => {
    let connection: Connection;

    beforeAll(async () => {
        const testConfig = {
            driver: 'mariadb' as const,
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

        // Clear user_sessions to avoid stale tokens
        await query('DELETE FROM user_sessions', [], MASTER_DB);
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
        expect(response.body.user).toHaveProperty('username');
        expect(response.body.user).toHaveProperty('email', 'admin@example.com');
        expect(response.body.user).toHaveProperty('role', 'admin');
        expect(response.body).toHaveProperty('tenant');
        expect(response.body.tenant).toHaveProperty('id', 'default');
    });

    test('[test 2] POST /logout succeeds with valid token', async () => {
        const app = createApp();
        // First, perform a login to get a valid token
        const loginResponse = await mockRequest(app, 'POST', '/login', {
            email: 'admin@example.com',
            password: 'admin123'
        });
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.user).toHaveProperty('token');

        const token = loginResponse.body.user.token;

        // Perform logout with the token
        const logoutResponse = await mockRequest(app, 'POST', '/logout', {}, '127.0.0.1', {
            authorization: `Bearer ${token}`
        });
        expect(logoutResponse.status).toBe(200);
        expect(logoutResponse.body).toHaveProperty('message', 'Logged out successfully');
    });
});

async function mockRequest(
    app: any,
    method: string,
    url: string,
    body: any,
    ip: string = '127.0.0.1',
    headers: any = {}
): Promise<any> {
    return new Promise((resolve) => {
        const req: { method: string; url: string; body: any; headers: any; context: RequestContext; ip: string; version?: string } = {
            method,
            url,
            body,
            headers,
            context: { ip },
            ip,
            version: 'v1',
        };
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
        app(req, res, (err: any) => {
            if (err) {
                console.error('Mock request error:', err.message, err.stack);
                resolve({ status: 500, body: { error: err.message } });
            }
        });
    });
}