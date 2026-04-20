# Architecture

## Purpose

This file is the source of truth for:

1. current repository structure
2. approved target direction
3. the boundary between what exists now and what is planned

If another ASSIST file conflicts with this file, this file wins.

## Current Repository State

The repository currently contains a small React + TypeScript + Vite application at the root.

Current visible structure:

```text
/
  ASSIST/
  apps/
  cxsun/
  packages/
  services/
  docs/
  package.json
  vite.config.ts
  eslint.config.js
  tsconfig*.json
```

Current runtime reality:

1. the frontend starting app now lives under `cxsun/web`
2. `cxsun/src` now has the first backend orchestration bootstrap runtime
3. `apps/sites` now exists as the first website plugin app mounted through the `cxsun` host
4. scaffold folders now exist for `apps`, `packages`, `services`, and `docs`
5. `packages/ui` is now a real workspace package consumed by package name
6. `packages/core` is now a real workspace package for shell contracts and registry helpers
7. `cxsun/web` now has a live shell registry and route composition foundation
8. `packages/core` now also owns the first typed in-process event bus
9. no worker runtime yet in this repo
10. domain apps are still mounted statically through the host and remain minimal today
11. current host composition now flows through explicit backend and frontend plugin registry files
12. the host can now serve built frontend assets directly for one-container deployment

## Approved Target Direction

The approved product target is:

1. multi-tenant
2. multi-industry
3. multi-vendor
4. all-in-one ERP platform

The approved architecture style is:

1. modular monolith
2. DDD
3. EDA

This target is planned and approved, not yet fully implemented.

## First Structural Goal

The first major structural move should evolve the repository toward:

```text
/
  apps/
  packages/
  services/
  docs/
  ASSIST/
```

Recommended intent:

1. `apps/`
   plugin app surfaces such as api, cli, admin, and domain-facing app modules mounted by the host
2. `packages/`
   shared UI, contracts, config, database, auth, and observability packages
3. `services/`
   worker and integration delivery runtimes when needed
4. `infra/`
   deployment, CI/CD, Docker, update, and environment assets in a later batch if needed

Current scaffold present now:

1. `apps/api`
2. `apps/billing`
3. `apps/ecommerce`
4. `apps/sites`
5. `cxsun`
6. `packages/core`
7. `packages/ui`
8. `packages/types`
9. `packages/utils`
10. `services/workers`
11. `docs`

Shared package ownership now:

1. `packages/ui`
   owns reusable UI components, shared UI helpers, and the global frontend stylesheet entry consumed by apps as `@codexsun/ui`
2. `packages/core`
   owns shared shell contracts, registry helpers, the typed in-process event bus, and other non-UI platform primitives consumed by apps as `@codexsun/core`

Frontend alias rule now:

1. `@cxsun/*`
   is reserved for the `cxsun/web/src/*` app boundary
2. shared UI imports should come from `@codexsun/ui/*`, not from app-local source aliases

## Shell App Boundary

`cxsun` owns orchestration and shell composition for the new architecture base.

Scope:

1. workspace composition
2. app registration
3. visibility resolution
4. shell routing
5. base frontend and backend application starting point
6. backend and frontend mounting for plugin apps

Non-goal:

1. app-specific billing business rules
2. app-specific CRM business rules
3. app-specific ecommerce business rules

Current shell foundation now includes:

1. module registration
2. shell navigation composition
3. route composition from registered modules
4. visibility-ready registry helpers for later permission filtering

Current backend bootstrap foundation now includes:

1. platform bootstrap entry
2. in-process typed event bus wiring
3. health module registration
4. startup event emission through the shared core package
5. centralized HTTP route mounting for internal and external app APIs
6. registry-backed plugin composition instead of scattered app imports

## Approved Domain Boundaries

The first stable bounded contexts should be:

1. Identity and Access
2. Tenant Management
3. Billing
4. CRM
5. Ecommerce
6. Warehouse
7. Marketing
8. Integrations
9. Administration

## Standard Domain Shape

Each domain should be self-contained and use this base folder shape:

```text
<domain>/
  entities/
  services/
  repositories/
  events/
  handlers/
  api/
  dto/
  types/
  constants/
  validators/
  mappers/
  database/
    migration/
    seeder/
```

Meaning:

1. `entities/`
   business objects and value objects
2. `services/`
   domain coordination and use-case logic
3. `repositories/`
   data access owned by the domain
4. `events/`
   facts emitted by the domain
5. `handlers/`
   reactions to domain or integration events
6. `api/`
   public transport or callable surface exposed by the domain
7. `database/migration/`
   schema changes owned by the domain
8. `database/seeder/`
   seed data owned by the domain
9. `dto/`
   request, response, and transfer objects owned by the domain
10. `types/`
   domain-local shared types
11. `constants/`
   stable domain constants
12. `validators/`
   domain and input validation logic
13. `mappers/`
   conversion logic across entity, DTO, database, and event shapes

## Communication Rules

1. modules may not edit another module's internals directly
2. modules may communicate through public contracts
3. modules may communicate through events
4. shared direct persistence access across modules is prohibited

## Engineering Rules

1. build the MVP flow first for each major feature
2. keep abstractions behind proven reuse, not speculative design
3. keep code app-owned or module-owned with visible ownership
4. create isolated engines only for truly reusable runtime capabilities
5. split large files before they become hard to maintain

File discipline:

1. aim to keep files below 500 lines where practical
2. treat 700 lines as a hard warning threshold
3. if a file crosses that size with mixed concerns, split it by responsibility immediately

## Event Rules

1. commands change state
2. events describe facts that already happened
3. start with a simple typed in-process event bus
4. evolve into outbox plus worker delivery later
5. do not jump to distributed brokers before the monolith is stable

## Documentation Rule

When the repository structure changes toward the approved ERP scaffold, update this file in the same batch.
