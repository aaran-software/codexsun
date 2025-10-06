const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
    sort(tests) {
        const order = [
            'tests/cortex/config/t01-get-settings.test.ts',
            'tests/cortex/config/t02-db-config.test.ts',
            'tests/cortex/config/t03-logger.test.ts',
            'tests/cortex/db/t04-connection.test.ts',
            'tests/cortex/db/t05-db.test.ts',
            'tests/cortex/db/adapters/t06-mariadb.test.ts',
            'tests/cortex/db/adapters/t07-postgres.test.ts',
            'tests/cortex/db/adapters/t08-mysql.test.ts',
            'tests/cortex/db/adapters/t09-sqlite.test.ts',
            'tests/cortex/db/t10-tenant-resolver.test.ts',
            'tests/cortex/db/t11-db-integration.test.ts',
            'tests/cortex/db/t12-db-context-switcher.test.ts',
            'tests/cortex/db/migration/t13-migration-comparison.test.ts',
            'tests/cortex/db/migration/t14-seeder-comparision.test.ts',
            'tests/cortex/db/migration/t15-persistent-setup.test.ts',

            // Commented tests for future implementation
            // 'tests/core/t03-auth-service.test.ts',
            // 'tests/core/t04-error-handler.test.ts',
            // 'tests/core/t05-user-service.test.ts',
            // 'tests/core/t06-inventory-service.test.ts',
            // 'tests/core/t07-login-controller.test.ts',
            // 'tests/core/t08-tenant-middleware.test.ts',
            // 'tests/core/t09-app.test.ts',
            // 'tests/core/t10-user-controller.test.ts',
            // 'tests/core/t11-inventory-controller.test.ts',
            // 'tests/core/t12-auth-middleware.test.ts',
            // 'tests/core/t13-app.test.ts',
            // 'tests/core/t14-rate-limiter.test.ts',
        ];
        return tests.sort((a, b) => {
            const aIndex = order.indexOf(a.path);
            const bIndex = order.indexOf(b.path);
            // Prioritize tests in the order array; unlisted tests go to the end
            if (aIndex === -1 && bIndex === -1) return a.path.localeCompare(b.path);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
    }
}

module.exports = CustomSequencer;