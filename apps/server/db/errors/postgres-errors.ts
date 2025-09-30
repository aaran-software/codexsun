import { NormalizedDbError } from "./types";

export function mapPostgresError(err: any): NormalizedDbError {
    if (err?.code === "23505") {
        return Object.assign(new Error("Unique constraint violation"), {
            name: "DbUniqueViolation",
            code: "UNIQUE_VIOLATION",
            detail: err?.detail,
            meta: { schema: err?.schema, table: err?.table, constraint: err?.constraint },
        });
    }
    if (err?.code === "ETIMEDOUT" || err?.message?.includes("timeout")) {
        return Object.assign(new Error("Database timeout"), {
            name: "DbTimeout",
            code: "DB_TIMEOUT",
            detail: err?.message,
        });
    }
    if (err?.code === "ECONNREFUSED") {
        return Object.assign(new Error("Database unavailable"), {
            name: "DbUnavailable",
            code: "DB_UNAVAILABLE",
            detail: err?.message,
        });
    }
    return Object.assign(new Error("Database error"), {
        name: "DbError",
        code: "DB_ERROR",
        detail: err?.message ?? String(err),
    });
}
