// cortex/main.ts — safe, configurable app + core route loader (ESM)

import { existsSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import type { RouteRegistery } from "./http/route_registery"; // adjust if your path differs
import { aiRoutes } from "../apps/ai/src/aiRoutes";

// Built-in routes & DB init are centralized here now
import * as welcome from "./http/routes/welcome";
import * as health from "./http/routes/health";
import { initDb } from "./database/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseList(v?: string): string[] {
    return v ? v.split(/[;]/).map((s) => s.trim()).filter(Boolean) : [];
}

function candidateDirs(): string[] {
    // Highest priority: env
    const fromEnv = parseList(process.env.APPS_DIR || process.env.APPS_DIRS);
    if (fromEnv.length) return fromEnv.map((p) => path.resolve(process.cwd(), p));
    // Defaults we’ll try in order; only scan existing ones
    return [
        path.resolve(process.cwd(), "apps"),
        path.resolve(process.cwd(), "cortex/apps"),
        path.resolve(__dirname, "apps"),
    ];
}

async function registerDynamicApps(registry: RouteRegistery) {
    const dirs = candidateDirs();
    let registered = 0;

    for (const dir of dirs) {
        if (!existsSync(dir)) continue;

        const entries = readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory());
        for (const entry of entries) {
            const appDir = path.join(dir, entry.name);

            // Look for app module
            const candidates = [
                path.join(appDir, "app.ts"),
                path.join(appDir, "app/index.ts"),
                path.join(appDir, "app.js"),
                path.join(appDir, "app/index.js"),
            ];
            const appPath = candidates.find((p) => existsSync(p));
            if (!appPath) {
                console.warn(`⚠️ Skipping ${entry.name}: no app.ts found in ${appDir}`);
                continue;
            }

            try {
                const mod = await import(pathToFileURL(appPath).href);
                const fn = (mod as any).registerApp ?? (mod as any).default?.registerApp;
                if (typeof fn === "function") {
                    await fn(registry);
                    registered++;
                    console.log(
                        `✅ Registered app: ${entry.name} (${path.relative(process.cwd(), appPath)})`,
                    );
                } else {
                    console.warn(`⚠️ ${entry.name} has no export registerApp(registry) at ${appPath}`);
                }
            } catch (err) {
                console.error(`⚠️ Failed to load app ${entry.name} from ${appPath}`, err);
            }
        }
    }

    if (!registered) {
        console.warn(
            "ℹ️ No apps registered. Set APPS_DIR (or APPS_DIRS for multiple, comma/semicolon-separated) to your apps root.",
        );
    }
}

/**
 * Initialize the master DB and register ALL routes (built-in + dynamic apps)
 */
export async function registerAppsAndRoutes(registry: RouteRegistery) {
    // 1) Initialize master DB (moved from index.ts)
    // await initDb();
    // console.log("✅ Master DB initialized and core schema ready");

    // 2) Register built-in routes (moved from index.ts)
    registry.addProvider(welcome.routes);
    registry.addProvider(health.routes);
    registry.addProvider(aiRoutes);

    // 3) Discover and register dynamic apps
    await registerDynamicApps(registry);
}
