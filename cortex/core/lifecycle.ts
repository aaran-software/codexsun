// cortex/core/lifecycle.ts

import { Application } from "./application";

export type LifecycleHook = (app: Application) => Promise<void> | void;

export class Lifecycle {
    private initHooks: LifecycleHook[] = [];
    private startHooks: LifecycleHook[] = [];
    private stopHooks: LifecycleHook[] = [];

    /**
     * Register hook to run on init
     */
    onInit(hook: LifecycleHook) {
        this.initHooks.push(hook);
    }

    /**
     * Register hook to run on start
     */
    onStart(hook: LifecycleHook) {
        this.startHooks.push(hook);
    }

    /**
     * Register hook to run on stop
     */
    onStop(hook: LifecycleHook) {
        this.stopHooks.push(hook);
    }

    /**
     * Execute init hooks
     */
    async runInit(app: Application) {
        for (const hook of this.initHooks) {
            await hook(app);
        }
    }

    /**
     * Execute start hooks
     */
    async runStart(app: Application) {
        for (const hook of this.startHooks) {
            await hook(app);
        }
    }

    /**
     * Execute stop hooks
     */
    async runStop(app: Application) {
        for (const hook of this.stopHooks) {
            await hook(app);
        }
    }
}
