export interface NormalizedDbError extends Error {
    code: string;
    detail?: string;
    meta?: Record<string, unknown>;
}
