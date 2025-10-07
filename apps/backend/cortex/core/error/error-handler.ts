// /cortex/core/error/error-handler.ts
// Expert mode: Updated to use logError from logger.ts, supporting versioning and tenant context.

import { logError } from '../../config/logger';

export async function handleError(error: Error, tenantId?: string, version?: string): Promise<void> {
    const logEntry = {
        tenantId: tenantId || 'unknown',
        version: version || 'unknown',
        error: error.message,
    };
    logError('error', logEntry);
}