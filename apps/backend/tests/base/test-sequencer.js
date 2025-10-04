const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
    sort(tests) {
        const order = [
            't01-tenant-resolver.test.ts',
            't02-db-contex-switcher.test.ts',
            't03-auth-service.test.ts',
            't04-error-handler.test.ts',
            't05-user-service.test.ts',
        ];
        return tests.sort((a, b) => {
            const aIndex = order.indexOf(a.path.split('/').pop());
            const bIndex = order.indexOf(b.path.split('/').pop());
            return aIndex - bIndex;
        });
    }
}

module.exports = CustomSequencer;