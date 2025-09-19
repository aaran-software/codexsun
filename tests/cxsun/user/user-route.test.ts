// tests/cxsun/user/user-route.test.ts
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
        // ignore if no body (e.g. 204 No Content)
    }

    return { status: res.status, body: data };
}

export async function userHttpTest() {
    console.log("1️⃣ Create user");
    const createRes = await httpRequest("POST", "/users", {
        name: "HttpUser",
        email: `http_${Date.now()}@example.com`,
        password: "pass123",
    });
    console.log("👉 CreateRes:", createRes);
    assert.strictEqual(createRes.status, 201);
    assert.ok(createRes.body?.id);
    const userId = createRes.body.id;

    console.log("2️⃣ List users");
    const listRes = await httpRequest("GET", "/users");
    console.log("👉 ListRes:", listRes);
    assert.strictEqual(listRes.status, 200);
    assert.ok(Array.isArray(listRes.body));
    assert.ok(listRes.body.some((u: any) => u.id === userId));

    console.log("3️⃣ Get user by id");
    const getRes = await httpRequest("GET", `/users/${userId}`);
    console.log("👉 GetRes:", getRes);
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.body.id, userId);

    console.log("4️⃣ Update user with PUT");
    const putRes = await httpRequest("PUT", `/users/${userId}`, {
        name: "UpdatedUser",
        email: `updated_${Date.now()}@example.com`,
        password: "newpass",
    });
    console.log("👉 PutRes:", putRes);
    assert.strictEqual(putRes.status, 200);
    assert.strictEqual(putRes.body.name, "UpdatedUser");

    console.log("5️⃣ Patch user with PATCH");
    const patchRes = await httpRequest("PATCH", `/users/${userId}`, {
        status: "inactive",
    });
    console.log("👉 PatchRes:", patchRes);
    assert.strictEqual(patchRes.status, 200);
    assert.strictEqual(patchRes.body.status, "inactive");

    console.log("6️⃣ Delete user");
    const deleteRes = await httpRequest("DELETE", `/users/${userId}`);
    console.log("👉 DeleteRes:", deleteRes);
    assert.strictEqual(deleteRes.status, 204);

    console.log("7️⃣ Confirm deletion");
    const notFoundRes = await httpRequest("GET", `/users/${userId}`);
    console.log("👉 NotFoundRes:", notFoundRes);
    assert.strictEqual(notFoundRes.status, 404);

    console.log("✅ Extended HTTP user route test passed!");
}

if (require.main === module) {
    userHttpTest().catch((err) => {
        console.error("❌ Test failed:", err);
        process.exit(1);
    });
}
