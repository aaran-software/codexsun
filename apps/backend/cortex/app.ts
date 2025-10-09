import { getSettings } from "./config/get-settings";
import { createRouter } from "./routes/router";
import { createUserRouter } from "./routes/user-routes";

interface Dependencies {
    settings: ReturnType<typeof getSettings>;
    router: ReturnType<typeof createRouter>;
    userRouter: ReturnType<typeof createUserRouter>;
}

export class App {
    private readonly dependencies: Dependencies;

    constructor() {
        const userRouter = createUserRouter();
        const router = createRouter([userRouter]);
        this.dependencies = {
            settings: getSettings(),
            router,
            userRouter,
        };
    }

    getDependencies(): Dependencies {
        return this.dependencies;
    }
}