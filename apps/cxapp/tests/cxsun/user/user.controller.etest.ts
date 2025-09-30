import { Application } from "../../../cortex/core/application";
import { UserProvider } from "../../../apps/cxsun/code/user/user.provider";
import mariadb from "mariadb";
import supertest from "supertest";
import { close } from "../../../cortex/db/connection";

interface TestDatabase {
    query: (text: string, params?: any[]) => Promise<{ rows: any[]; affectedRows?: number }>;
    withTransaction: <T>(fn: (q: any) => Promise<T>) => Promise<T>;
}

const TEST_DB_CONFIG = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Computer.1",
    database: process.env.DB_NAME || "codexsun_db",
    connectionLimit: 5,
};

const APP_URL = process.env.APP_URL || "http://localhost:3006";

describe("UserController API Setup", () => {
    let app: Application;
    let request: supertest.SuperAgentTest;
    let db: mariadb.Pool;

    beforeAll(async () => {
        // Initialize test database
        console.log("Test DB Config:", TEST_DB_CONFIG);
        db = mariadb.createPool(TEST_DB_CONFIG);

        // Register UserProvider with a real Application instance
        app = new Application();
        const userProvider = new UserProvider();
        app.container.register("Database", {
            useValue: {
                query: async (text: string, params: any[] = []) => {
                    const result = await db.query(text, params);
                    return { rows: Array.isArray(result) ? result : [], affectedRows: result.affectedRows };
                },
                withTransaction: async <T>(fn: (q: any) => Promise<T>): Promise<T> => {
                    const connection = await db.getConnection();
                    try {
                        await connection.beginTransaction();
                        const result = await fn(connection);
                        await connection.commit();
                        return result;
                    } catch (e) {
                        await connection.rollback();
                        throw e;
                    } finally {
                        await connection.release();
                    }
                },
            } as TestDatabase,
        });

        await userProvider.register(app);
        await userProvider.boot(app);

        // Initialize supertest with the real server URL
        request = supertest.agent(APP_URL) as unknown as supertest.SuperAgentTest;

        // Test database connection
        const connection = await db.getConnection();
        try {
            await connection.ping();
        } finally {
            await connection.release();
        }

        // Test users table exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS users
            (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
        `);
    });

    beforeEach(async () => {
        await db.query("TRUNCATE TABLE users");
    });

    afterAll(async () => {
        try {
            await db.query("DROP TABLE IF EXISTS users");
        } catch (e) {
            console.error("Error dropping table:", e);
        }
        try {
            await db.end();
            await close();
        } catch (e) {
            console.error("Error closing database pool:", e);
        }
    });

    it("[Test 1] should confirm server is running", async () => {
        const response = await request.get("/users");
        expect(response.status).toBeDefined();
    });

    it("[Test 2] should confirm database is connected", async () => {
        const result = await db.query("SELECT 1 AS test");
        expect(result[0].test).toBe(1);
    });

    it("[Test 3] should confirm users table exists", async () => {
        const result = await db.query("SHOW TABLES LIKE 'users'");
        expect(result.length).toBeGreaterThan(0);
    });

    describe("GET /users", () => {
        it("[Test 4] should return an empty array when no users exist", async () => {
            const response = await request.get("/users");
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it("[Test 5] should return all users", async () => {
            await db.query(
                "INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, ?)",
                ["John Doe", "john@example.com", "password123", "active"]
            );

            const response = await request.get("/users");
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toMatchObject({
                name: "John Doe",
                email: "john@example.com",
                status: "active",
            });
        });
    });

    describe("GET /users/:id", () => {
        it("[Test 6] should return 400 for invalid id", async () => {
            const response = await request.get("/users/invalid");
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: "Invalid user id" });
        });

        it("[Test 7] should return 404 for non-existent user", async () => {
            const response = await request.get("/users/999");
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: "User not found" });
        });

        it("[Test 8] should return user by id", async () => {
            const insertResult = await db.query(
                "INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, ?) RETURNING id",
                ["Jane Doe", "jane@example.com", "password123", "active"]
            );
            const userId = insertResult[0].id;

            const response = await request.get(`/users/${userId}`);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: userId,
                name: "Jane Doe",
                email: "jane@example.com",
                status: "active",
            });
        });
    });

    describe("POST /users", () => {
        it("[Test 9] should return 400 for missing fields", async () => {
            const response = await request.post("/users").send({ name: "John" });
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: "Missing required fields" });
        });

        it("[Test 10] should create a new user", async () => {
            const newUser = {
                name: "Alice Smith",
                email: "alice@example.com",
                password: "secure123",
            };

            const response = await request.post("/users").send(newUser);
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                name: newUser.name,
                email: newUser.email,
                status: "active",
            });
            expect(response.body.id).toBeDefined();
            expect(response.body.created_at).toBeDefined();
            expect(response.body.updated_at).toBeDefined();
        });
    });

    describe("PATCH /users/:id", () => {
        it("[Test 11] should return 400 for invalid id", async () => {
            const response = await request.patch("/users/invalid").send({ name: "Updated" });
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: "Invalid ID" });
        });

    });
});