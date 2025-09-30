import { NormalizedDbError } from "./types";

export function mapMySQLError(err: any): NormalizedDbError {
    if (err?.code === "ER_DUP_ENTRY") {
        return Object.assign(new Error("Unique constraint violation"), {
            name: "DbUniqueViolation",
            code: "UNIQUE_VIOLATION",
            detail: err?.sqlMessage,
            meta: { index: err?.index },
        });
    }
    if (err?.code === "PROTOCOL_CONNECTION_LOST" || err?.fatal) {
        return Object.assign(new Error("Database unavailable"), {
            name: "DbUnavailable",
            code: "DB_UNAVAILABLE",
            detail: err?.message,
        });
    }
    if (err?.code === "ETIMEDOUT" || err?.message?.includes("timeout")) {
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
