// index.ts

import {registerWelcomeRoute} from "./welcome";
import {registerHealthRoute} from "./health";
import {Application} from "../core/application";

export function registerTemplateRoutes(app: Application) {
    registerWelcomeRoute(app);
    registerHealthRoute(app);

}
