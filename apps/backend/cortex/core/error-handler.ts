export async function handleError(error: Error, tenantId?: string, logger: (log: { tenantId?: string; error: string }) => void = jest.fn()): Promise<void> {
    const logEntry = {
        tenantId,
        error: error.message,
    };
    logger(logEntry);
}