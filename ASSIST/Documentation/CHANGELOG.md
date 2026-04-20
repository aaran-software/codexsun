# Changelog

## Version State

- Current package version: `1.0.025`
- Current release tag: `v-1.0.025`
- Reference format: changelog labels use `v 1.0.<number>`, task refs use `#<number>`, and release tags use `v-1.0.<number>`

## v-1.0.025

### [v 1.0.025] 2026-04-20 - Build the client-style container deployment server

- moved container deployment into a `.container` client layout with shared bash orchestration and a first `codexsun` demo client
- aligned docker compose with the external `codexion` network so the app can run beside an existing MariaDB container
- changed cleanup to remove only app containers and the `codexsun:v2` image while preserving networks, volumes, and database state

## v-1.0.024

### [v 1.0.024] 2026-04-20 - Build the single-space container deployment path

- made the `cxsun` host serve built frontend assets so one runtime can serve the full application
- added one-container deployment assets with `Dockerfile`, `docker-compose.yml`, and `.container` helpers for local docker deployment without runtime bind mounts
- added CI/CD image automation and docker-backed e2e deployment validation

## v-1.0.023

### [v 1.0.023] 2026-04-20 - Build a real plugin registry for host composition

- added centralized backend and frontend plugin registries so host composition no longer depends on scattered hardcoded app imports
- moved current app manifest and route composition behind registry-backed host wiring
- aligned the docs and tests with the new registry-backed plugin model

## v-1.0.022

### [v 1.0.022] 2026-04-20 - Fix helper and documentation misconfiguration after the host/plugin refactor

- fixed `apps/cli` so `github:now` can use the changelog title without opening an interactive prompt
- made the git helper fail fast with a clear error when no push remote is configured
- aligned stale architecture and overview docs with the current cxsun-hosted plugin model

## v-1.0.021

### [v 1.0.021] 2026-04-20 - Make `cxsun` the only host entrypoint and move apps to plugin ownership

- moved backend and frontend startup ownership into `cxsun` so plugin apps now mount through one host
- built `apps/api` as the shared API composition app with explicit internal and external route surfaces
- converted `apps/sites` into a plugin app and added the first `apps/cli` git helper with `github:now`

## v-1.0.020

### [v 1.0.020] 2026-04-20 - Build the first `apps/sites` portfolio app with wired frontend and backend

- added `apps/sites` as the first standalone website app with `shared`, `src`, and `web` ownership boundaries
- built a minimal portfolio frontend with `home`, `about`, `service`, and `contact` pages wired to backend APIs
- added a backend server with explicit start and stop behavior, a health endpoint, and a contact endpoint, plus concurrent dev and dedicated sites e2e scripts

## v-1.0.019

### [v 1.0.019] 2026-04-20 - Add the typed event bus to `packages/core` and bootstrap `cxsun/src`

- added a typed in-process event bus to `@codexsun/core`
- bootstrapped the first backend orchestration runtime in `cxsun/src` with a platform bootstrap, runtime, and health module
- added unit tests for the core event bus and backend runtime bootstrap
## v-1.0.018

### [v 1.0.018] 2026-04-20 - Build `packages/core` and the `cxsun` shell registry and routing foundation

- added `@codexsun/core` as a real workspace package for shell contracts and registry helpers
- replaced the placeholder frontend landing page with a module-driven shell layout and routes for workspace, billing, and ecommerce
- made `cxsun/web` consume shell registration metadata from the shared core package while keeping route elements app-owned

## v-1.0.017

### [v 1.0.017] 2026-04-20 - Clean unwanted empty folders and stale placeholder files

- removed the transient empty `temp` folder from the repository root
- removed the stale `packages/ui/.gitkeep` placeholder because that package now contains real code
- kept scaffold placeholder files for still-empty planned modules so the documented structure remains intact

## v-1.0.016

### [v 1.0.016] 2026-04-20 - Harden package boundaries for shared UI and the `cxsun` frontend

- turned `packages/ui` into a real npm workspace package exposed as `@codexsun/ui`
- replaced the generic frontend source alias with the explicit app-owned `@cxsun/*` boundary
- removed the stale local UI ownership folders from `cxsun/web/src` so shared UI now has a single clear home

## v-1.0.015

### [v 1.0.015] 2026-04-20 - Move shared UI components and styles into `packages/ui`

- moved the shared button primitive, UI helper, and global stylesheet into `packages/ui/src`
- rewired Vite, Vitest, TypeScript, and shadcn aliases so apps can consume shared UI through `@ui/*`
- made `packages/ui` the current shared owner for reusable frontend components and styling tokens

## v-1.0.014

### [v 1.0.014] 2026-04-20 - Consolidate frontend styles into a single Tailwind and shadcn CSS entry

- moved the frontend CSS entry into `cxsun/web/src/styles/globals.css`
- removed the leftover Vite template `App.css` and `index.css` files
- refactored the starter app shell to use utility classes and the shared shadcn-style theme tokens instead of page-specific CSS selectors

## v-1.0.013

### [v 1.0.013] 2026-04-20 - Collapse TypeScript config to one frontend config and one backend config

- removed `tsconfig.json`, `tsconfig.app.json`, `tsconfig.base.json`, and `tsconfig.node.json`
- added `tsconfig.frontend.json` for the React and frontend application code and `tsconfig.backend.json` for backend and tooling TypeScript
- updated the typecheck script and repo references so the new two-file setup preserves existing behavior

## v-1.0.012

### [v 1.0.012] 2026-04-20 - Add the requested application and platform package baseline

- added the requested drag-and-drop, editor, state, schema, database, mail, toast, routing, and formatting packages to the platform baseline
- added Prettier plus the Tailwind Prettier plugin and baseline format scripts
- preserved the existing validation and build pipeline while expanding the package foundation for upcoming platform work

## v-1.0.011

### [v 1.0.011] 2026-04-20 - Consolidate the TypeScript config files without losing behavior

- extracted the shared compiler baseline into `tsconfig.base.json`
- kept separate app and node TypeScript configs for their environment-specific settings while removing duplicated compiler options
- preserved the current `cxsun/web` aliasing, project references, and validation behavior

## v-1.0.010

### [v 1.0.010] 2026-04-20 - Move the current root app into `cxsun` as the base orchestration app

- renamed the root shell app from `cxapp` to `cxsun`
- moved the current frontend from root `src`, `public`, and `index.html` into `cxsun/web`
- created `cxsun/src` as the backend and orchestration starting point scaffold
- updated Vite, TypeScript, shadcn, and Vitest configuration so the moved frontend remains runnable from the new location
- updated architecture and setup docs so `cxsun` is now the named base orchestration app

## v-1.0.009

### [v 1.0.009] 2026-04-20 - Move `cxapp` out of `apps` to the repository root

- moved the `cxapp` scaffold from `apps/cxapp` to root `cxapp/`
- updated architecture and blueprint docs so `cxapp` remains the shell orchestration owner from the new root-level location
- updated scaffold readmes and project overview to reflect the new placement

## v-1.0.008

### [v 1.0.008] 2026-04-20 - Add `cxapp` as the shell orchestration app boundary

- added `apps/cxapp` to the scaffold as the shell orchestration app boundary
- documented `cxapp` as the owner of workspace composition, app registration, visibility resolution, and shell routing
- documented that `cxapp` does not own billing, CRM, or ecommerce business rules

## v-1.0.007

### [v 1.0.007] 2026-04-20 - Create the first repository scaffold for apps, packages, services, and docs

- added the initial top-level scaffold for `apps`, `packages`, `services`, and `docs`
- added the requested `apps/api`, `apps/billing`, and `apps/ecommerce` structure
- added the first billing app subfolders: `database`, `helper`, `shared`, `src`, and `web`
- added shared package scaffolds for `core`, `ui`, `types`, and `utils`, plus `services/workers`
- updated architecture docs to reflect the new first-stage scaffold while keeping runtime wiring honest

## v-1.0.006

### [v 1.0.006] 2026-04-20 - Add strict engineering rules for MVP-first delivery, file-size discipline, and isolated engines

- made MVP-first delivery an explicit platform rule across the ASSIST entrypoint, AI rules, architecture, blueprint, contribution flow, and coding standards
- added strict file discipline guidance to keep files under roughly 500 to 700 lines and split mixed-responsibility files early
- made app-owned and module-owned code boundaries explicit and limited isolated engines to genuinely reusable runtime concerns

## v-1.0.005

### [v 1.0.005] 2026-04-20 - Add the frontend starter platform packages and tooling baseline

- added Tailwind v4 through the Vite plugin, shadcn-compatible aliases and config, utility helpers, and a starter `Button` component
- added Playwright configuration plus a minimal e2e smoke test and `npm run test:e2e`
- added the supporting frontend baseline packages needed to start a more serious SaaS UI foundation

## v-1.0.004

### [v 1.0.004] 2026-04-20 - Add the missing validation pipeline

- added explicit validation scripts so the repository now has separate `lint`, `typecheck`, `test`, and `build` command paths
- added a minimal automated test baseline to make the required pre-commit test step executable instead of only documented
- aligned the package and changelog version serial to the active implementation batch

## v-1.0.002

### [v 1.0.002] 2026-04-20 - Consolidate ASSIST around the approved ERP architecture

- reconciled ASSIST so README, AI rules, architecture, contribution flow, discipline docs, changelog, and execution notes now align with the approved ERP direction
- kept current setup and validation commands honest while documenting the stricter target workflow for planning, changelog, validation, and commits

## v-1.0.001

### [v 1.0.001] 2026-04-20 - Create ERP platform blueprint and first-phase structure plan

- added the platform blueprint for a multi-tenant, multi-industry, multi-vendor ERP system
- added the phased implementation roadmap
- approved the core architecture style as modular monolith plus DDD plus EDA
- documented the starting rule of simple modules, simple event bus, and clean separation

## v-1.0.003

### [v 1.0.003] 2026-04-20 - Add SaaS development discipline for planning, changelog serials, validation, and commit format

- made task creation and planning mandatory before meaningful implementation or refactor work
- made changelog logging mandatory for every implementation or refactor batch
- documented the required serial format across task, changelog, release tag, and commit message
- documented the mandatory validation sequence before commit: lint, type-safety validation, and tests
- recorded the current repo gap that `npm run test` and serial-aligned package versioning are not yet in place
