// File: sys-routes.ts
// Location: src/todos-routes.ts
// Description: New file for task management (e.g., GET /todos, POST /todos). Simulates a basic ERP task module.

import { createHttpRouter } from "./chttpx";
import { Logger } from "../logger/logger";
import { RequestContext } from "./middleware";

// Mock todos data for simulation
let web: any[] = [];

export function createWebRouter() {
    const { routeRequest, Route } = createHttpRouter();
    const logger = new Logger();

    Route("GET", "/", async (ctx: RequestContext) => {
        return "Welcome to Cortex ERP Backend";
    });

    Route("GET", "/hz", async (ctx: RequestContext) => {
        return JSON.stringify({ 'message': "Healthy" + new Date().toISOString() });
    });

    return { routeRequest, Route };
}