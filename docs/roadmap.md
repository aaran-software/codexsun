# Test Report - October 06, 2025

## Overview
This report summarizes the results of the Jest test run for the CodexSun ERP software. 
All test suites passed successfully. The report includes individual test suite results, 
console outputs, code coverage, and overall summary statistics.

## Test Suite Results
The following test suites were executed and passed. Each suite includes the file path, test categories, and individual test details with execution times.

- **PASS tests/cortex/config/t01-get-settings.test.ts**  
  **[1.] getSettings**
    - √ [test 1] loads default settings (9 ms)
    - √ [test 2] requires mandatory env vars (11 ms)
    - √ [test 3] parses bool env vars (3 ms)
    - √ [test 3.1] parseBool fallback when undefined (2 ms)
    - √ [test 3.2] parseBool for '1' (5 ms)
    - √ [test 3.3] parseBool for 'true' (2 ms)
    - √ [test 3.4] parseBool for 'yes' (1 ms)
    - √ [test 3.5] parseBool for 'y' (2 ms)
    - √ [test 3.6] parseBool for 'on' (2 ms)
    - √ [test 3.7] parseBool for false values (2 ms)
    - √ [test 4] parses int env vars (2 ms)
    - √ [test 4.1] handles invalid int fallback (2 ms)
    - √ [test 5] validates driver (2 ms)
    - √ [test 5.1] uses driver fallback when undefined (1 ms)
    - √ [test 6] enforces prod validations for APP_KEY empty (2 ms)
    - √ [test 6.1] enforces prod validations for APP_KEY SomeKey (2 ms)
    - √ [test 6.2] enforces prod validations for DB_PASS empty (2 ms)
    - √ [test 6.3] enforces prod validations for DB_PASS spaces (3 ms)
    - √ [test 6.4] no throw in prod if secure (2 ms)
    - √ [test 7] caches settings (2 ms)

- **PASS tests/cortex/config/t02-db-config.test.ts**  
  **[1.] getDbConfig**
    - √ [test 1] returns config with tenancy master db (3 ms)
    - √ [test 2] uses db_name without tenancy (1 ms)
    - √ [test 3] sets higher limit in production (1 ms)

- **PASS tests/cortex/config/t03-logger.test.ts**  
  **[1.] logger**  
  **[2.] logQuery**
    - √ [test 1] logs start/end in debug (4 ms)
    - √ [test 2] logs error in prod (1 ms)
    - √ [test 3] skips debug in non-debug non-prod (1 ms)
    - √ [test 4] metrics in non-debug (1 ms)
    - √ [test 5] error metrics in non-prod (1 ms)  
      **[3.] logTransaction**
    - √ [test 1] logs start/end in debug (1 ms)
    - √ [test 2] logs error in prod (4 ms)  
      **[4.] logHealthCheck**
    - √ [test 1] logs success in debug (1 ms)
    - √ [test 2] logs error in prod (1 ms)  
      **[5.] logConnection**
    - (Truncated details; all tests passed)

- **PASS tests/cortex/db/t04-connection.test.ts (5.325 s)**
    - (Details on connection initialization, closing, and errors; all tests passed with console logs for pool closure and errors.)

- **PASS tests/cortex/db/t05-db.test.ts**
    - (Details on DB queries, transactions, and health checks; all tests passed.)

- **PASS tests/cortex/db/t10-tenant-resolver.test.ts**
    - (Details on tenant resolution; all tests passed.)

- **PASS tests/cortex/db/t11-db-integration.test.ts**
    - (Details on DB integration; all tests passed with multiple console logs for pool closure.)

- **PASS tests/cortex/db/t12-db-context-switcher.test.ts**
    - (Details on DB context switching; all tests passed with metrics and error logs for invalid connections.)

- **PASS tests/cortex/db/adapters/t06-mariadb.test.ts**
    - (Details on MariaDB adapter; all tests passed with pool closure logs.)

- **PASS tests/cortex/db/adapters/t07-postgres.test.ts**
    - (Details on Postgres adapter; all tests passed.)

- **PASS tests/cortex/db/adapters/t08-mysql.test.ts**
    - (Details on MySQL adapter; all tests passed.)

- **PASS tests/cortex/db/adapters/t09-sqlite.test.ts**
    - (Details on SQLite adapter; all tests passed.)

- **PASS tests/cortex/db/migration/t13-migration-comparison.test.ts**
    - (Details on migration comparison; all tests passed with extensive logs for database creation, migrations, and resets.)

- **PASS tests/cortex/db/migration/t14-seeder-comparision.test.ts**
    - (Details on seeder comparison; all tests passed with logs for seeding and rollback.)

- **PASS tests/cortex/db/migration/t15-persistent-setup.test.ts**
    - (Details on persistent setup; all tests passed with logs for migrations and seeding.)

## Console Outputs Summary
Numerous console logs were generated during the test run, including:
- **Metrics**: Connection durations, query durations, errors (e.g., `METRIC: connection_duration_ms 1 {}`).
- **Errors**: Non-fatal errors like "Failed to close pool: close fail" and "MariaDB connection error: Unknown database".
- **Info Logs**: Database creation, migration applications, seeding, and closures (e.g., "Created master database: master_db").

These indicate normal test behavior for setup, execution, and teardown.

## Code Coverage Report
The code coverage summary is as follows:

| File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
|---------------------|---------|----------|---------|---------|-------------------|
| **All files**       | 94.57  | 73.8    | 89.04  | 95.08  |                   |
| **config**          | 100    | 93.65   | 100    | 100    |                   |
| db-config.ts       | 100    | 100     | 100    | 100    |                   |
| get-settings.ts    | 100    | 88.88   | 100    | 100    | 28,61,65         |
| logger.ts          | 100    | 96.87   | 100    | 100    | 22               |
| **core/tenant**     | 100    | 94.44   | 100    | 100    |                   |
| tenant-resolver.ts | 100    | 94.44   | 100    | 100    | 81               |
| **db**              | 95.2   | 74.24   | 100    | 97.12  |                   |
| connection.ts      | 100    | 86.66   | 100    | 100    | 68,86            |
| db-context-switcher.ts | 100 | 70     | 100    | 100    | 14-27            |
| db.ts              | 90.41  | 70.73   | 100    | 94.02  | 47,97-99,128     |
| **db/adapters**     | 90.2   | 58.09   | 82.6   | 89.92  |                   |
| mariadb.ts         | 95.12  | 75.75   | 91.66  | 94.87  | 34,51            |
| mysql.ts           | 86.84  | 50      | 75     | 86.48  | 39,49-57         |
| postgres.ts        | 88.57  | 50      | 81.81  | 88.23  | 35,45-52         |
| sqlite.ts          | 89.65  | 50      | 81.81  | 89.65  | 39,60-61         |

## Overall Summary
- **Test Suites**: 15 passed, 15 total
- **Tests**: 139 passed, 139 total
- **Snapshots**: 0 total
- **Time**: 12.658 s
- **Ran all test suites.**

**Status**: All tests passed successfully. No failures reported.




PASS  tests/cortex/auth/t17-auth-service.test.ts
[17.] Authentication with Tenant Context
√ [test 1] authenticates user in tenant-specific DB (13 ms)
√ [test 2] rejects invalid password in tenant DB (10 ms)
√ [test 3] rejects user with mismatched tenant (3 ms)

PASS  tests/cortex/core/t18-error-handler.test.ts
[18.] Error Handling
√ [test 1] logs tenant-specific errors during resolution (4 ms)
√ [test 2] handles errors without tenant context (1 ms)

PASS  tests/cortex/user/t19-user-service.test.ts
[19.] User Service
√ [test 1] creates user in tenant DB (17 ms)
√ [test 2] fetches user from tenant DB (4 ms)
√ [test 3] rejects user creation for wrong tenant (10 ms)
√ [test 4] rejects user creation with duplicate email (4 ms)
√ [test 5] rejects user fetch with non-existent ID (4 ms)
√ [test 6] creates user in different tenant DB (15 ms)

PASS  tests/cortex/todo/t20-todo-service.test.ts
[20.] Todo Service
√ [test 1] creates todo item in tenant DB (17 ms)
√ [test 2] fetches todo item from tenant DB (3 ms)
√ [test 3] rejects todo item creation for wrong tenant (9 ms)
√ [test 4] rejects todo creation with duplicate slug (9 ms)
√ [test 5] rejects todo fetch with non-existent ID (3 ms)
√ [test 6] rejects todo creation with empty title (3 ms)
√ [test 7] rejects todo creation with empty slug (3 ms)
√ [test 8] rejects todo fetch with valid ID but wrong tenant (3 ms)
√ [test 9] creates todo item in different tenant DB (10 ms)

PASS  tests/cortex/auth/t21-login-controller.test.ts
[21.] Login Controller Tests
√ [test 1] logs in user successfully (14 ms)
√ [test 2] rejects invalid password (13 ms)
√ [test 3] rejects unknown email (1 ms)
√ [test 4] logs out user successfully (3 ms)
√ [test 5] rejects logout with empty token (2 ms)
√ [test 6] rejects login with blacklisted token (2 ms)
√ [test 7] rejects invalid email format (1 ms)
√ [test 8] rejects empty credentials (1 ms)
√ [test 9] rejects expired token (3 ms)
√ [test 10] rejects missing password (2 ms)
√ [test 11] verifies token blacklist check (1 ms)

PASS  tests/cortex/tenant/t22-tenant-middleware.test.ts
[22.] Tenant Middleware Tests
√ [test 1] sets tenant and user in request context from valid JWT (14 ms)
√ [test 2] calls next with error for invalid JWT (2 ms)
√ [test 3] skips tenant resolution for no authorization header (1 ms)
√ [test 4] calls next with error for non-existent tenant (5 ms)

PASS  tests/cortex/app/t23-app.test.ts
[23.] App Tests
√ [test 1] handles successful login with valid credentials (23 ms)
√ [test 2] rejects login with invalid credentials (16 ms)
√ [test 3] rejects login with unknown email (6 ms)
√ [test 4] rejects login when rate limit is exceeded (36 ms)
√ [test 5] handles unexpected error during login (11 ms)
√ [test 6] rejects non-POST login requests
√ [test 7] creates user with valid admin token (2 ms)
√ [test 8] creates todo item with valid admin token (2 ms)
√ [test 9] rejects /users request without authorization (4 ms)
√ [test 10] rejects /todo request without authorization (4 ms)
√ [test 11] rejects /users request with invalid token (3 ms)
√ [test 12] rejects /todo request with invalid token (2 ms)
√ [test 13] rejects /users request with invalid tenant (2 ms)
√ [test 14] rejects /todo request with insufficient permissions (1 ms)
√ [test 15] rejects /users request with insufficient permissions (2 ms)
√ [test 16] rejects non-POST requests to /users
√ [test 17] rejects non-POST requests to /todo
√ [test 18] handles service error in user creation (3 ms)
√ [test 19] handles service error in todo creation (3 ms)
√ [test 20] rejects unknown routes (3 ms)


PASS  tests/cortex/user/t24-user-controller.test.ts
[24.] User Controller
√ [test 1] creates user and returns user data for v1 (6 ms)
√ [test 2] creates user and returns user data for v2 (1 ms)
√ [test 3] creates user with default version when version is undefined (1 ms)
√ [test 4] rejects user creation for missing tenant context (11 ms)
√ [test 5] rejects user creation for missing user context (1 ms)
√ [test 6] rejects user creation for non-admin user (1 ms)
√ [test 7] handles tenant mismatch error from createUserService (1 ms)
√ [test 8] handles user already exists error from createUserService (1 ms)
√ [test 9] handles unexpected error from createUserService (1 ms)
√ [test 10] handles non-Error object thrown from createUserService


PASS  tests/cortex/todo/t25-todo-controller.test.ts
[25.] Todo Controller
√ [test 1] creates todo item and returns item data for v1 (4 ms)
√ [test 2] creates todo item and returns item data for v2 (1 ms)
√ [test 3] creates todo item with default version when version is undefined (1 ms)
√ [test 4] rejects todo item creation for missing tenant context (11 ms)
√ [test 5] rejects todo item creation for missing user context (1 ms)
√ [test 6] rejects todo item creation for non-admin user (1 ms)
√ [test 7] handles tenant mismatch error from createTodoItemService (1 ms)
√ [test 8] handles duplicate slug error from createTodoItemService (1 ms)
√ [test 9] handles unexpected error from createTodoItemService (1 ms)
√ [test 10] handles non-Error object thrown from createTodoItemService (1 ms)

PASS  tests/cortex/auth/t26-auth-middleware.test.ts
[26.] Auth Middleware
√ [test 1] allows request with sufficient role (3 ms)
√ [test 2] rejects request with insufficient role (2 ms)
√ [test 3] rejects request with missing user context (1 ms)

PASS  tests/cortex/auth/t27-rate-limiter.test.ts
[27.] Rate Limiter
√ [test 1] allows request within rate limit (3 ms)
√ [test 2] rejects request exceeding rate limit (1 ms)
√ [test 3] resets limit after window (2 ms)
√ [test 4] handles no tenant (global) (1 ms)
√ [test 5] separate limits per tenant (1 ms)

PASS  tests/cortex/app/t28-app.test.ts
[28.] Express App Protected Endpoints
√ [test 1] creates user with admin role (4 ms)
√ [test 2] rejects user creation with non-admin role (21 ms)
√ [test 3] rejects request with invalid tenant (4 ms)
√ [test 4] rejects non-POST requests to /users (1 ms)
√ [test 5] login and create user in sequence (1 ms)
√ [test 6] rejects /users request without authorization (3 ms)


PASS  tests/cortex/app/t29-api.test.ts
[29. API] Endpoint Tests
√ [test 1] POST /login succeeds with valid credentials (5 ms)
√ [test 2] POST /login fails with invalid credentials (3 ms)
√ [test 3] POST /login fails with unknown email (3 ms)
√ [test 4] POST /login fails when rate limit exceeded (3 ms)
√ [test 5] POST /login handles database connection error (3 ms)
√ [test 6] POST /users creates user with valid admin token (2 ms)
√ [test 7] POST /todo creates todo with valid admin token (1 ms)
√ [test 8] POST /users fails without authorization (4 ms)
√ [test 9] POST /todo fails with invalid token (3 ms)
√ [test 10] POST /users fails with insufficient permissions (2 ms)
√ [test 11] GET /login returns 404 for non-POST requests
√ [test 12] POST /unknown returns 404 for unknown routes (1 ms)

