import supertest, { SuperTest, Test } from "supertest";

const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';
const API_URL = 'http://localhost:3006'; // Matches live environment

describe('[30. API] CODEXSUN ERP Server', () => {
    let request: SuperTest<Test>;

    beforeAll(() => {
        // Initialize supertest with the API URL (server is started manually)
        request = supertest(API_URL) as unknown as SuperTest<Test>;
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
});