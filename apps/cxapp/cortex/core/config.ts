// cortex/core/config.ts

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export class Config {
    private values: Record<string, any> = {};

    /**
     * Load environment variables and config files
     */
    async load(configFile: string = "config.json") {
        // Load from .env
        dotenv.config();

        // Load from config.json if exists
        const filePath = path.resolve(process.cwd(), configFile);
        if (fs.existsSync(filePath)) {
            try {
                const data = fs.readFileSync(filePath, "utf-8");
                this.values = JSON.parse(data);
            } catch (err) {
                console.warn(`Failed to parse config file: ${configFile}`, err);
            }
        }

        // Merge environment variables
        for (const key of Object.keys(process.env)) {
            this.values[key] = process.env[key];
        }
    }

    /**
     * Get a config value with optional default
     */
    get<T = any>(key: string, defaultValue?: T): T {
        return (this.values[key] ?? defaultValue) as T;
    }

    /**
     * Set a config value at runtime
     */
    set<T = any>(key: string, value: T) {
        this.values[key] = value;
    }

    /**
     * Return all config values
     */
    all(): Record<string, any> {
        return this.values;
    }
}
