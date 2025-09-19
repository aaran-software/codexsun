import * as fs from "fs/promises";
import * as path from "path";
import { init, close } from "./connection";
import { query, withTransaction } from "./db";
import { mapDbError} from "./errors";
import { getDbConfig } from "../config/db-config";

const ROOT = process.cwd();
const APPS_DIR = path.resolve(ROOT, "apps");
const MIR_DIR = "database/migrations";
const TABLE = "schema_migrations";

type Migration = { app: string; id: string; filepath: string; sql: string };

// --- CLI parsing ---
function parseCli(): { app?: string } {
    const args = process.argv.slice(2);
    let app: string | undefined;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--app" && args[i + 1]) {
            app = args[i + 1];
            i++;
        }
    }
    return { app };
}

function normalize(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function dirExists(p: string): Promise<boolean> {
    try {
        const st = await fs.stat(p);
        return st.isDirectory();
    } catch {
        return false;
    }
}

async function listAvailableApps(): Promise<string[]> {
    const entries = await fs.readdir(APPS_DIR, { withFileTypes: true }).catch(() => []);
    return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

async function resolveAppName(requested: string): Promise<string | null> {
    const apps = await listAvailableApps();
    if (apps.includes(requested)) return requested;
    const wanted = normalize(requested);
    for (const a of apps) if (normalize(a) === wanted) return a;
    return null;
}

async function listApps(target?: string): Promise<string[]> {
    if (target) {
        const resolved = await resolveAppName(target);
        if (!resolved) {
            const apps = await listAvailableApps();
            throw new Error(
                `App "${target}" not found under ${APPS_DIR}\n` +
                `Available apps: ${apps.length ? apps.join(", ") : "(none)"}`
            );
        }
        return [resolved];
    }
    return await listAvailableApps();
}

/** Portable CREATE TABLE for schema_migrations */
async function ensureMigrationsTable() {
    const { driver } = getDbConfig();
    let sql: string;
    switch (driver) {
        case "postgres":
            sql = `
                CREATE TABLE IF NOT EXISTS ${TABLE} (
                                                        app TEXT NOT NULL,
                                                        id  TEXT NOT NULL,
                                                        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    PRIMARY KEY (app, id)
                    )
            `;
            break;
        case "mysql":
        case "mariadb":
            sql = `
                CREATE TABLE IF NOT EXISTS ${TABLE} (
                                                        app VARCHAR(255) NOT NULL,
                    id  VARCHAR(255) NOT NULL,
                    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (app, id)
                    )
            `;
            break;
        case "sqlite":
            sql = `
                CREATE TABLE IF NOT EXISTS ${TABLE} (
                                                        app TEXT NOT NULL,
                                                        id  TEXT NOT NULL,
                                                        applied_at TEXT NOT NULL DEFAULT (datetime('now')),
                    PRIMARY KEY (app, id)
                    )
            `;
            break;
        default:
            throw new Error(`Unsupported driver: ${driver}`);
    }
    await query(sql);
}

async function readAppMigrations(app: string): Promise<Migration[]> {
    const dir = path.join(APPS_DIR, app, MIR_DIR);
    const exists = await dirExists(dir);
    if (!exists) return [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries
        .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".sql"))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    const out: Migration[] = [];
    for (const f of files) {
        const filepath = path.join(dir, f.name);
        const id = f.name.replace(/\.sql$/i, "");
        const sql = await fs.readFile(filepath, "utf8");
        out.push({ app, id, filepath, sql });
    }
    return out;
}

function getPlaceholders(driver: string): [string, string] {
    if (driver === "postgres") return ["$1", "$2"];
    return ["?", "?"];
}

async function appliedIdsForApp(app: string): Promise<Set<string>> {
    const { driver } = getDbConfig();
    const [ph] = getPlaceholders(driver);
    const { rows } = await query<{ id: string }>(
        `SELECT id FROM ${TABLE} WHERE app = ${ph} ORDER BY applied_at ASC`,
        [app]
    );
    return new Set(rows.map((r) => r.id));
}

async function applyMigration(m: Migration) {
    const { driver } = getDbConfig();
    const [ph1, ph2] = getPlaceholders(driver);

    await withTransaction(async (q) => {
        const statements =
            driver === "postgres"
                ? [m.sql]
                : m.sql.split(";").map((s) => s.trim()).filter(Boolean);

        for (const stmt of statements) {
            await q(stmt);
        }
        await q(
            `INSERT INTO ${TABLE} (app, id) VALUES (${ph1}, ${ph2})`,
            [m.app, m.id]
        );
    });
}

async function migrateApp(app: string): Promise<{ app: string; pending: number; applied: number }> {
    const mics = await readAppMigrations(app);
    if (mics.length === 0) {
        console.log(`ℹ️  [${app}] No migration files found in ${MIR_DIR}.`);
        return { app, pending: 0, applied: 0 };
    }
    const applied = await appliedIdsForApp(app);
    const pending = mics.filter((m) => !applied.has(m.id));
    if (pending.length === 0) {
        console.log(`✅ [${app}] Up-to-date (0 pending).`);
        return { app, pending: 0, applied: 0 };
    }

    console.log(`🚀 [${app}] Applying ${pending.length} migration(s):`);
    let appliedCount = 0;
    for (const m of pending) {
        const t0 = Date.now();
        process.stdout.write(`   • ${m.id} ... `);
        try {
            await applyMigration(m);
            console.log(`done (${Date.now() - t0}ms)`);
            appliedCount++;
        } catch (err) {
            const e = mapDbError(err);
            console.error(`\n💥 [${app}] Migration failed: ${m.id}`);
            console.error(`${e.code}: ${e.detail ?? e.message}`);
            throw err;
        }
    }
    return { app, pending: pending.length, applied: appliedCount };
}

async function main() {
    const { app: targetApp } = parseCli();
    console.log(`🔧 Apps root: ${APPS_DIR}`);
    if (targetApp) console.log(`🎯 Target app: ${targetApp}`);

    await init();
    await ensureMigrationsTable();

    const apps = await listApps(targetApp);
    if (apps.length === 0) {
        console.log("ℹ️  No apps found under", APPS_DIR);
        await close();
        return;
    }

    let totalPending = 0;
    let totalApplied = 0;

    for (const app of apps) {
        const { pending, applied } = await migrateApp(app);
        totalPending += pending;
        totalApplied += applied;
    }

    console.log(`\n📦 Summary: pending=${totalPending}, applied=${totalApplied}`);
    console.log("🎉 Migrations completed.");
    await close();
}

if (require.main === module) {
    main().catch(async (e) => {
        console.error("Unhandled migration error:", e);
        try {
            await close();
        } catch {}
        process.exit(1);
    });
}
