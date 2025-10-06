jest --detectOpenHandles

PASS  tests/cortex/config/t01-get-settings.test.ts
[1.] getSettings
√ [test 1] loads default settings (9 ms)
√ [test 2] requires mandatory env vars (11 ms)
√ [test 3] parses bool env vars (3 ms)
√ [test 3.1] parseBool fallback when undefined (2 ms)
√ [test 3.2] parseBool for '1' (5 ms)
√ [test 3.3] parseBool for 'true' (2 ms)
√ [test 3.4] parseBool for 'yes' (1 ms)
√ [test 3.5] parseBool for 'y' (2 ms)
√ [test 3.6] parseBool for 'on' (2 ms)
√ [test 3.7] parseBool for false values (2 ms)
√ [test 4] parses int env vars (2 ms)
√ [test 4.1] handles invalid int fallback (2 ms)
√ [test 5] validates driver (2 ms)
√ [test 5.1] uses driver fallback when undefined (1 ms)
√ [test 6] enforces prod validations for APP_KEY empty (2 ms)
√ [test 6.1] enforces prod validations for APP_KEY SomeKey (2 ms)
√ [test 6.2] enforces prod validations for DB_PASS empty (2 ms)
√ [test 6.3] enforces prod validations for DB_PASS spaces (3 ms)
√ [test 6.4] no throw in prod if secure (2 ms)
√ [test 7] caches settings (2 ms)

Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        0.77 s
Ran all test suites.

Process finished with exit code 0

PASS  tests/cortex/config/t02-db-config.test.ts
[1.] getDbConfig
√ [test 1] returns config with tenancy master db (3 ms)
√ [test 2] uses db_name without tenancy (1 ms)
√ [test 3] sets higher limit in production (1 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.538 s
Ran all test suites.

Process finished with exit code 0

C:\Users\SUNDAR\AppData\Roaming\npm\pnpm.cmd test

> backend@0.1.0 test E:\Workspace\codexsun\apps\backend
> jest --runInBand

PASS  tests/cortex/config/t03-logger.test.ts
[1.] logger
[2.] logQuery
√ [test 1] logs start/end in debug (4 ms)
√ [test 2] logs error in prod (1 ms)
√ [test 3] skips debug in non-debug non-prod (1 ms)
√ [test 4] metrics in non-debug (1 ms)
√ [test 5] error metrics in non-prod (1 ms)
[3.] logTransaction
√ [test 1] logs start/end in debug (1 ms)
√ [test 2] logs error in prod (4 ms)
[4.] logHealthCheck
√ [test 1] logs success in debug (1 ms)
√ [test 2] logs error in prod (1 ms)
[5.] logConnection
√ [test 1] logs start/success in debug (1 ms)
√ [test 2] logs error in prod (1 ms)

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        0.71 s
Ran all test suites.

Process finished with exit code 0

C:\Users\SUNDAR\AppData\Roaming\npm\pnpm.cmd test

> backend@0.1.0 test E:\Workspace\codexsun\apps\backend
> jest --runInBand

console.log
Connection fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.error
Failed to close pool: close fail

      85 |         } catch (error) {
      86 |             const errMsg = (error as Error).message || 'Unknown error';
    > 87 |             console.error(`Failed to close pool: ${errMsg}`);
         |                     ^
      88 |             throw new Error(`Failed to close pool: ${errMsg}`);
      89 |         }
      90 |     }

      at Connection.close (cortex/db/connection.ts:87:21)
      at Object.<anonymous> (tests/cortex/db/t04-connection.test.ts:131:9)

PASS  tests/cortex/db/t04-connection.test.ts (5.733 s)
[1.] Connection
√ [test 1] initializes singleton with config and calls init (5 ms)
√ [test 2] throws on unsupported type (11 ms)
√ [test 3] gets instance after initialize (1 ms)
√ [test 4] throws if getInstance before initialize (1 ms)
√ [test 5] closes pool and resets instance (22 ms)
√ [test 6] gets client from adapter (2 ms)
√ [test 7] gets config (1 ms)
√ [test 8] handles init error with retry in production (5015 ms)
√ [test 9] throws on init error in non-production (5 ms)
√ [test 10] handles close error (5 ms)
√ [test 11] initializes with postgres (1 ms)
√ [test 12] initializes with mysql (1 ms)
√ [test 13] initializes with sqlite (1 ms)

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        6.018 s
Ran all test suites.

Process finished with exit code 0

C:\Users\SUNDAR\AppData\Roaming\npm\pnpm.cmd test

> backend@0.1.0 test E:\Workspace\codexsun\apps\backend
> jest --runInBand

PASS  tests/cortex/db/t05-db.test.ts
[1.] db
[2.] query
√ [test 1] executes query on tenant db if set (5 ms)
√ [test 2] falls back to master db (1 ms)
√ [test 3] throws on invalid sql (11 ms)
√ [test 4] handles query error (1 ms)
√ [test 5] releases client in finally
√ [test 6] handles release error (1 ms)
[3.] withTransaction
√ [test 1] executes transaction callback successfully (2 ms)
√ [test 2] rolls back on error (1 ms)
√ [test 3] handles rollback error (1 ms)
√ [test 4] releases client in finally (1 ms)
[4.] healthCheck
√ [test 1] returns true on successful ping (1 ms)
√ [test 2] returns false on error
√ [test 3] releases client in finally
√ [test 4] handles release error

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        0.924 s
Ran all test suites.

Process finished with exit code 0

C:\Users\SUNDAR\AppData\Roaming\npm\pnpm.cmd test

> backend@0.1.0 test E:\Workspace\codexsun\apps\backend
> jest --runInBand

console.log
MariaDB pool fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

PASS  tests/cortex/db/adapters/t06-mariadb.test.ts
[1.] MariaDBAdapter
√ [test 1] inits pool with config (4 ms)
√ [test 2] closes pool (20 ms)
√ [test 3] gets connection and uses database if provided (1 ms)
√ [test 4] connects using connect method (1 ms)
√ [test 5] disconnects client (1 ms)
√ [test 6] queries with client
√ [test 7] begins transaction
√ [test 8] commits transaction
√ [test 9] rollbacks transaction (1 ms)
√ [test 10] handles connection error (6 ms)
√ [test 11] skips init if initialized
√ [test 12] catches getConnection error
√ [test 13] disconnect with end if no release

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        0.751 s
Ran all test suites.

Process finished with exit code 0

C:\Users\SUNDAR\AppData\Roaming\npm\pnpm.cmd test

> backend@0.1.0 test E:\Workspace\codexsun\apps\backend
> jest --runInBand

PASS  tests/cortex/db/adapters/t07-postgres.test.ts
[1.] PostgresAdapter
√ [test 1] inits pool with config (4 ms)
√ [test 2] closes pool (1 ms)
√ [test 3] gets connection and sets schema if database provided (1 ms)
√ [test 4] connects using connect method (1 ms)
√ [test 5] disconnects client (1 ms)
√ [test 6] queries with client (1 ms)
√ [test 7] begins transaction
√ [test 8] commits transaction
√ [test 9] rollbacks transaction
√ [test 10] handles connection error (6 ms)
√ [test 11] skips init if initialized
√ [test 12] catches getConnection error (1 ms)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        0.738 s
Ran all test suites.


PASS  tests/cortex/db/adapters/t08-mysql.test.ts
[1.] MysqlAdapter
√ [test 1] inits pool with config (4 ms)
√ [test 2] closes pool
√ [test 3] gets connection and uses database if provided (1 ms)
√ [test 4] connects using connect method (1 ms)
√ [test 5] disconnects client (1 ms)
√ [test 6] queries with client (1 ms)
√ [test 7] begins transaction (1 ms)
√ [test 8] commits transaction (1 ms)
√ [test 9] rollbacks transaction
√ [test 10] handles connection error (7 ms)
√ [test 11] skips init if initialized (1 ms)
√ [test 12] catches getConnection error (1 ms)
√ [test 13] disconnect with end if no release

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        0.756 s
Ran all test suites.

C:\Users\SUNDAR\AppData\Roaming\npm\pnpm.cmd test

> backend@0.1.0 test E:\Workspace\codexsun\apps\backend
> jest --runInBand

PASS  tests/cortex/db/adapters/t09-sqlite.test.ts
[1.] SqliteAdapter
√ [test 1] initPool is no-op (2 ms)
√ [test 2] closePool is no-op
√ [test 3] gets connection with database file (5 ms)
√ [test 4] throws if no database for connection (9 ms)
√ [test 5] connects using connect method (1 ms)
√ [test 6] disconnects client (1 ms)
√ [test 7] queries with client for SELECT (1 ms)
√ [test 8] begins transaction (1 ms)
√ [test 9] commits transaction (1 ms)
√ [test 10] rollbacks transaction (1 ms)
√ [test 11] catches getConnection error (1 ms)
√ [test 12] queries with client for INSERT

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        0.654 s
Ran all test suites.

Process finished with exit code 0

C:\Users\SUNDAR\AppData\Roaming\npm\pnpm.cmd test

> backend@0.1.0 test E:\Workspace\codexsun\apps\backend
> jest --runInBand

PASS  tests/cortex/db/t10-tenant-resolver.test.ts
[1.] resolveTenant
√ [test 1] throws on missing email (12 ms)
√ [test 2] throws if no user found (1 ms)
√ [test 3] throws if multiple users found
√ [test 4] throws if no tenant found
√ [test 5] throws on incomplete tenant config (1 ms)
√ [test 6] resolves tenant and builds connection string without pass (1 ms)
√ [test 7] resolves tenant with pass and ssl (1 ms)
√ [test 8] handles resolution error

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        0.889 s
Ran all test suites.

Process finished with exit code 0

C:\Users\SUNDAR\AppData\Roaming\npm\pnpm.cmd test

> backend@0.1.0 test E:\Workspace\codexsun\apps\backend
> jest --runInBand

console.log
MariaDB pool fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
Connection fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
MariaDB pool fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
Connection fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
MariaDB pool fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
Connection fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
MariaDB pool fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
Connection fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
MariaDB pool fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
Connection fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
MariaDB pool fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
Connection fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
MariaDB pool fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
Connection fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
MariaDB pool fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
Connection fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
MariaDB pool fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

console.log
Connection fully closed

      at console.Object.<anonymous>.console.log (tests/base/jest.setup.js:7:3)

PASS  tests/cortex/db/t11-db-integration.test.ts
[1.] Integration: Config & Logger
√ [test 1] getSettings loads defaults/overrides (4 ms)
√ [test 2] getDbConfig with tenancy
√ [test 3] logger phases/metrics (1 ms)
[2.] Integration: Connection & DB Ops
√ [test 1] connection init/close (24 ms)
√ [test 2] query/withTransaction/healthCheck (153 ms)
√ [test 3] error handling/retries (122 ms)
[3.] Integration: Tenant Resolver & Multi-Tenant
√ [test 1] resolveTenant & switch context (477 ms)
√ [test 2] tenant errors/validation (440 ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        2.375 s
Ran all test suites.

Process finished with exit code 0


PASS  tests/cortex/db/migration/t13-migration-comparison.test.ts
Migration Comparison: Real DB Schema Assert
√ creates master DB with migrations table (22 ms)
√ applies 001_create_tenants schema (7 ms)
√ applies 002_create_tenant_users schema w/ FK (7 ms)
√ tracks applied migrations (3 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        2.173 s
Ran all test suites.

Process finished with exit code 0

PASS  tests/cortex/db/migration/t14-seeder-comparision.test.ts
Seeder Comparison: Real DB Data Assert
√ seeds tenants table with default tenant (8 ms)
√ seeds tenant_users table with default users (4 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        1.716 s
Ran all test suites.


PASS  tests/cortex/db/migration/t15-persistent-setup.test.ts
Persistent DB Setup: Create/Keep Master Tables & Data
√ verifies master_db setup and health (21 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.804 s
Ran all test suites.

Process finished with exit code 0






















