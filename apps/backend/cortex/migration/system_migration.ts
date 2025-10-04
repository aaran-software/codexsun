// cortex/database/system_migration.ts
import { settings } from '../config/get-settings';
import { Connection } from '../db/connection';
import { getDbConfig } from '../config/db-config';

export async function runSystemMigration(): Promise<void> {
    // Initialize connection with database settings
    const config = getDbConfig();
    const conn = await Connection.initialize({
        host: settings.DB_HOST,
        port: settings.DB_PORT,
        database: settings.DB_NAME,
        user: settings.DB_USER,
        password: settings.DB_PASS,
        type: settings.DB_DRIVER,
        ssl: settings.DB_SSL,
    });

    let noDbClient = await conn.getClient('');

    // Check if master DB exists, create if not
    try {
        const dbCheck = await noDbClient.query(
            `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
            [settings.MASTER_DB]
        );
        if (dbCheck.rows.length === 0) {
            await noDbClient.query(`CREATE DATABASE IF NOT EXISTS \`${settings.MASTER_DB}\``);
            console.log(`Created master database: ${settings.MASTER_DB}`);
        }
    } finally {
        if (noDbClient.release) noDbClient.release();
        else if (noDbClient.end) await noDbClient.end();
    }

    // Check if tenants table exists in master DB, create if not
    const masterClient = await conn.getClient(settings.MASTER_DB);
    try {
        const tableCheck = await masterClient.query(
            `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
            [settings.MASTER_DB, 'tenants']
        );
        if (tableCheck.rows.length === 0) {
            await masterClient.query(`
                CREATE TABLE IF NOT EXISTS tenants (
                                                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                       tenant_id VARCHAR(255) NOT NULL UNIQUE,
                    database_name VARCHAR(255) NOT NULL UNIQUE,
                    host VARCHAR(255) NOT NULL,
                    port INT NOT NULL,
                    user VARCHAR(255) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    ssl TINYINT NOT NULL,
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
    const masterClientForTenant = await conn.getClient(settings.MASTER_DB);
    try {
        const tenantCheck = await masterClientForTenant.query(
            'SELECT tenant_id FROM tenants WHERE tenant_id = ?',
            ['default']
        );
        if (tenantCheck.rows.length === 0) {
            await masterClientForTenant.query(
                `INSERT INTO tenants (tenant_id, database_name, host, port, user, password, type, ssl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'default',
                    'codexsun_db',
                    settings.DB_HOST,
                    settings.DB_PORT,
                    settings.DB_USER,
                    settings.DB_PASS,
                    settings.DB_DRIVER,
                    settings.DB_SSL ? 1 : 0
                ]
            );
            console.log('Created default tenant entry in master database');
        }
    } finally {
        if (masterClientForTenant.release) masterClientForTenant.release();
        else if (masterClientForTenant.end) await masterClientForTenant.end();
    }

    // Check if tenant DB exists, create if not
    noDbClient = await conn.getClient('');
    try {
        const tenantDbCheck = await noDbClient.query(
            `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
            ['codexsun_db']
        );
        if (tenantDbCheck.rows.length === 0) {
            await noDbClient.query(`CREATE DATABASE IF NOT EXISTS \`codexsun_db\``);
            console.log('Created default tenant database: codexsun_db');
        }
    } finally {
        if (noDbClient.release) noDbClient.release();
        else if (noDbClient.end) await noDbClient.end();
    }

    // Check if migrations table exists in tenant DB, create if not
    const tenantClient = await conn.getClient('codexsun_db');
    try {
        const migrationsTableCheck = await tenantClient.query(
            `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
            ['codexsun_db', 'migrations']
        );
        if (migrationsTableCheck.rows.length === 0) {
            await tenantClient.query(`
                CREATE TABLE IF NOT EXISTS migrations (
                                                          id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                          migration_name VARCHAR(255) NOT NULL UNIQUE,
                    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
            `);
            console.log('Created migrations table in tenant database');
        }
    } finally {
        if (tenantClient.release) tenantClient.release();
        else if (tenantClient.end) await tenantClient.end();
    }

    // Close connection
    await conn.close();
}