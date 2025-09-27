// cortex/core/container.ts

export type Constructor<T = any> = new (...args: any[]) => T;

interface RegistrationOptions<T> {
    useClass?: Constructor<T>;                   // instantiate via `new`
    useFactory?: (c: Container) => T;            // custom factory
    useValue?: T;                                // fixed value / singleton
    singleton?: boolean;                         // ✅ NEW: reuse same instance across resolves
    eager?: boolean;                             // ✅ NEW: instantiate immediately on register
}

/**
 * Dependency Injection Container
 * - Supports class, factory, and value registrations
 * - Supports singleton vs transient lifetimes
 * - Supports eager instantiation
 * - Supports request-scoped child containers (for multi-tenant/multi-db)
 * - Provides debug/introspection helpers
 */
export class Container {
    private bindings = new Map<
        string,
        { resolver: () => any; singleton?: boolean; instance?: any }
    >();

    /**
     * Bind a value, class, or factory directly (low-level API)
     * ⚠️ Kept for backward compatibility. Prefer `register()`.
     */
    bind<T>(key: string, value: T | Constructor<T> | (() => T)) {
        this.bindings.set(key, {
            resolver: () => {
                if (typeof value === "function") {
                    try {
                        return new (value as Constructor<T>)(); // try to instantiate as class
                    } catch {
                        return (value as () => T)(); // fallback: call as factory
                    }
                }
                return value; // plain value
            },
        });
    }

    /**
     * ✅ UPDATED: register() supports { useClass, useFactory, useValue, singleton, eager }
     * This makes providers more expressive (like NestJS / Inversify).
     *
     * Examples:
     *   app.container.register("Repo", { useClass: UserRepository });
     *   app.container.register("Service", { useFactory: c => new UserService(c.resolve("Repo")), singleton: true });
     *   app.container.register("Config", { useValue: { debug: true } });
     */
    register<T>(key: string, opts: RegistrationOptions<T>) {
        if (opts.useClass) {
            this.bindings.set(key, {
                resolver: () => new opts.useClass!(),
                singleton: opts.singleton,
            });
        } else if (opts.useFactory) {
            this.bindings.set(key, {
                resolver: () => opts.useFactory!(this),
                singleton: opts.singleton,
            });
        } else if (opts.useValue !== undefined) {
            this.bindings.set(key, {
                resolver: () => opts.useValue!,
                singleton: true,
                instance: opts.useValue!, // fixed value
            });
        } else {
            throw new Error(`Invalid register options for ${key}`);
        }

        // ✅ NEW: eager instantiation (resolve immediately)
        if (opts.eager) {
            this.resolve(key);
        }
    }

    /**
     * Resolve a dependency from the container
     * - If singleton, return cached instance (or create + cache on first resolve).
     * - If transient, call resolver to get a fresh instance.
     */
    resolve<T>(key: string): T {
        const binding = this.bindings.get(key);
        if (!binding) {
            throw new Error(`Dependency not found: ${key}`);
        }

        if (binding.singleton) {
            if (binding.instance === undefined) {
                binding.instance = binding.resolver();
            }
            return binding.instance as T;
        }

        return binding.resolver() as T;
    }

    /**
     * Check if a binding exists
     */
    has(key: string): boolean {
        return this.bindings.has(key);
    }

    /**
     * List all registered keys
     */
    list(): string[] {
        return Array.from(this.bindings.keys());
    }

    /**
     * ✅ NEW: Create a child scope for per-request or per-tenant isolation
     * Copies registrations but allows overrides without polluting the parent.
     *
     * Usage:
     *   const requestScope = app.container.createScope();
     *   const service = requestScope.resolve("UserService");
     */
    createScope(): Container {
        const scoped = new Container();
        scoped.bindings = new Map(this.bindings); // shallow copy of parent bindings
        return scoped;
    }

    /**
     * ✅ NEW: Debug utility — describe type of binding
     */
    describe(key: string): string {
        const binding = this.bindings.get(key);
        if (!binding) return "not registered";
        return binding.singleton ? "singleton" : "transient";
    }

    /**
     * ✅ NEW: Debug utility — dump all bindings with type
     */
    debugDump() {
        console.log("Container bindings:");
        this.bindings.forEach((_v, k) => {
            console.log(`  - ${k} (${this.describe(k)})`);
        });
    }
}
