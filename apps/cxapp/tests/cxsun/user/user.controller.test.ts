import { Application } from "../../../cortex/core/application";
import { UserProvider } from "../../../apps/cxsun/code/user/user.provider";
import mariadb from "mariadb";
import supertest from "supertest";

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

        // Initialize supertest with the real server URL, using type assertion
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
            CREATE TABLE IF NOT EXISTS users (
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

    afterAll(async () => {
        try {
            await db.query("DROP TABLE IF EXISTS users");
        } catch (e) {
            console.error("Error dropping table:", e);
        }
        try {
            await db.end(); // Ensure pool is closed
        } catch (e) {
            console.error("Error closing database pool:", e);
        }
    });

    it("should confirm server is running", async () => {
        const response = await request.get("/users");
        expect(response.status).toBeDefined();
    });

    it("should confirm database is connected", async () => {
        const result = await db.query("SELECT 1 AS test");
        expect(result[0].test).toBe(1);
    });

    it("should confirm users table exists", async () => {
        const result = await db.query("SHOW TABLES LIKE 'users'");
        expect(result.length).toBeGreaterThan(0);
    });
});