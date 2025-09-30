import {Connection} from "../../cortex/db/connection";
import {query, withTransaction, healthCheck} from "../../cortex/db/db";
import {DBAdapter, DbConfig, AnyDbClient, QueryResult} from "../../cortex/db/adapters/types";
import {withTenantContext, getTenantId} from "../../cortex/db/tenant";

let connection: Connection;

beforeAll(async () => {
    connection = new Connection();
    await connection.init();
});

afterAll(async () => {
    await connection.close();
});

describe("Database Abstraction Layer", () => {
    test("Basic Query Execution", async () => {
        const result = await query("SELECT 1 AS value");
        expect(result.rows).toBeDefined();
        expect(result.rows.length).toBe(1);
        expect(result.rows[0].value).toBe(1);
    });

});
