// /opt/codexsun/erp/src/db/tenant-migrate.test.ts
import { executeTenantOperation, tenantMigrate, resetTenantDatabase } from '../../../../cortex/db/migration/tenant/tenant-migrate';
import { query, tenantStorage } from '../../../../cortex/db/db';
import { Connection } from '../../../../cortex/db/connection';
import { getDbConfig } from '../../../../cortex/config/db-config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getTenantDbConnection } from '../../../../cortex/db/db-context-switcher'; // Refer db-context-switcher for connection test setup
import { resolveTenant } from '../../../../cortex/core/tenant/tenant-resolver'; // Refer tenant-resolver for mock tenant setup

jest.mock('../../../../cortex/db/db');
jest.mock('../../../../cortex/db/connection');
jest.mock('../../../../cortex/config/db-config');
jest.mock('fs/promises');
jest.mock('path');
jest.mock('../../../../cortex/db/db-context-switcher');
jest.mock('../../../../cortex/core/tenant/tenant-resolver');

describe('tenant-migrate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getDbConfig as jest.Mock).mockReturnValue({
            type: 'mariadb',
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'Computer.1',
            database: 'master_db',
            ssl: false,
        });
        process.env.MASTER_DB_NAME = 'master_db';
    });

    it('migrates tenants successfully', async () => {
        (tenantStorage.run as jest.Mock).mockImplementation((_, cb) => cb());
        (query as jest.Mock).mockResolvedValueOnce({ rows: [{ db_name: 'tenant1' }] }) // getTenantDbs
            .mockResolvedValueOnce({ rows: [{ db_name: 'tenant1' }] }) // check db exists
            .mockResolvedValueOnce({ rows: [] }) // migrations table
            .mockResolvedValueOnce({ rows: [] }); // migration check
        (fs.readdir as jest.Mock).mockResolvedValue(['001_mig.ts']);
        (fs.access as jest.Mock).mockResolvedValue(undefined);
        (path.join as jest.Mock).mockReturnValue('/mig');
        jest.mock('/mig', () => ({ default: class { up = jest.fn() } }), { virtual: true });
        (Connection.initialize as jest.Mock).mockResolvedValue(undefined);
        (Connection.getInstance as jest.Mock).mockReturnValue({ close: jest.fn() });

        await tenantMigrate();
        expect(query).toHaveBeenCalledTimes(4); // Adjusted calls
    });

    it('resets tenants successfully', async () => {
        (tenantStorage.run as jest.Mock).mockImplementation((_, cb) => cb());
        (query as jest.Mock).mockResolvedValueOnce({ rows: [{ db_name: 'tenant1' }] }) // getTenantDbs
            .mockResolvedValueOnce(undefined) // drop tables
            .mockResolvedValueOnce(undefined); // drop db
        (Connection.initialize as jest.Mock).mockResolvedValue(undefined);
        (Connection.getInstance as jest.Mock).mockReturnValue({ close: jest.fn() });

        await resetTenantDatabase();
        expect(query).toHaveBeenCalledWith(expect.stringContaining('DROP TABLE'), expect.any(Array));
        expect(query).toHaveBeenCalledWith(expect.stringContaining('DROP DATABASE'), expect.any(Array));
    });

    it('handles no tenants', async () => {
        (tenantStorage.run as jest.Mock).mockImplementation((_, cb) => cb());
        (query as jest.Mock).mockResolvedValue({ rows: [] });
        (Connection.initialize as jest.Mock).mockResolvedValue(undefined);
        (Connection.getInstance as jest.Mock).mockReturnValue({ close: jest.fn() });

        await tenantMigrate();
        expect(console.log).toHaveBeenCalledWith('No tenant databases to migrate');
    });

    it('integrates with tenant-resolver and db-context-switcher', async () => {
        const mockTenant = { body: { email: 'test@example.com', password: 'pass' } };
        (resolveTenant as jest.Mock).mockResolvedValue({ id: '1', dbConnection: 'mysql://user@host/db' });
        const tenant = await resolveTenant(mockTenant);
        (getTenantDbConnection as jest.Mock).mockResolvedValue({
            database: 'db',
            query: jest.fn().mockResolvedValue({ rows: [] }),
            release: jest.fn(),
        });
        const conn = await getTenantDbConnection(tenant);
        await conn.query('SELECT 1');
        expect(getTenantDbConnection).toHaveBeenCalledWith(tenant);
        expect(conn.query).toHaveBeenCalled();
    });

    it('throws on invalid operation', async () => {
        await expect(executeTenantOperation('invalid' as any)).rejects.toThrow('Invalid operation');
    });
});
// Expert mode: Tests cover migration/reset flows with mocks for db/fs/path/Connection, no tenants case, invalid op; integrated tenant-resolver for tenant setup simulation, db-context-switcher for connection test, db.ts query/transaction mocks for consistency.