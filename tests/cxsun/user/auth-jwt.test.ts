import assert from "assert";

const BASE = "http://localhost:3000";

async function httpRequest(
    method: string,
    path: string,
    body?: any,
    extraHeaders: Record<string, string> = {}
) {
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
    // 0️⃣ Create dummy user
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
        email,
        password,
    });
    console.log("👉 LoginRes:", loginRes);
    assert.strictEqual(loginRes.status, 200);
    assert.ok(loginRes.body?.token, "JWT token should be returned");
    assert.ok(loginRes.body?.refreshToken, "Refresh token should be returned");
    assert.strictEqual(loginRes.body.user.email, email);

    const token = loginRes.body.token;
    const refreshToken = loginRes.body.refreshToken;

    // 2️⃣ Access protected endpoint with token
    console.log("2️⃣ Access protected endpoint with JWT");
    const protectedRes = await httpRequest("GET", "/users", undefined, {
        Authorization: `Bearer ${token}`,
    });
    console.log("👉 ProtectedRes:", protectedRes);
    assert.strictEqual(protectedRes.status, 200);

    // 3️⃣ Refresh token flow
    console.log("3️⃣ Refresh token flow");
    const refreshRes = await httpRequest("POST", "/refresh", { refreshToken });
    console.log("👉 RefreshRes:", refreshRes);
    assert.strictEqual(refreshRes.status, 200);
    assert.ok(refreshRes.body?.token, "New JWT token should be issued");

    const newToken = refreshRes.body.token;
    assert.notStrictEqual(newToken, token, "New token should differ from old");

    // 4️⃣ Access protected endpoint with refreshed token
    console.log("4️⃣ Access protected endpoint with refreshed JWT");
    const protectedRes2 = await httpRequest("GET", "/users", undefined, {
        Authorization: `Bearer ${newToken}`,
    });
    console.log("👉 ProtectedRes2:", protectedRes2);
    assert.strictEqual(protectedRes2.status, 200);

    // 5️⃣ Login with wrong credentials
    console.log("5️⃣ Login with wrong credentials");
    const badLoginRes = await httpRequest("POST", "/login", {
        email,
        password: "wrongpass",
    });
    console.log("👉 BadLoginRes:", badLoginRes);
    assert.strictEqual(badLoginRes.status, 401);

    // 6️⃣ Logout (dummy endpoint)
    console.log("6️⃣ Logout (dummy endpoint)");
    const logoutRes = await httpRequest("POST", "/logout");
    console.log("👉 LogoutRes:", logoutRes);
    assert.strictEqual(logoutRes.status, 200);

    // 7️⃣ Cleanup: delete dummy user
    console.log("7️⃣ Delete dummy user");
    const deleteRes = await httpRequest("DELETE", `/users/${userId}`);
    console.log("👉 DeleteRes:", deleteRes);
    assert.strictEqual(deleteRes.status, 204);

    console.log("✅ Auth HTTP route test passed with JWT + refresh token!");
}

if (require.main === module) {
    authHttpTest().catch((err) => {
        console.error("❌ Test failed:", err);
        process.exit(1);
    });
}
