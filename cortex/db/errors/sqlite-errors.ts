import { NormalizedDbError } from "./types";

export function mapSQLiteError(err: any): NormalizedDbError {
    if (err?.code === "SQLITE_CONSTRAINT") {
        return Object.assign(new Error("Unique constraint violation"), {
            name: "DbUniqueViolation",
            code: "UNIQUE_VIOLATION",
            detail: err?.message,
        });
    }
    if (err?.code === "SQLITE_BUSY") {
        return Object.assign(new Error("Database timeout"), {
            name: "DbTimeout",
            code: "DB_TIMEOUT",
            detail: err?.message,
        });
    }
    return Object.assign(new Error("Database error"), {
        name: "DbError",
        code: "DB_ERROR",
        detail: err?.message ?? String(err),
    });
}
