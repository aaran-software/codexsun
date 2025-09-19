// tests/test.ts
import "reflect-metadata";
// import {userHttpTest} from "./cxsun/user/user-route.test";
import {authHttpTest} from "./cxsun/user/auth-route.test";

async function runAllTests() {
  console.log("🚀 Starting All Tests...\n");

    // await runUserCrudTest();
    await authHttpTest()

  console.log("\n🎉 All Tests Completed Successfully");
}

runAllTests().catch((err) => {
  console.error("❌ Tests failed:", err);
  process.exit(1);
});
