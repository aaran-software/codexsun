// cortex/database/system_migration.ts
import { BaseMigration } from './base-migration';
import { Connection } from '../db/connection';
import { getDbConfig } from '../config/db-config';
import { withTenantContext } from '../db/db';

const MASTER_DB = 'master_db';
const DEFAULT_TENANT_DB = 'codexsun_db';

export class SystemMigration extends BaseMigration {
    private conn: Connection;

    constructor() {
        super();
        this.conn = Connection.getInstance();
    }

    async up(): Promise<void> {
        const config = getDbConfig();

        // Check if master DB exists, create if not
        let noDbClient = await this.conn.getClient('');
        try {
            const dbCheck = await noDbClient.query(
                `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
                [MASTER_DB]
            );
            if (dbCheck.rows.length === 0) {
                await noDbClient.query(`CREATE DATABASE IF NOT EXISTS \`${MASTER_DB}\``);
                console.log(`Created master database: ${MASTER_DB}`);
            }
        } finally {
            if (noDbClient.release) noDbClient.release();
            else if (noDbClient.end) await noDbClient.end();
        }

        // Check if tenants table exists in master DB, create if not
        const masterClient = await this.conn.getClient(MASTER_DB);
        try {
            const tableCheck = await masterClient.query(
                `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
                [MASTER_DB, 'tenants']
            );
            if (tableCheck.rows.length === 0) {
                await masterClient.query(`
                    CREATE TABLE IF NOT EXISTS tenants (
                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                        tenant_id VARCHAR(255) NOT NULL UNIQUE,
                        database_name VARCHAR(255) NOT NULL UNIQUE,
                        db_host VARCHAR(255) NOT NULL,
                        db_port INT NOT NULL,
                        db_user VARCHAR(255) NOT NULL,
                        db_pass VARCHAR(255) NOT NULL,
                        db_type VARCHAR(50) NOT NULL,
                        db_ssl TINYINT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                console.log('Created tenants table in master database');
            }
        } finally {
            if (masterClient.release) masterClient.release();
            else if (masterClient.end) await masterClient.end();
        }

        // Create default tenant entry with full DB settings if not exists
        const masterClientForTenant = await this.conn.getClient(MASTER_DB);
        try {
            const tenantCheck = await masterClientForTenant.query(
                'SELECT tenant_id FROM tenants WHERE tenant_id = ?',
                ['default']
            );
            if (tenantCheck.rows.length === 0) {
                await masterClientForTenant.query(
                    `INSERT INTO tenants (tenant_id, database_name, db_host, db_port, db_user, db_pass, db_type, db_ssl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        'default',
                        DEFAULT_TENANT_DB,
                        config.host,
                        config.port,
                        config.user,
                        config.password,
                        config.type,
                        config.ssl ? 1 : 0
                    ]
                );
                console.log('Created default tenant entry in master database');
            }
        } finally {
            if (masterClientForTenant.release) masterClientForTenant.release();
            else if (masterClientForTenant.end) await masterClientForTenant.end();
        }

        // Check if tenant DB exists, create if not
        noDbClient = await this.conn.getClient('');
        try {
            const tenantDbCheck = await noDbClient.query(
                `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
                [DEFAULT_TENANT_DB]
            );
            if (tenantDbCheck.rows.length === 0) {
                await noDbClient.query(`CREATE DATABASE IF NOT EXISTS \`${DEFAULT_TENANT_DB}\``);
                console.log(`Created default tenant database: ${DEFAULT_TENANT_DB}`);
            }
        } finally {
            if (noDbClient.release) noDbClient.release();
            else if (noDbClient.end) await noDbClient.end();
        }

        // Check if migrations table exists in tenant DB, create if not
        await withTenantContext('default', async () => {
            await this.schema.create('migrations', (table) => {
                table.id();
                table.string('migration_name').unique();
                table.timestamps();
            });
            console.log('Created migrations table in tenant database');
        });
    }

    async down(): Promise<void> {
        // Drop tenant database
        let noDbClient = await this.conn.getClient('');
        try {
            await noDbClient.query(`DROP DATABASE IF EXISTS \`${DEFAULT_TENANT_DB}\``);
            console.log(`Dropped default tenant database: ${DEFAULT_TENANT_DB}`);
        } finally {
            if (noDbClient.release) noDbClient.release();
            else if (noDbClient.end) await noDbClient.end();
        }

        // Drop tenants table and master database
        const masterClient = await this.conn.getClient(MASTER_DB);
        try {
            await masterClient.query(`DROP TABLE IF EXISTS tenants`);
            console.log('Dropped tenants table in master database');
        } finally {
            if (masterClient.release) masterClient.release();
            else if (masterClient.end) await masterClient.end();
        }

        noDbClient = await this.conn.getClient('');
        try {
            await noDbClient.query(`DROP DATABASE IF EXISTS \`${MASTER_DB}\``);
            console.log(`Dropped master database: ${MASTER_DB}`);
        } finally {
            if (noDbClient.release) noDbClient.release();
            else if (noDbClient.end) await noDbClient.end();
        }
    }
}