import { Application } from "../core/application";

export function registerSystemEndpoints(app: Application) {
    // Health Check
    app.router.register("GET", "/hz", (_req, res) => {
        res.status(200).json({
            status: "ok",
            uptime: process.uptime()
        });
    });

    // App Info
    app.router.register("GET", "/info", (_req, res) => {
        res.status(200).json({
            name: app.name,
            version: app.version,
            env: process.env.NODE_ENV || "development",
            modules: app.modules.list()
        });
    });

    app.router.register("GET", "/routes", (_req, res) => {
      const routes = app.router.getRoutes().map(r => ({
        method: r.method,
        path: r.path,
      }));
      res.status(200).json(routes);
    });

}
