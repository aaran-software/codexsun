import { getDbConfig } from "../../../../cortex/config/db-config";
import { Connection } from "../../../../cortex/db/connection";
import { query,tenantStorage } from "../../../../cortex/db/db";
import { tenantMigrate, resetTenantDatabase } from "../../../../cortex/db/migration/tenant/tenant-migrate";
import { resolveByEmail } from "../../../../cortex/core/tenant/tenant-resolver";
import { masterMigrate } from "../../../../cortex/db/migration/master/master-migrate";

jest.setTimeout(30000);

const MASTER_DB_NAME = "master_db";
const TENANT_EMAIL = "admin@default.com";
const TENANT_ID = "default_tenant";
const TENANT_DB_NAME = "tenant_db";

interface DescribeRow {
    Field: string;
    Type: string;
    Null: string;
    Key: string;
    Default: string | null;
    Extra: string;
}

describe("Tenant Migration: Schema Assert", () => {
    let config: ReturnType<typeof getDbConfig>;
    let tenantDbName: string;

    beforeAll(async () => {
        // Set master DB name, unset DB_NAME initially
        process.env.MASTER_DB_NAME = MASTER_DB_NAME;
        delete process.env.DB_NAME;
        config = getDbConfig();
        await Connection.initialize({...config, database: ''});

        // Setup master DB with migrations
        await tenantStorage.run(MASTER_DB_NAME, async () => {
            await query(`DROP TABLE IF EXISTS migrations`, []).catch(() => {});
        });
        await masterMigrate();
        await Connection.initialize({...config, database: MASTER_DB_NAME});

        // Insert test tenant data if not exists
        await tenantStorage.run(MASTER_DB_NAME, async () => {
            await query(
                `INSERT IGNORE INTO tenants (tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [TENANT_ID, '127.0.0.1', '3306', 'root', null, TENANT_DB_NAME, null]
            );
            await query(
                `INSERT IGNORE INTO tenant_users (email, tenant_id, created_at, updated_at) 
                 VALUES (?, ?, NOW(), NOW())`,
                [TENANT_EMAIL, TENANT_ID]
            );
        });

        // Create tenant database
        await query(`CREATE DATABASE IF NOT EXISTS \`${TENANT_DB_NAME}\``, []).catch((err: unknown) => {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Failed to create tenant database ${TENANT_DB_NAME}: ${error.message}`);
            throw error;
        });

        // Resolve tenant to get DB name
        const tenant = await resolveByEmail({ body: { email: TENANT_EMAIL, password: "test" } });
        tenantDbName = tenant.dbConnection.split('/').pop() || TENANT_DB_NAME;

        // Initialize tenant database connection
        process.env.DB_NAME = tenantDbName;
        await Connection.initialize({...config, database: tenantDbName});

        // Clear tenant migrations table
        await tenantStorage.run(tenantDbName, async () => {
            await query(`DROP TABLE IF EXISTS migrations`, []).catch(() => {});
        });
        await tenantMigrate();

        // Re-initialize connection after migration (since tenantMigrate closes it)
        await Connection.initialize({...config, database: tenantDbName});
    });

    afterAll(async () => {
        if (tenantDbName) {
            try {
                // Re-initialize connection for cleanup
                await Connection.initialize({...config, database: ''});
                await resetTenantDatabase(tenantDbName);
                await query(`DROP DATABASE IF EXISTS \`${tenantDbName}\``, []);
            } catch (err: unknown) {
                const error = err instanceof Error ? err : new Error('Unknown error');
                console.error(`Failed to reset tenant database ${tenantDbName}: ${error.message}`);
            }
        }
        try {
            await Connection.getInstance().close();
        } catch {}
    });

    const assertSchema = async (table: string, expectedColumns: Array<{ Field: string; Type: string; Null: string; Key: string; Default: string | null; Extra: string }>) => {
        const descResult = await tenantStorage.run(tenantDbName, () =>
            query<DescribeRow>(`DESCRIBE \`${table}\``, [])
        );
        const actual = descResult.rows.map((row) => ({
            Field: row.Field,
            Type: row.Type,
            Null: row.Null,
            Key: row.Key,
            Default: row.Default || null,
            Extra: row.Extra || ""
        }));
        expect(actual).toEqual(expectedColumns);
    };

    it("creates tenant DB with migrations table", async () => {
        const tablesResult = await tenantStorage.run(tenantDbName, () =>
            query<{ [key: string]: string }>(`SHOW TABLES`, [])
        );
        const tables = tablesResult.rows.map((row) => row[`Tables_in_${tenantDbName}`]);
        expect(tables).toContain("migrations");
        const migDesc = await tenantStorage.run(tenantDbName, () =>
            query<DescribeRow>("DESCRIBE migrations", [])
        );
        expect(migDesc.rows.length).toBe(3);
        expect(migDesc.rows[0].Field).toBe("id");
        expect(migDesc.rows[1].Field).toBe("name");
        expect(migDesc.rows[2].Field).toBe("applied_at");
    });

    it("applies 001_create_users schema", async () => {
        const expected = [
            { Field: "id", Type: "int(11)", Null: "NO", Key: "PRI", Default: null, Extra: "auto_increment" },
            { Field: "username", Type: "varchar(255)", Null: "NO", Key: "", Default: null, Extra: "" },
            { Field: "email", Type: "varchar(255)", Null: "NO", Key: "UNI", Default: null, Extra: "" },
            { Field: "password_hash", Type: "varchar(255)", Null: "NO", Key: "", Default: null, Extra: "" },
            { Field: "mobile", Type: "varchar(255)", Null: "YES", Key: "", Default: null, Extra: "" },
            { Field: "status", Type: "varchar(255)", Null: "YES", Key: "", Default: null, Extra: "" },
            { Field: "tenant_id", Type: "varchar(255)", Null: "NO", Key: "", Default: null, Extra: "" },
            { Field: "role", Type: "varchar(255)", Null: "YES", Key: "", Default: null, Extra: "" },
            { Field: "created_at", Type: "timestamp", Null: "YES", Key: "", Default: "current_timestamp()", Extra: "" },
            { Field: "updated_at", Type: "timestamp", Null: "YES", Key: "", Default: "current_timestamp()", Extra: "on update current_timestamp()" }
        ];
        await assertSchema("users", expected);
    });

    it("applies 002_create_todos schema", async () => {
        const expected = [
            { Field: "id", Type: "int(11)", Null: "NO", Key: "PRI", Default: null, Extra: "auto_increment" },
            { Field: "slug", Type: "varchar(255)", Null: "NO", Key: "UNI", Default: null, Extra: "" },
            { Field: "title", Type: "varchar(255)", Null: "NO", Key: "", Default: null, Extra: "" },
            { Field: "created_at", Type: "timestamp", Null: "YES", Key: "", Default: "current_timestamp()", Extra: "" },
            { Field: "updated_at", Type: "timestamp", Null: "YES", Key: "", Default: "current_timestamp()", Extra: "on update current_timestamp()" }
        ];
        await assertSchema("todos", expected);
    });

    it("tracks applied migrations", async () => {
        const applied = await tenantStorage.run(tenantDbName, () =>
            query<{ name: string; applied_at: string }>("SELECT name, applied_at FROM migrations ORDER BY id", [])
        );
        expect(applied.rows.length).toBe(2);
        expect(applied.rows.map((r) => r.name)).toEqual(["001_create_users", "002_create_todos"]);
        applied.rows.forEach((r) => expect(r.applied_at).toBeDefined());
    });
});