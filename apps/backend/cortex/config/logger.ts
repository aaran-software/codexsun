import { getSettings } from './get-settings';

interface QueryLog { sql: string; params: any[]; db: string; duration?: number; error?: string; }
interface TransactionLog { db: string; duration?: number; error?: string; }
interface HealthCheckLog { database: string; duration?: number; error?: string; }
interface ConnectionLog { db: string; connectionString: string; duration?: number; error?: string; }

export function logQuery(phase: 'start' | 'end' | 'error', data: QueryLog): void {
    const settings = getSettings();
    if (settings.APP_DEBUG || process.env.NODE_ENV === 'production') { // Log in prod too
        console.debug(`Query ${phase}:`, data);
    }
    if (phase === 'end') logMetrics('query_duration_ms', data.duration || 0, { db: data.db });
    else if (phase === 'error') logMetrics('query_error', 1, { db: data.db });
}

export function logTransaction(phase: 'start' | 'end' | 'error', data: TransactionLog): void {
    const settings = getSettings();
    if (settings.APP_DEBUG || process.env.NODE_ENV === 'production') {
        console.debug(`Transaction ${phase}:`, data);
    }
    if (phase === 'end') logMetrics('transaction_duration_ms', data.duration || 0, { db: data.db });
    else if (phase === 'error') logMetrics('transaction_error', 1, { db: data.db });
}

export function logHealthCheck(phase: 'success' | 'error', data: HealthCheckLog): void {
    const settings = getSettings();
    if (settings.APP_DEBUG || process.env.NODE_ENV === 'production') {
        console.debug(`Health check ${phase}:`, data);
    }
    if (phase === 'success') logMetrics('health_check_duration_ms', data.duration || 0, { database: data.database });
    else if (phase === 'error') logMetrics('health_check_error', 1, { database: data.database });
}

export function logConnection(phase: 'start' | 'success' | 'error', data: ConnectionLog): void {
    const settings = getSettings();
    if (settings.APP_DEBUG || process.env.NODE_ENV === 'production') {
        console.debug(`Connection ${phase}:`, data);
    }
    if (phase === 'success') logMetrics('connection_duration_ms', data.duration || 0, { db: data.db });
    else if (phase === 'error') logMetrics('connection_error', 1, { db: data.db });
}

function logMetrics(metric: string, value: number, labels: Record<string, string>): void {
    // In prod, integrate with Prometheus/CloudWatch; stub for now
    console.info(`METRIC: ${metric} ${value} ${JSON.stringify(labels)}`);
}