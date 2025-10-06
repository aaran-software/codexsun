import { getDbConfig } from "../../../../cortex/config/db-config";
import { Connection } from "../../../../cortex/db/connection";
import { query } from "../../../../cortex/db/mdb";
import { masterMigrate } from "../../../../cortex/db/migration/master/master-migrate";
import { resetMasterDatabase } from "../../../../cortex/db/migration/master/master-migrate";

jest.setTimeout(30000);

const MASTER_DB_NAME = "master_db";

interface DescribeRow {
    Field: string;
    Type: string;
    Null: string;
    Key: string;
    Default: string | null;
    Extra: string;
}

interface FKRow {
    CONSTRAINT_NAME: string;
}

describe("Migration Comparison: Real DB Schema Assert", () => {
    let config: ReturnType<typeof getDbConfig>;

    beforeAll(async () => {
        process.env.MASTER_DB_NAME = MASTER_DB_NAME;
        process.env.DB_NAME = "";
        config = getDbConfig();
        await Connection.initialize({ ...config, database: '' }); // Fixed TS2322: use empty string
        // Clear migrations table to force re-apply
        await query(`DROP TABLE IF EXISTS migrations`, [], MASTER_DB_NAME).catch(() => {}); // Ignore if table doesn't exist
        await masterMigrate();
        await Connection.initialize({ ...config, database: MASTER_DB_NAME });
    });

    afterAll(async () => {
        await resetMasterDatabase();
        try {
            await Connection.getInstance().close();
        } catch {}
    });

    const assertSchema = async (table: string, expectedColumns: Array<{ Field: string; Type: string; Null: string; Key: string; Default: string | null; Extra: string }>) => {
        const descResult = await query<DescribeRow>(`DESCRIBE \`${table}\``, [], MASTER_DB_NAME);
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

    it("creates master DB with migrations table", async () => {
        const tablesResult = await query<{ [key: string]: string }>(`SHOW TABLES`, [], MASTER_DB_NAME);
        const tables = tablesResult.rows.map((row) => row[`Tables_in_${MASTER_DB_NAME}`]);
        expect(tables).toContain("migrations");
        const migDesc = await query<DescribeRow>("DESCRIBE migrations", [], MASTER_DB_NAME);
        expect(migDesc.rows.length).toBe(3);
        expect(migDesc.rows[0].Field).toBe("id"); // Fixed TS2571: typed as DescribeRow
        expect(migDesc.rows[1].Field).toBe("name");
        expect(migDesc.rows[2].Field).toBe("applied_at");
    });

    it("applies 001_create_tenants schema", async () => {
        const expected = [
            { Field: "id", Type: "int(11)", Null: "NO", Key: "PRI", Default: null, Extra: "auto_increment" },
            { Field: "tenant_id", Type: "varchar(255)", Null: "NO", Key: "UNI", Default: null, Extra: "" },
            { Field: "db_host", Type: "varchar(255)", Null: "NO", Key: "", Default: null, Extra: "" },
            { Field: "db_port", Type: "varchar(255)", Null: "NO", Key: "", Default: null, Extra: "" },
            { Field: "db_user", Type: "varchar(255)", Null: "NO", Key: "", Default: null, Extra: "" },
            { Field: "db_pass", Type: "varchar(255)", Null: "YES", Key: "", Default: null, Extra: "" },
            { Field: "db_name", Type: "varchar(255)", Null: "NO", Key: "", Default: null, Extra: "" },
            { Field: "db_ssl", Type: "varchar(255)", Null: "YES", Key: "", Default: null, Extra: "" },
            { Field: "created_at", Type: "timestamp", Null: "YES", Key: "", Default: "current_timestamp()", Extra: "" },
            { Field: "updated_at", Type: "timestamp", Null: "YES", Key: "", Default: "current_timestamp()", Extra: "on update current_timestamp()" }
        ];
        await assertSchema("tenants", expected);
    });

    it("applies 002_create_tenant_users schema w/ FK", async () => {
        const expected = [
            { Field: "id", Type: "int(11)", Null: "NO", Key: "PRI", Default: null, Extra: "auto_increment" },
            { Field: "email", Type: "varchar(255)", Null: "NO", Key: "UNI", Default: null, Extra: "" },
            { Field: "tenant_id", Type: "varchar(50)", Null: "NO", Key: "MUL", Default: null, Extra: "" },
            { Field: "created_at", Type: "timestamp", Null: "YES", Key: "", Default: "current_timestamp()", Extra: "" },
            { Field: "updated_at", Type: "timestamp", Null: "YES", Key: "", Default: "current_timestamp()", Extra: "on update current_timestamp()" }
        ];
        await assertSchema("tenant_users", expected);
        const fkResult = await query<FKRow>(`
            SELECT CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tenant_users' AND REFERENCED_TABLE_NAME = 'tenants'
        `, [MASTER_DB_NAME], '');
        expect(fkResult.rows[0]?.CONSTRAINT_NAME).toBeDefined(); // Fixed TS2339: typed as FKRow
    });

    it("tracks applied migrations", async () => {
        const applied = await query<{ name: string; applied_at: string }>("SELECT name, applied_at FROM migrations ORDER BY id", [], MASTER_DB_NAME);
        expect(applied.rows.length).toBe(2);
        expect(applied.rows.map((r) => r.name)).toEqual(["001_create_tenants", "002_create_tenant_users"]);
        applied.rows.forEach((r) => expect(r.applied_at).toBeDefined());
    });
});