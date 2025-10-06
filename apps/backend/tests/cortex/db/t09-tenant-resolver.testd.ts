import { resolveTenant } from "../../../cortex/core/tenant/tenant-resolver";
import { query } from "../../../cortex/db/db";
import { getDbConfig } from "../../../cortex/config/db-config";
import { tenantStorage } from "../../../cortex/db/db";

jest.mock("../../../cortex/db/db");
jest.mock("../../../cortex/config/db-config");

describe("[1.] resolveTenant", () => {
    let mockConfig;

    beforeEach(() => {
        mockConfig = { type: "mariadb" };
        (getDbConfig as jest.Mock).mockReturnValue(mockConfig);
        (query as jest.Mock).mockResolvedValue({ rows: [] });
        jest.clearAllMocks();
    });

    it("[test 1] throws on missing email", async () => {
        await expect(resolveTenant({ body: { email: "", password: "pass" } })).rejects.toThrow("Valid email is required");
    });

    it("[test 2] throws if no user found", async () => {
        (query as jest.Mock).mockResolvedValueOnce({ rows: [] });
        await expect(resolveTenant({ body: { email: "test@email.com", password: "pass" } })).rejects.toThrow("No tenant associated");
    });

    it("[test 3] throws if multiple users found", async () => {
        (query as jest.Mock).mockResolvedValueOnce({ rows: [{ tenantId: "1" }, { tenantId: "2" }] });
        await expect(resolveTenant({ body: { email: "test@email.com", password: "pass" } })).rejects.toThrow("Multiple tenants found");
    });

    it("[test 4] throws if no tenant found", async () => {
        (query as jest.Mock).mockResolvedValueOnce({ rows: [{ tenantId: "1" }] }).mockResolvedValueOnce({ rows: [] });
        await expect(resolveTenant({ body: { email: "test@email.com", password: "pass" } })).rejects.toThrow("Tenant not found");
    });

    it("[test 5] throws on incomplete tenant config", async () => {
        (query as jest.Mock).mockResolvedValueOnce({ rows: [{ tenantId: "1" }] }).mockResolvedValueOnce({ rows: [{ tenant_id: "1", db_host: null, db_port: "3306", db_user: "user", db_name: "db", db_ssl: "false" }] });
        await expect(resolveTenant({ body: { email: "test@email.com", password: "pass" } })).rejects.toThrow("Incomplete tenant configuration");
    });

    it("[test 6] resolves tenant and builds connection string without pass", async () => {
        (query as jest.Mock).mockResolvedValueOnce({ rows: [{ tenantId: "1" }] }).mockResolvedValueOnce({ rows: [{ tenant_id: "1", db_host: "host", db_port: "3306", db_user: "user", db_pass: null, db_name: "db", db_ssl: "false" }] });
        const tenant = await resolveTenant({ body: { email: "test@email.com", password: "pass" } });
        expect(tenant).toEqual({ id: "1", dbConnection: "mariadb://user@host:3306/db" });
        expect(tenantStorage.enterWith).toHaveBeenCalledWith("db");
    });

    it("[test 7] resolves tenant with pass and ssl", async () => {
        (query as jest.Mock).mockResolvedValueOnce({ rows: [{ tenantId: "1" }] }).mockResolvedValueOnce({ rows: [{ tenant_id: "1", db_host: "host", db_port: "3306", db_user: "user", db_pass: "p@ss", db_name: "db", db_ssl: "true" }] });
        const tenant = await resolveTenant({ body: { email: "test@email.com", password: "pass" } });
        expect(tenant.dbConnection).toContain("%40ss"); // encoded
        expect(tenant.dbConnection).toContain("?ssl=true");
        expect(tenantStorage.enterWith).toHaveBeenCalledWith("db");
    });

    it("[test 8] handles resolution error", async () => {
        (query as jest.Mock).mockRejectedValue(new Error("query fail"));
        await expect(resolveTenant({ body: { email: "test@email.com", password: "pass" } })).rejects.toThrow("Tenant resolution failed for email test@email.com: query fail");
    });
});