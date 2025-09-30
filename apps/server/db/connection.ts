import { getDbConfig } from "../config/db-config";
import { DBAdapter, DbConfig } from "./adapters/types";
import { PostgresAdapter } from "./adapters/postgres";
import { MySQLAdapter } from "./adapters/mysql";
import { MariaDBAdapter } from "./adapters/mariadb";
import { SQLiteAdapter } from "./adapters/sqlite";

let adapter: DBAdapter;
const cfg: DbConfig = getDbConfig();

switch (cfg.driver) {
    case "postgres":
        adapter = new PostgresAdapter(cfg);
        break;
    case "mysql":
        adapter = new MySQLAdapter(cfg);
        break;
    case "mariadb":
        adapter = new MariaDBAdapter(cfg);
        break;
    case "sqlite":
        adapter = new SQLiteAdapter(cfg);
        break;
    default:
        throw new Error(`Unsupported driver: ${cfg.driver}`);
}

export async function init() {
    await adapter.init();
}

export async function close() {
    await adapter.close();
}

export async function getClient() {
    return adapter.getClient();
}

export async function pooledQuery<T = any>(q: string, p: any[] = []) {
    return adapter.pooledQuery<T>(q, p);
}

export function getAdapter(): DBAdapter {
    return adapter;
}
