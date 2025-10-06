const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
    sort(tests) {
        const order = [

            'tests/cortex/config/t01-get-settings.test.ts',
            'tests/cortex/config/t02-db-config.test.ts',
            'tests/cortex/db/t03-connection.test.ts',
            'tests/cortex/db/t04-db.test.ts',
            'tests/cortex/db/adapters/t05-postgres.test.ts',
            'tests/cortex/db/adapters/t06-mysql.test.ts',
            'tests/cortex/db/adapters/t07-mariadb.test.ts',
            'tests/cortex/db/adapters/t08-sqlite.test.ts',



            // 'tests/core/t02-db-contex-switcher.test.ts',
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
            return aIndex - bIndex;
        });
    }
}

module.exports = CustomSequencer;