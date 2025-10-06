import { getDbConfig } from "../../../../cortex/config/db-config";
import { Connection } from "../../../../cortex/db/connection";
import { query } from "../../../../cortex/db/mdb";
import { masterMigrate } from "../../../../cortex/db/migration/master/master-migrate";
import { resetMasterDatabase } from "../../../../cortex/db/migration/master/master-migrate"; // Assume export added if needed

jest.setTimeout(30000);

const MASTER_DB_NAME = "test_migration_comparison_db";

describe("Migration Comparison: Real DB Schema Assert", () => {
    beforeAll(async () => {
        process.env.MASTER_DB_NAME = MASTER_DB_NAME;
        process.env.DB_NAME = ""; // Masterless init
        const config = getDbConfig();
        await Connection.initialize({ ...config, database: undefined });
        await masterMigrate(); // Runs create DB + migrations
    });

    afterAll(async () => {
        await resetMasterDatabase(); // Drops tables/DB
        await Connection.getInstance().close();
    });

    const assertSchema = async (table: string, expectedColumns: Array<{ Field: string; Type: string; Null: string; Key: string; Default: string | null; Extra: string }>) => {
        const descResult = await query(`DESCRIBE \`${table}\``);
        const actual = descResult.rows.map((row: any) => ({
            Field: row.Field,
            Type: row.Type,
            Null: row.Null,
            Key: row.Key,
            Default: row.Default || null,
            Extra: row.Extra || ""
        }));
        expect(actual).toEqual(expectedColumns);
    };

    it("creates master DB with migrations table", async () => {
        const tablesResult = await query(`SHOW TABLES`);
        const tables = tablesResult.rows.map((row: any) => row[`Tables_in_${MASTER_DB_NAME}`]);
        expect(tables).toContain("migrations");
        const migDesc = await query("DESCRIBE migrations");
        expect(migDesc.rows.length).toBe(3); // id, name, applied_at
        expect(migDesc.rows[0].Field).toBe("id");
        expect(migDesc.rows[1].Field).toBe("name");
        expect(migDesc.rows[2].Field).toBe("applied_at");
    });

    it("applies 001_create_tenants schema", async () => {
        const expected = [
            { Field: "id", Type: "int", Null: "NO", Key: "PRI", Default: null, Extra: "auto_increment" },
            { Field: "tenant_id", Type: "varchar(255)", Null: "NO", Key: "UNI", Default: null, Extra: "" },
            { Field: "db_host", Type: "varchar(255)", Null: "NO", Key: "", Default: null, Extra: "" },
            { Field: "db_port", Type: "varchar(255)", Null: "NO", Key: "", Default: null, Extra: "" },
            { Field: "db_user", Type: "varchar(255)", Null: "NO", Key: "", Default: null, Extra: "" },
            { Field: "db_pass", Type: "varchar(255)", Null: "YES", Key: "", Default: null, Extra: "" },
            { Field: "db_name", Type: "varchar(255)", Null: "NO", Key: "", Default: null, Extra: "" },
            { Field: "db_ssl", Type: "varchar(255)", Null: "YES", Key: "", Default: null, Extra: "" },
            { Field: "created_at", Type: "timestamp", Null: "NO", Key: "", Default: "CURRENT_TIMESTAMP", Extra: "" },
            { Field: "updated_at", Type: "timestamp", Null: "NO", Key: "", Default: "CURRENT_TIMESTAMP", Extra: "on update CURRENT_TIMESTAMP" }
        ];
        await assertSchema("tenants", expected);
    });

    it("applies 002_create_tenant_users schema w/ FK", async () => {
        const expected = [
            { Field: "id", Type: "int", Null: "NO", Key: "PRI", Default: null, Extra: "auto_increment" },
            { Field: "email", Type: "varchar(255)", Null: "NO", Key: "UNI", Default: null, Extra: "" },
            { Field: "tenant_id", Type: "varchar(50)", Null: "NO", Key: "MUL", Default: null, Extra: "" }, // MUL for FK
            { Field: "created_at", Type: "timestamp", Null: "NO", Key: "", Default: "CURRENT_TIMESTAMP", Extra: "" },
            { Field: "updated_at", Type: "timestamp", Null: "NO", Key: "", Default: "CURRENT_TIMESTAMP", Extra: "on update CURRENT_TIMESTAMP" }
        ];
        await assertSchema("tenant_users", expected);
        // Assert FK constraint
        const fkResult = await query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tenant_users' AND REFERENCED_TABLE_NAME = 'tenants'
        `, [MASTER_DB_NAME]);
        expect(fkResult.rows[0]?.CONSTRAINT_NAME).toBeDefined(); // FK exists
    });

    it("tracks applied migrations", async () => {
        const applied = await query("SELECT name, applied_at FROM migrations ORDER BY id");
        expect(applied.rows.length).toBe(2);
        expect(applied.rows.map((r: any) => r.name)).toEqual(["001_create_tenants", "002_create_tenant_users"]);
        applied.rows.forEach((r: any) => expect(r.applied_at).toBeDefined());
    });
});