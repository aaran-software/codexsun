# Planning

## Active Work
- `#021` Make `cxsun` the only host entrypoint and move apps to plugin ownership
  - Goal:
    make `cxsun` the single orchestration host for backend and frontend startup, keep apps under `apps/` as plugins only, centralize API composition under `apps/api`, and add the first real `apps/cli` operational helper
  - Scope:
    update strict host/plugin rules, replace standalone `apps/sites` startup with app-owned plugin behavior mounted by `cxsun`, build shared internal and external API route composition under `apps/api`, add `apps/cli` with the git helper baseline from `temp`, and wire the first `github:now` script
  - Constraints:
    keep the implementation minimal and explicit, do not introduce framework-heavy server abstractions, and do not leave duplicate host entrypoints behind
  - Validation:
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
  - Residual risk:
    the first plugin system is still in-process and static, so later dynamic discovery, auth, and persistence concerns remain future work

- `#020` Build the first `apps/sites` portfolio app with wired frontend and backend
  - Goal:
    create the first standalone website app under `apps/sites` with a minimal portfolio frontend, a robust backend server, and concurrent run scripts that make the app practical to develop and verify
  - Scope:
    scaffold `apps/sites` using the existing app pattern, build the pages `home`, `about`, `service`, and `contact`, add a backend server with health and contact endpoints, wire the frontend to backend APIs, add dedicated dev/build/e2e scripts, and keep the cxsun foundation intact
  - Constraints:
    keep the app minimal and readable, avoid introducing unnecessary backend frameworks, and make startup and shutdown behavior explicit and safe for tests
  - Validation:
    run `npm install`
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
    run `npm run build:sites`
    run `npm run test:e2e`
    run `npm run test:e2e:sites`
  - Residual risk:
    the first sites backend will stay simple and in-memory until persistence or CMS-style management is introduced later

- `#019` Add the typed event bus to `packages/core` and bootstrap `cxsun/src`
  - Goal:
    give the platform a real shared core runtime by adding a simple typed event bus and using it inside the first backend orchestration bootstrap under `cxsun/src`
  - Scope:
    extend `@codexsun/core` with event contracts and an in-process typed event bus, create the first backend bootstrap, config, and health module in `cxsun/src`, and add basic tests so the platform core is not frontend-only anymore
  - Constraints:
    keep the event bus in-process and minimal, avoid premature worker or broker complexity, and keep business domains out of this batch
  - Validation:
    run `npm install`
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
    run `npm run test:e2e`
  - Residual risk:
    this runtime will still be a bootstrap layer only until real backend transports, persistence, and domain modules are added

- `#018` Build `packages/core` and the `cxsun` shell registry and routing foundation
  - Goal:
    establish `packages/core` as the owner of shell contracts and registry logic, then make `cxsun/web` use a real module-driven shell navigation and routing foundation
  - Scope:
    create the core workspace package, define shell module contracts and registry helpers, register the first shell modules, replace the placeholder landing page with a routed shell layout, and keep boundaries clean between core contracts, shared UI, and app-owned route elements
  - Constraints:
    keep the foundation simple, avoid premature event or backend complexity in this batch, and keep business logic out of the shell
  - Validation:
    run `npm install`
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
    run `npm run test:e2e`
  - Residual risk:
    the first shell registry will remain frontend-only until the backend orchestration runtime and permission model are implemented later

- `#017` Clean unwanted empty folders and stale placeholder files
  - Goal:
    remove filesystem noise before development starts without damaging the intentional ERP scaffold that is still documented and planned
  - Scope:
    delete truly unwanted empty folders such as transient temp folders and remove stale placeholder files from directories that already contain real code, while keeping placeholder files that still preserve intentional empty scaffold directories
  - Constraints:
    do not remove documented scaffold directories that are intentionally empty for near-term domain work, and do not change runtime behavior
  - Validation:
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
    run `npm run test:e2e`
  - Residual risk:
    some scaffold placeholders will remain by design until those modules get real code

- `#016` Harden package boundaries for shared UI and the `cxsun` frontend
  - Goal:
    convert the shared UI boundary from alias-only wiring into a real workspace package, make the frontend app alias explicit to `cxsun`, and remove stale local ownership folders that can cause drift
  - Scope:
    add workspace package metadata for `packages/ui`, switch imports and config from `@ui/*` and generic `@/*` usage to package and app-specific paths, remove empty local UI folders under `cxsun/web/src`, and keep the repo passing validation
  - Constraints:
    keep the package simple without introducing a separate build pipeline yet, and avoid changing business scope or adding new runtime modules
  - Validation:
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
    run `npm run test:e2e`
  - Residual risk:
    future frontend apps will still need their own package manifests and local aliases, but the shared UI boundary will no longer depend on per-app source alias hacks

- `#015` Move shared UI components and styles into `packages/ui`
  - Goal:
    make `packages/ui` the canonical owner of shared UI components, styling tokens, and frontend UI helpers so apps consume one shared UI surface instead of owning duplicate primitives
  - Scope:
    move the current button component, UI utility helper, and global stylesheet from `cxsun/web/src` into `packages/ui`, add the required alias and config wiring, and update the current app to consume the shared UI package
  - Constraints:
    keep the implementation simple, do not invent a full package build system yet, and preserve the current validation pipeline
  - Validation:
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
    run `npm run test:e2e`
  - Residual risk:
    this creates the shared UI boundary, but future apps may still need package manifests and build outputs once the monorepo grows further

- `#014` Consolidate frontend styles into a single Tailwind and shadcn CSS entry
  - Goal:
    keep the frontend on one clean CSS entrypoint owned by the frontend app, move styles into a proper folder, and remove leftover Vite starter CSS so the baseline stays Tailwind plus shadcn only
  - Scope:
    move the CSS entry from `cxsun/web/src/index.css` to a dedicated styles folder, delete `App.css`, refactor the app shell to use utility classes instead of template selectors, and update references such as `components.json`
  - Constraints:
    keep the app visually valid, avoid adding new styling systems, and keep the CSS baseline minimal and maintainable
  - Validation:
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
    run `npm run test:e2e`
  - Residual risk:
    removing the template CSS will intentionally change the starter appearance, but the result will be a cleaner SaaS-oriented baseline

- `#013` Collapse TypeScript config to one frontend config and one backend config
  - Goal:
    reduce the TypeScript setup to exactly two config files, one for React/frontend code and one for backend/tooling TypeScript
  - Scope:
    remove `tsconfig.json`, `tsconfig.app.json`, `tsconfig.base.json`, and `tsconfig.node.json`, replace them with two configs only, and rewire scripts and includes so current behavior is preserved
  - Constraints:
    keep `cxsun/web` frontend typing, keep node-side tooling typing, and do not lose alias or validation behavior
  - Validation:
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
    run `npm run test:e2e`
  - Residual risk:
    future backend expansion may eventually need a third config, but this batch will follow the requested two-file rule strictly

- `#012` Add the requested application and platform package baseline
  - Goal:
    add the requested frontend, editor, drag-and-drop, state, schema, database, mail, toast, routing, and formatting packages as the next platform baseline
  - Scope:
    install the requested packages, resolve exact valid package names, add minimal formatter configuration where needed, and keep the repository passing validation
  - Constraints:
    do not add fake packages that do not exist, and keep the added setup minimal rather than prematurely wiring every library into runtime code
  - Validation:
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
    run `npm run test:e2e`
  - Residual risk:
    some packages will only be installed and prepared, not yet integrated into live business flows

- `#011` Consolidate the TypeScript config files without losing behavior
  - Goal:
    remove duplication across the TypeScript config files while preserving the current app, node tooling, aliases, and project-reference behavior
  - Scope:
    introduce a shared base config for common compiler options, keep app-specific and node-specific settings in their own configs, and leave the root project references intact
  - Constraints:
    do not break `cxsun/web` pathing, aliases, or current validation commands
  - Validation:
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
    run `npm run test:e2e`
  - Residual risk:
    consolidation will reduce duplication, but future backend/server expansion may still justify an additional dedicated server tsconfig later

- `#010` Move the current root app into `cxsun` as the base orchestration app
  - Goal:
    make `cxsun` the root orchestration app by moving the current root frontend into `cxsun/web` and creating `cxsun/src` as the backend starting point
  - Scope:
    rename the root shell app from `cxapp` to `cxsun`, move `src`, `public`, and `index.html` into `cxsun/web`, create `cxsun/src`, update Vite, TypeScript, Playwright, component aliases, and architecture docs, and keep the app runnable
  - Constraints:
    keep the change structural and honest, do not invent backend runtime behavior yet, and preserve the validation pipeline
  - Validation:
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
    run `npm run test:e2e`
  - Residual risk:
    this establishes `cxsun` as the base orchestration app, but the real backend runtime and modular wiring still need later implementation

- `#009` Move `cxapp` out of `apps` to the repository root
  - Goal:
    make `cxapp` a root-level shell orchestration workspace instead of an app folder under `apps`
  - Scope:
    move the existing `apps/cxapp` scaffold to `cxapp/`, update architecture and blueprint docs to reflect the new location, and keep the ownership rules unchanged
  - Constraints:
    keep this as a structure and documentation move only; do not imply additional runtime wiring
  - Validation:
    move scaffold path
    update architecture docs
    update changelog and version serial
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
  - Residual risk:
    future imports and tooling will need to choose whether other shell-owned code also lives at the root or under `apps`

- `#008` Add `cxapp` as the shell orchestration app boundary
  - Goal:
    define `cxapp` as the orchestration and shell composition owner in the new architecture base
  - Scope:
    add `apps/cxapp` to the scaffold and architecture docs with explicit scope covering workspace composition, app registration, visibility resolution, and shell routing, while excluding app-specific billing, CRM, and ecommerce business rules
  - Constraints:
    keep this as an ownership rule and scaffold addition only; do not pretend runtime wiring is already implemented
  - Validation:
    update architecture docs
    update blueprint docs
    update scaffold docs
    update changelog and version serial
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
  - Residual risk:
    `cxapp` will be documented as the shell owner before the actual runtime moves into it

- `#007` Create the first repository scaffold for apps, packages, services, and docs
  - Goal:
    establish the first real repository scaffold for the ERP platform using the requested `apps`, `packages`, `services`, and `docs` structure
  - Scope:
    create `apps/api`, `apps/billing`, `apps/ecommerce`, create the billing subfolders `database`, `helper`, `shared`, `src`, and `web`, create `packages/core`, `packages/ui`, `packages/types`, `packages/utils`, create `services/workers`, and create `docs`
  - Constraints:
    keep the scaffold minimal, do not pretend runtime wiring already exists, and preserve the current root app until a later migration batch moves it
  - Validation:
    scaffold folders created
    architecture docs updated
    changelog updated
    run `npm run lint`
    run `npm run typecheck`
    run `npm run test`
    run `npm run build`
  - Residual risk:
    the scaffold will exist structurally, but package boundaries, runtime wiring, and module ownership code still need later implementation
