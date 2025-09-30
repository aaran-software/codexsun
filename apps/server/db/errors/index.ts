import { mapPostgresError } from "./postgres-errors";
import { mapMySQLError } from "./mysql-errors";
import { mapMariaDBError } from "./mariadb-errors";
import { mapSQLiteError } from "./sqlite-errors";
import { NormalizedDbError } from "./types";
import { getDbConfig } from "../../config/db-config";

export function mapDbError(err: any): NormalizedDbError {
    const driver = getDbConfig().driver;
    switch (driver) {
        case "postgres":
            return mapPostgresError(err);
        case "mysql":
            return mapMySQLError(err);
        case "mariadb":
            return mapMariaDBError(err);
        case "sqlite":
            return mapSQLiteError(err);
        default:
            return Object.assign(new Error("Database error"), {
                name: "DbError",
                code: "DB_ERROR",
                detail: err?.message ?? String(err),
            });
    }
}

export type { NormalizedDbError } from "./types";
