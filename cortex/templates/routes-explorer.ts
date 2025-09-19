import { Application } from "../core/application";

export function registerRoutesExplorer(app: Application) {
    app.router.register("GET", "/routes", (_req, res) => {
        const routes = app.router.getRoutes().map(r => ({
            method: r.method,
            path: r.path,
        }));
        res.status(200).json(routes);
    });
}
