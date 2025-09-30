import { NormalizedDbError } from "./types";

export function mapMariaDBError(err: any): NormalizedDbError {
    if (err?.errno === 1062) {
        return Object.assign(new Error("Unique constraint violation"), {
            name: "DbUniqueViolation",
            code: "UNIQUE_VIOLATION",
            detail: err?.sqlMessage,
            meta: { index: err?.index },
        });
    }
    if (err?.code === "ER_GET_CONNECTION_TIMEOUT") {
        return Object.assign(new Error("Database timeout"), {
            name: "DbTimeout",
            code: "DB_TIMEOUT",
            detail: err?.message,
        });
    }
    if (err?.code === "ER_CON_COUNT_ERROR" || err?.fatal) {
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
