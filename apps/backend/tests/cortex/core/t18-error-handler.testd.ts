import { handleError } from '../../../cortex/core/error/error-handler';

describe('[18.] Error Handling', () => {
    test('[test 1] logs tenant-specific errors during resolution', async () => {
        const error = new Error('Email not associated with any tenant');
        const logger = jest.fn();
        await expect(handleError(error, 'tenant1', logger)).resolves.toBeUndefined();
        expect(logger).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tenant1', error: error.message }));
    });

    test('[test 2] handles errors without tenant context', async () => {
        const error = new Error('Generic error');
        const logger = jest.fn();
        await expect(handleError(error, undefined, logger)).resolves.toBeUndefined();
        expect(logger).toHaveBeenCalledWith(expect.objectContaining({ tenantId: undefined, error: error.message }));
    });
});