// cortex/core/plugins.ts

import { Application } from "./application";

export interface Plugin {
    name: string;
    init?(app: Application): Promise<void> | void;
    start?(app: Application): Promise<void> | void;
    stop?(app: Application): Promise<void> | void;
}

export class PluginManager {
    private app: Application;
    private plugins: Plugin[] = [];

    constructor(app: Application) {
        this.app = app;
    }

    /**
     * Register a plugin manually
     */
    register(plugin: Plugin) {
        this.plugins.push(plugin);
    }

    /**
     * Initialize all plugins
     */
    async init() {
        for (const plugin of this.plugins) {
            await plugin.init?.(this.app);
            this.app.logger.info(`Plugin initialized: ${plugin.name}`);
        }
    }

    /**
     * Start all plugins
     */
    async startAll() {
        for (const plugin of this.plugins) {
            await plugin.start?.(this.app);
        }
    }

    /**
     * Stop all plugins
     */
    async stopAll() {
        for (const plugin of this.plugins) {
            await plugin.stop?.(this.app);
        }
    }

    /**
     * List loaded plugins
     */
    list(): string[] {
        return this.plugins.map((p) => p.name);
    }
}
