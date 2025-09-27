// cortex/templates/health.ts
import { Application } from "../core/application";

export function registerHealthRoute(app: e.Express) {
    app.router.register("GET", "/hz", (_req, res) => {
        res.status(200).json({ status: "ok", uptime: process.uptime() });
    });
}
