// E:\Workspace\codexsun\apps\backend\cortex\database\migrations\system_migration.ts
import { BaseMigration } from './base-migration';
import { Connection } from '../connection';
import { getDbConfig } from '../../config/db-config';

const MASTER_DB = 'master_db';
const DEFAULT_TENANT_DB = 'codexsun_db';
const TENANT_1_DB = 'tenant_1_db';

export class SystemMigration extends BaseMigration {
    private conn: Connection;

    constructor() {
        super();
        this.conn = Connection.getInstance();
    }

    async up(): Promise<void> {
        const config = getDbConfig();

        // Create master database
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

        // Create tenants table
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

        // Create default tenant entry
        const masterClientForDefault = await this.conn.getClient(MASTER_DB);
        try {
            const tenantCheck = await masterClientForDefault.query(
                'SELECT tenant_id FROM tenants WHERE tenant_id = ?',
                ['default']
            );
            if (tenantCheck.rows.length === 0) {
                await masterClientForDefault.query(
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
            if (masterClientForDefault.release) masterClientForDefault.release();
            else if (masterClientForDefault.end) await masterClientForDefault.end();
        }

        // Create tenant_1 entry
        const masterClientForTenant1 = await this.conn.getClient(MASTER_DB);
        try {
            const tenantCheck = await masterClientForTenant1.query(
                'SELECT tenant_id FROM tenants WHERE tenant_id = ?',
                ['tenant_1']
            );
            if (tenantCheck.rows.length === 0) {
                await masterClientForTenant1.query(
                    `INSERT INTO tenants (tenant_id, database_name, db_host, db_port, db_user, db_pass, db_type, db_ssl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        'tenant_1',
                        TENANT_1_DB,
                        config.host,
                        config.port,
                        config.user,
                        config.password,
                        config.type,
                        config.ssl ? 1 : 0
                    ]
                );
                console.log('Created tenant_1 entry in master database');
            }
        } finally {
            if (masterClientForTenant1.release) masterClientForTenant1.release();
            else if (masterClientForTenant1.end) await masterClientForTenant1.end();
        }

        // Create default tenant database
        let noDbClientDefault = await this.conn.getClient('');
        try {
            const tenantDbCheck = await noDbClientDefault.query(
                `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
                [DEFAULT_TENANT_DB]
            );
            if (tenantDbCheck.rows.length === 0) {
                await noDbClientDefault.query(`CREATE DATABASE IF NOT EXISTS \`${DEFAULT_TENANT_DB}\``);
                console.log(`Created default tenant database: ${DEFAULT_TENANT_DB}`);
            }
        } finally {
            if (noDbClientDefault.release) noDbClientDefault.release();
            else if (noDbClientDefault.end) await noDbClientDefault.end();
        }

        // Create tenant_1 database
        let noDbClientTenant1 = await this.conn.getClient('');
        try {
            const tenantDbCheck = await noDbClientTenant1.query(
                `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
                [TENANT_1_DB]
            );
            if (tenantDbCheck.rows.length === 0) {
                await noDbClientTenant1.query(`CREATE DATABASE IF NOT EXISTS \`${TENANT_1_DB}\``);
                console.log(`Created tenant_1 database: ${TENANT_1_DB}`);
            }
        } finally {
            if (noDbClientTenant1.release) noDbClientTenant1.release();
            else if (noDbClientTenant1.end) await noDbClientTenant1.end();
        }

        // Create migrations table for tenant_1
        const tenantClient = await this.conn.getClient(TENANT_1_DB);
        try {
            await this.schema.create('migrations', (table) => {
                table.id();
                table.string('migration_name').unique();
                table.timestamps();
            });
            console.log('Created migrations table in tenant_1 database');
        } finally {
            if (tenantClient.release) tenantClient.release();
            else if (tenantClient.end) await tenantClient.end();
        }
    }

    async down(): Promise<void> {
        let noDbClient = await this.conn.getClient('');
        try {
            await noDbClient.query(`DROP DATABASE IF EXISTS \`${TENANT_1_DB}\``);
            console.log(`Dropped tenant_1 database: ${TENANT_1_DB}`);
            await noDbClient.query(`DROP DATABASE IF EXISTS \`${DEFAULT_TENANT_DB}\``);
            console.log(`Dropped default tenant database: ${DEFAULT_TENANT_DB}`);
        } finally {
            if (noDbClient.release) noDbClient.release();
            else if (noDbClient.end) await noDbClient.end();
        }

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

export default SystemMigration;