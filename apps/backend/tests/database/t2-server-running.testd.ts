// [test 2] Live server is running and promise closing

import request from 'supertest';
import { Server } from 'http';
import { app } from '../../index'; // Assuming index.ts exports app, adjust if needed
import { Connection } from '../../cortex/db/connection';

let server: Server;

describe('[test 2] Server Running and Closing', () => {
    beforeAll(async () => {
        server = app.listen(0); // Listen on random port for testing
        await new Promise<void>((resolve) => {
            server.on('listening', resolve);
        });
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        // Ensure database connection is closed to release open handles
        const connection = Connection.getInstance();
        await connection.close();
    });

    it('should confirm server is running by responding to welcome route', async () => {
        const response = await request(server).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Welcome to the API server!' });
    });

    it('should confirm health check endpoint', async () => {
        const response = await request(server).get('/hz');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
        expect(response.body.database).toBe('connected');
    });
});