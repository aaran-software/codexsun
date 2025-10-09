import supertest, { SuperTest, Test } from "supertest";
import { generateJwt } from "../cortex/core/secret/jwt-service";
import { Connection } from "../cortex/db/connection";
import { query } from "../cortex/db/db";

const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';
const API_URL = 'http://localhost:3006'; // Matches live environment

describe('[30. API] CODEXSUN ERP Server', () => {
    let request: SuperTest<Test>;
    let connection: Connection;
    let testToken: string;

    beforeAll(async () => {
        // Initialize database connection
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
        await query('DELETE FROM user_sessions', [], MASTER_DB);

        // Initialize supertest with the API URL
        request = supertest(API_URL) as unknown as SuperTest<Test>;
        // Generate a test JWT token with string user_id
        testToken = await generateJwt({ id: "1", tenantId: "default", role: "admin" });
    });

    afterAll(async () => {
        await connection.close();
    });

    test("[test 1] GET / should return server running status", async () => {
        const response = await request.get("/");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "Server is running" });
    });

    test("[test 2] GET /hz should return server running status", async () => {
        const response = await request.get("/hz");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "healthy is running" });
    });

    test("[test 3] GET /api/users should return list of users", async () => {
        const response = await request.get("/api/users");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ users: [], message: "List of users" });
    });

    test("[test 4] GET /api/bob should return list of bob", async () => {
        const response = await request.get("/api/bob");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ users: [], message: "List of bob" });
    });

    test("[test 5] POST /api/users should create a user", async () => {
        const userData = { name: "Test User", email: "test@example.com" };
        const response = await request
            .post("/api/users")
            .set("Content-Type", "application/json")
            .send(userData);
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: "User created", user: userData });
    });

    test("[test 6] POST /api/users with invalid JSON should return 400", async () => {
        const response = await request
            .post("/api/users")
            .set("Content-Type", "application/json")
            .send("invalid json");
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Invalid JSON" });
    });

    test("[test 7] GET /unknown should return 404", async () => {
        const response = await request.get("/unknown");
        expect(response.status).toBe(404);
        expect(response.text).toBe("404 Not Found");
    });

    test("[test 8] POST /login with valid credentials should return token", async () => {
        const credentials = { email: "admin@example.com", password: "admin123" };
        const response = await request
            .post("/login")
            .set("Content-Type", "application/json")
            .send(credentials);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            user: {
                id: 1,
                username: "admin_user",
                email: "admin@example.com",
                tenantId: "default",
                role: "admin",
                token: expect.any(String),
            },
            tenant: {
                id: "default",
                dbConnection: expect.any(String),
            },
        });
        testToken = response.body.user.token; // Update testToken for verify and logout tests
    });

    test("[test 9] POST /login with invalid credentials should return 401", async () => {
        const credentials = { email: "wronguser@example.com", password: "wrongpassword" };
        const response = await request
            .post("/login")
            .set("Content-Type", "application/json")
            .send(credentials);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: "Invalid credentials" });
    });

    test("[test 10] POST /login with missing credentials should return 400", async () => {
        const credentials = { email: "admin@example.com" }; // Missing password
        const response = await request
            .post("/login")
            .set("Content-Type", "application/json")
            .send(credentials);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Email and password are required" });
    });

    test("[test 11] POST /login with invalid JSON should return 400", async () => {
        const response = await request
            .post("/login")
            .set("Content-Type", "application/json")
            .send("invalid json");
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Invalid JSON" });
    });

    test("[test 12] GET /api/auth/verify with valid token should return user data", async () => {
        const response = await request
            .get("/api/auth/verify")
            .set("Authorization", `Bearer ${testToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "Token is valid",
            user: {
                id: 1,
                username: "admin_user",
                tenantId: "default",
                role: "admin",
            },
        });
    });

    test("[test 13] POST /logout with valid token should return success", async () => {
        const response = await request
            .post("/logout")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${testToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Logged out successfully" });
    });

    test("[test 14] GET /api/auth/verify with invalid token should return 401", async () => {
        const response = await request
            .get("/api/auth/verify")
            .set("Authorization", "Bearer wrong-token");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: "Invalid or expired token" });
    });
});