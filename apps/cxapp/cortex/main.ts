// cortex/main.ts

import { APP } from "./core/application";

export async function bootstrap() {
    try {
        // Initialize DI, configs, modules, plugins
        await APP.init();

        // Start the application (routes, lifecycle, etc.)
        await APP.start();

        // Graceful shutdown
        process.on("SIGINT", async () => {
            await APP.stop();
            process.exit(0);
        });
        process.on("SIGTERM", async () => {
            await APP.stop();
            process.exit(0);
        });
    } catch (err) {
        console.error("Application failed to start:", err);
        process.exit(1);
    }
}