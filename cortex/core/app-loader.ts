// cortex/core/app-loader.ts

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { Application } from "./application";

export class AppLoader {
    // ---------------------------------------------------------------------------
    // Scan for *.provider.ts under apps/*/code
    // ---------------------------------------------------------------------------
    static async scanProviders(rootDir: string): Promise<string[]> {
        const results: string[] = [];

        function walk(dir: string) {
            for (const file of fs.readdirSync(dir)) {
                const full = path.join(dir, file);
                const stat = fs.statSync(full);

                if (stat.isDirectory()) {
                    walk(full);
                } else if (
                    file.endsWith(".provider.ts") || // TS source
                    file.endsWith(".provider.js")    // compiled JS
                ) {
                    results.push(full);
                }
            }
        }

        walk(rootDir);
        return results;
    }

    // ---------------------------------------------------------------------------
    // Load providers dynamically
    // ---------------------------------------------------------------------------
    static async loadProviders(app: Application, appsRoot: string) {
        const files = await this.scanProviders(appsRoot);

        if (files.length === 0) {
            app.logger.warn("[AppLoader] No providers found.");
            return;
        }

        for (const file of files) {
            try {
                app.logger.info(`[AppLoader] Loading provider file: ${file}`);
                const mod = await import(pathToFileURL(file).href);

                // Default export or first exported class/function
                const ProviderClass =
                    mod.default ||
                    Object.values(mod).find((exp) => typeof exp === "function");

                if (!ProviderClass) {
                    app.logger.warn(
                        `[AppLoader] No provider class exported in ${file}`
                    );
                    continue;
                }

                const provider = new (ProviderClass as any)();

                // ✅ Call register
                if (typeof provider.register === "function") {
                    await provider.register(app);
                    app.logger.info(
                        `[AppLoader] Provider registered: ${provider.name || file}`
                    );
                }

                // ✅ Call boot if present
                if (typeof provider.boot === "function") {
                    await provider.boot(app);
                    app.logger.info(
                        `[AppLoader] Provider boot complete: ${provider.name || file}`
                    );
                }

                // ✅ Track provider for /info endpoint
                app.registerProvider(provider.name || path.basename(file));
            } catch (err) {
                app.logger.error(
                    `[AppLoader] Failed to load provider from ${file}`,
                    err
                );
            }
        }
    }
}
