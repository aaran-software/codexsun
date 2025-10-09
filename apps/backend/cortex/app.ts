import { getSettings } from "./config/get-settings";
import { createRouter } from "./routes/router";
import { createUserRouter } from "./routes/user-routes";
import {createAuthRouter} from "./routes/auth-routes";

interface Dependencies {
    settings: ReturnType<typeof getSettings>;
    router: ReturnType<typeof createRouter>;
    userRouter: ReturnType<typeof createUserRouter>;
    authRouter: ReturnType<typeof createAuthRouter>;
}

export class App {
    private readonly dependencies: Dependencies;

    constructor() {
        const authRouter = createAuthRouter();
        const userRouter = createUserRouter();
        const router = createRouter([userRouter,authRouter]);
        this.dependencies = {
            settings: getSettings(),
            router,
            userRouter,
            authRouter,
        };
    }

    getDependencies(): Dependencies {
        return this.dependencies;
    }
}