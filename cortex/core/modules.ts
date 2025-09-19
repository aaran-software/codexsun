// cortex/core/modules.ts

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { Application } from "./application";

export interface Module {
    name: string;
    init?(app: Application): Promise<void> | void;
    start?(app: Application): Promise<void> | void;
    stop?(app: Application): Promise<void> | void;
}

export class ModuleManager {
    private app: Application;
    private modules: Module[] = [];

    constructor(app: Application) {
        this.app = app;
    }

    async init(appsRoot: string = path.resolve(process.cwd(), "apps")) {
        const dirs = fs
            .readdirSync(appsRoot, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);

        for (const dir of dirs) {
            const entryPath = path.join(appsRoot, dir, "app.ts");

            if (fs.existsSync(entryPath)) {
                // ✅ Convert Windows path to file:// URL
                const fileUrl = pathToFileURL(entryPath).href;

                const mod: { default: Module } = await import(fileUrl);
                if (mod?.default) {
                    this.register(mod.default);
                    await mod.default.init?.(this.app);
                    this.app.logger.info(`Module loaded: ${mod.default.name}`);
                }
            }
        }
    }

    register(module: Module) {
        this.modules.push(module);
    }

    async startAll() {
        for (const module of this.modules) {
            await module.start?.(this.app);
        }
    }

    async stopAll() {
        for (const module of this.modules) {
            await module.stop?.(this.app);
        }
    }

    list(): string[] {
        return this.modules.map((m) => m.name);
    }
}
