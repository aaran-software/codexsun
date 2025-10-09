import { createServer, Server } from "node:http";
import { App } from "./cortex/app";

export async function server(): Promise<void> {
    // Initialize DI container
    const app = new App();
    const { settings, router } = app.getDependencies();

    // Create server instance
    const server: Server = createServer((req, res) => {
        router.routeRequest(req, res).catch((err: Error) => {
            console.error("Error handling request:", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
        });
    });

    // Start server
    server.listen(settings.APP_PORT, settings.APP_HOST, () => {
        console.log(`Server running at http://${settings.APP_HOST}:${settings.APP_PORT}`);
    });
}

// Run the bootstrap function
server().catch((err: Error) => {
    console.error("Bootstrap failed:", err);
    process.exit(1);
});