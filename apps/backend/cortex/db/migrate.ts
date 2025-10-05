import knex from 'knex';
import winston from 'winston';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Logger configuration for production-grade logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/migration.log' }),
        new winston.transports.Console()
    ],
});

// Interface for Knex configuration
interface KnexConfig {
    client: string;
    connection: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    };
    pool: { min: number; max: number };
    migrations: {
        directory: string;
        tableName: string;
    };
}

// Master database configuration
const MASTER_DB_CONFIG: KnexConfig = {
        client: process.env.MASTER_DB_DRIVER || 'pg',
    connection: {
        host: process.env.MASTER_DB_HOST || 'localhost',
        port: parseInt(process.env.MASTER_DB_PORT || '5432', 10),
        user: process.env.MASTER_DB_USER || 'postgres',
        password: process.env.MASTER_DB_PASSWORD || '',
        database: process.env.MASTER_DB_NAME || 'erp_master',
    },
    pool: { min: 2, max: 10 },
    migrations: {
        directory: path.join(__dirname, '../migrations/master'),
        tableName: 'knex_migrations',
    },
};

// Tenant database configuration (dynamic based on tenantId)
const getTenantDbConfig = (tenantId: string): KnexConfig => ({
    client: process.env.DB_DRIVER || 'pg',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: `${process.env.DB_PREFIX || 'erp_tenant_'}${tenantId}`,
    },
    pool: { min: 2, max: 10 },
    migrations: {
        directory: path.join(__dirname, '../migrations/tenant'),
        tableName: 'knex_migrations',
    },
});

// Main migration function
export async function migrate(tenantId: string = 'default'): Promise<void> {
    let masterKnex: knex.Knex | undefined;
    let tenantKnex: knex.Knex | undefined;

    try {
        logger.info(`Starting migration process for tenant: ${tenantId}`);

        // Initialize master DB connection
        masterKnex = knex(MASTER_DB_CONFIG);
        logger.info('Connected to master database');

        // Check if tenants table exists
        const tenantsTableExists: boolean = await masterKnex.schema.hasTable('tenants');
        if (!tenantsTableExists) {
            logger.info('First-time setup: Running master migrations...');
            await masterKnex.migrate.latest();
            logger.info('Master database migrations completed');
        } else {
            logger.info('Master database already initialized, skipping master migrations');
        }

        // Initialize tenant DB connection
        tenantKnex = knex(getTenantDbConfig(tenantId));
        logger.info(`Connected to tenant database: ${tenantId}`);

        // Run tenant migrations
        await tenantKnex.migrate.latest();
        logger.info(`Tenant migrations completed for ${tenantId}`);

    } catch (error: any) {
        logger.error(`Migration failed for tenant ${tenantId}: ${error.message}`, { stack: error.stack });
        throw new Error(`Migration failed: ${error.message}`);
    } finally {
        // Clean up connections
        if (masterKnex) {
            await masterKnex.destroy();
            logger.info('Master database connection closed');
        }
        if (tenantKnex) {
            await tenantKnex.destroy();
            logger.info(`Tenant database connection closed for ${tenantId}`);
        }
    }
}

// CLI support
if (require.main === module) {
    const tenantId: string = process.argv[2]?.split('=')[1] || 'default';
    migrate(tenantId)
        .then(() => {
            logger.info('Migration process completed successfully');
            process.exit(0);
        })
        .catch((err: Error) => {
            logger.error(`Migration process failed: ${err.message}`);
            process.exit(1);
        });
}