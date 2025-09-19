// tests/test.ts
import "reflect-metadata";
import {userHttpTest} from "./cxsun/user/user-route.test";

async function runAllTests() {
  console.log("🚀 Starting All Tests...\n");

    // await runUserCrudTest();
    await userHttpTest()

  console.log("\n🎉 All Tests Completed Successfully");
}

runAllTests().catch((err) => {
  console.error("❌ Tests failed:", err);
  process.exit(1);
});
