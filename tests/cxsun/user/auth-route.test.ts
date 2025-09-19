import assert from "assert";

const BASE = "http://localhost:3000";

async function httpRequest(method: string, path: string, body?: any) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
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
    console.log("1️⃣ Login with correct credentials");
    const loginRes = await httpRequest("POST", "/login", {
        username: "admin",
        password: "1234",
    });
    console.log("👉 LoginRes:", loginRes);
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.message, "Login successful");

    console.log("2️⃣ Login with wrong credentials");
    const badLoginRes = await httpRequest("POST", "/login", {
        username: "wrong",
        password: "bad",
    });
    console.log("👉 BadLoginRes:", badLoginRes);
    assert.strictEqual(badLoginRes.status, 401);

    console.log("3️⃣ Logout (dummy endpoint)");
    const logoutRes = await httpRequest("POST", "/logout");
    console.log("👉 LogoutRes:", logoutRes);
    assert.strictEqual(logoutRes.status, 200);
    assert.strictEqual(logoutRes.body.message, "Logout successful");

    console.log("✅ Auth HTTP route test passed!");
}

if (require.main === module) {
    authHttpTest().catch((err) => {
        console.error("❌ Test failed:", err);
        process.exit(1);
    });
}
