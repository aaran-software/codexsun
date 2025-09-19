import assert from "assert";

const BASE = "http://localhost:3000";

async function httpRequest(method: string, path: string, body?: any, extraHeaders: Record<string, string> = {}) {
    const headers: Record<string, string> = { ...extraHeaders };
    if (body) headers["Content-Type"] = "application/json";

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    let data = null;
    try {
        data = await res.json();
    } catch {
        // ignore if no body
    }

    return { status: res.status, body: data };
}

export async function authHttpTest() {
    // 0️⃣ Create dummy user in DB via API
    console.log("0️⃣ Create dummy user");
    const email = `auth_test_${Date.now()}@example.com`;
    const password = "pass123";

    const createRes = await httpRequest("POST", "/users", {
        name: "AuthTestUser",
        email,
        password,
    });
    console.log("👉 CreateRes:", createRes);
    assert.strictEqual(createRes.status, 201);
    assert.ok(createRes.body?.id);
    const userId = createRes.body.id;

    // 1️⃣ Login with correct credentials
    console.log("1️⃣ Login with correct credentials");
    const loginRes = await httpRequest("POST", "/login", {
        username: email,
        password,
    });
    console.log("👉 LoginRes:", loginRes);
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.message, "Login successful");

    // 2️⃣ Login with wrong credentials
    console.log("2️⃣ Login with wrong credentials");
    const badLoginRes = await httpRequest("POST", "/login", {
        username: email,
        password: "wrongpass",
    });
    console.log("👉 BadLoginRes:", badLoginRes);
    assert.strictEqual(badLoginRes.status, 401);

    // 3️⃣ Logout (dummy endpoint)
    console.log("3️⃣ Logout (dummy endpoint)");
    const logoutRes = await httpRequest("POST", "/logout");
    console.log("👉 LogoutRes:", logoutRes);
    assert.strictEqual(logoutRes.status, 200);
    assert.strictEqual(logoutRes.body.message, "Logout successful");

    // 4️⃣ Cleanup: delete dummy user
    console.log("4️⃣ Delete dummy user");
    const deleteRes = await httpRequest("DELETE", `/users/${userId}`);
    console.log("👉 DeleteRes:", deleteRes);
    assert.strictEqual(deleteRes.status, 204);

    console.log("✅ Auth HTTP route test passed with real DB!");
}

if (require.main === module) {
    authHttpTest().catch((err) => {
        console.error("❌ Test failed:", err);
        process.exit(1);
    });
}
