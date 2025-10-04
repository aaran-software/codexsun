const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
    sort(tests) {
        const order = [
            'tests/core/t01-tenant-resolver.test.ts',
            'tests/core/t02-db-contex-switcher.test.ts',
            'tests/core/t03-auth-service.test.ts',
            'tests/core/t04-error-handler.test.ts',
            'tests/core/t05-user-service.test.ts',
            'tests/core/t06-inventory-service.test.ts',
            'tests/core/t07-login-controller.test.ts',
            'tests/core/t08-tenant-middleware.test.ts',
            'tests/core/t09-app.test.ts',
            'tests/core/t10-user-controller.test.ts',
            'tests/core/t11-inventory-controller.test.ts',
            'tests/core/t12-auth-middleware.test.ts',
            'tests/core/t13-app.test.ts',
            'tests/core/t14-rate-limiter.test.ts',
            'tests/core/t15-connection-cache.test.ts',
        ];
        return tests.sort((a, b) => {
            const aIndex = order.indexOf(a.path);
            const bIndex = order.indexOf(b.path);
            return aIndex - bIndex;
        });
    }
}

module.exports = CustomSequencer;