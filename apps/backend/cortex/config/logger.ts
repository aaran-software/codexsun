import { settings } from './get-settings';

interface QueryLog {
    sql: string;
    params: any[];
    db: string;
    duration?: number;
    error?: string;
}

interface TransactionLog {
    db: string;
    duration?: number;
    error?: string;
}

interface HealthCheckLog {
    database: string;
    duration?: number;
    error?: string;
}

/**
 * Logs query execution details when APP_DEBUG is true or metrics in production.
 * @param phase - 'start', 'end', or 'error' phase of query execution.
 * @param data - Query details including SQL, params, DB, duration, and error (if any).
 */
export function logQuery(phase: 'start' | 'end' | 'error', data: QueryLog): void {
    if (settings.APP_DEBUG) {
        console.debug(`Query ${phase}:`, data);
    }
    if (phase === 'end') {
        logMetrics('query_duration_ms', data.duration || 0, { db: data.db, query: data.sql.slice(0, 50) });
    } else if (phase === 'error') {
        logMetrics('query_error', 1, { db: data.db, query: data.sql.slice(0, 50) });
    }
}

/**
 * Logs transaction execution details when APP_DEBUG is true or metrics in production.
 * @param phase - 'start', 'end', or 'error' phase of transaction.
 * @param data - Transaction details including DB, duration, and error (if any).
 */
export function logTransaction(phase: 'start' | 'end' | 'error', data: TransactionLog): void {
    if (settings.APP_DEBUG) {
        console.debug(`Transaction ${phase}:`, data);
    }
    if (phase === 'end') {
        logMetrics('transaction_duration_ms', data.duration || 0, { db: data.db });
    } else if (phase === 'error') {
        logMetrics('transaction_error', 1, { db: data.db });
    }
}

/**
 * Logs health check details when APP_DEBUG is true or metrics in production.
 * @param phase - 'success' or 'error' phase of health check.
 * @param data - Health check details including database, duration, and error (if any).
 */
export function logHealthCheck(phase: 'success' | 'error', data: HealthCheckLog): void {
    if (settings.APP_DEBUG) {
        console.debug(`Health check ${phase}:`, data);
    }
    if (phase === 'success') {
        logMetrics('health_check_duration_ms', data.duration || 0, { database: data.database });
    } else if (phase === 'error') {
        logMetrics('health_check_error', 1, { database: data.database });
    }
}

/**
 * Logs metrics for production monitoring (e.g., Prometheus/CloudWatch).
 * @param metric - Metric name (e.g., query_duration_ms).
 * @param value - Metric value (e.g., duration in ms or error count).
 * @param labels - Additional metadata for the metric.
 */
function logMetrics(metric: string, value: number, labels: Record<string, string>): void {
    // Stub: Implement with external metrics service (e.g., Prometheus) in production
    if (settings.APP_DEBUG) {
        console.debug(`Metric: ${metric}`, { value, labels });
    }
}