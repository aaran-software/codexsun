# Platform Blueprint

## Purpose

This document defines the approved target blueprint for the ERP platform the repository will grow into.

It is a planning and decision document. It does not imply the current repository already implements these systems.

## Product Goal

Build an all-in-one ERP platform that supports:

1. multi-tenant operation
2. multi-industry deployment
3. multi-vendor and multi-warehouse commerce
4. small, mid-size, and large business operations
5. standalone app adoption or full-suite adoption
6. live accounting and ERP integrations

## Approved Architecture Style

The approved platform architecture style is:

1. Modular Monolith
2. Domain-Driven Design
3. Event-Driven Architecture

This means:

1. deploy one primary application system first
2. keep domain boundaries strict inside that system
3. use domain events and integration events for decoupling
4. delay service extraction until operational scale or team scale proves it is necessary

## First Principle

Start simple:

1. simple modules
2. simple event bus
3. clean separation

Working metaphor:

1. the app is one house
2. modules are rooms
3. events are messages between rooms
4. one room must not walk into another room and change its internals directly

## Core Platform Capabilities

The platform must support these domains as first-class bounded apps or modules:

1. Billing:
   sales, purchase, receipt, payment, journal, contra, debit note, credit note, ledgers, reports, tax, reconciliation
2. CRM:
   lead capture, follow-up, pipeline, quotation handoff, billing conversion, activity tracking
3. Ecommerce:
   catalog, pricing, cart, checkout, orders, fulfillment, delivery tracking, returns
4. Warehouse and Inventory:
   warehouse, rack, bin, inward, outward, stock movement, reservation, verification, reconciliation
5. Marketing:
   campaign management, social media publishing, content calendar, lead attribution, promotion control
6. Integrations:
   Tally live sync, ERPNext live sync, future connectors through a common integration contract

## Non-Negotiable System Characteristics

1. tenant isolation must be explicit in every data and permission boundary
2. industry-specific behavior must be configurable without forking the base platform
3. apps must remain separately maintainable even when shipped as one suite
4. integration failures must degrade safely and visibly, not corrupt operational state
5. stock, accounting, and audit trails must remain traceable and recoverable

## Recommended Architecture Model

Use a modular monolith with these top-level boundaries:

1. `apps/`
   product-facing apps and app-owned workflows
2. `packages/`
   shared packages such as UI, contracts, SDKs, config, and utilities
3. `services/`
   optional standalone runtimes for jobs, webhooks, sync workers, media, notifications, and update services
4. `infra/`
   deployment, Docker, CI/CD, backup, update, and environment assets
5. `docs/` or `ASSIST/Documentation/`
   architecture, operating rules, and implementation plans

Within the modular monolith:

1. each domain remains a bounded module
2. modules communicate through application services, domain contracts, and events
3. direct database coupling across domains is not allowed
4. shared code must stay infrastructural or generic, not become a dumping ground
5. module internals are private by default; only explicit public contracts may be consumed

## DDD Boundary Model

Use DDD bounded contexts for the first major domains:

1. Identity and Access
2. Tenant Management
3. Billing
4. CRM
5. Ecommerce
6. Warehouse
7. Marketing
8. Integrations
9. Administration

Each bounded context should contain:

1. domain entities and value objects
2. aggregates where consistency matters
3. repositories
4. application services
5. domain events
6. transport adapters such as HTTP handlers and job handlers

Recommended internal domain shape:

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

Example:

```text
finance/
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

Folder intent:

1. `entities/`
   domain entities and value objects owned by the domain
2. `services/`
   domain and application services that coordinate domain rules
3. `repositories/`
   persistence contracts and implementations owned by the domain boundary
4. `events/`
   domain event contracts emitted by the domain
5. `handlers/`
   event handlers and workflow reactions owned by the domain
6. `api/`
   public HTTP or module-facing contract surface for the domain
7. `database/migration/`
   domain-owned schema changes
8. `database/seeder/`
   domain-owned baseline or demo seed data
9. `dto/`
   request, response, and internal transfer shapes owned by the domain
10. `types/`
   domain-specific shared types and interfaces
11. `constants/`
   stable domain constants, statuses, and event names where appropriate
12. `validators/`
   input and domain validation logic
13. `mappers/`
   mapping between persistence, entities, DTOs, and event payloads

Rule:

1. each domain must be self-contained
2. each domain owns its own events and handlers
3. each domain owns its own migrations and seeders
4. other domains may consume only the public surface, not private internals

Recommended minimum additions beyond the base domain folders:

1. `dto/`
2. `validators/`
3. `mappers/`

`types/` and `constants/` are approved as standard folders and should be used when the domain actually needs them.

## EDA Model

EDA is approved inside the modular monolith first.

Use two event classes:

1. domain events
   internal facts such as `salesInvoicePosted`, `stockReserved`, `leadConverted`
2. integration events
   outward-facing events for sync, notifications, analytics, and external connectors

EDA rules:

1. commands change state
2. events describe completed facts
3. event handlers may trigger downstream workflows
4. event delivery inside the monolith should be reliable and observable
5. cross-domain workflows should prefer events over hidden direct coupling

Examples:

1. CRM lead converted
   emits event -> billing creates customer draft -> marketing closes campaign attribution
2. sales order confirmed
   emits event -> warehouse reserves stock -> billing prepares invoice -> ecommerce updates order timeline
3. purchase receipt verified
   emits event -> warehouse increases stock -> integrations queue ERP sync
4. order created
   commerce saves order -> emits `order.created` -> inventory reserves or reduces stock -> finance creates invoice draft -> CRM updates customer activity

## Module Communication Rule

The default rule is:

1. no module reaches into another module's internals
2. a module may call only a public application contract exposed by another module
3. cross-module reactions should prefer events when the workflow is asynchronous or fan-out by nature
4. shared database table access across modules is prohibited

In plain language:

1. Finance does not directly edit Commerce internals
2. CRM does not directly edit Warehouse internals
3. modules publish facts
4. other modules react through subscribed handlers

## Recommended First Event Bus

Start with a simple internal event bus:

1. typed event names
2. typed payload contracts
3. in-process publish and subscribe
4. handler registration by module
5. logging around publish and handler execution

Do not start with:

1. distributed brokers
2. overly abstract event frameworks
3. dynamic string-only payloads without contracts
4. hidden side effects without observability

Grow later into:

1. outbox-backed async dispatch
2. worker delivery
3. retry and dead-letter handling
4. external broker integration only when scale demands it

## Event Reliability Strategy

EDA without reliability is noise. The first design must include:

1. event bus abstraction
2. outbox pattern for persistent event publishing
3. idempotent handlers
4. retry policy
5. dead-letter handling for failed integration events
6. event audit and replay visibility where practical

Recommended first implementation:

1. synchronous in-process domain event dispatch for local consistency hooks
2. persistent outbox for integration events
3. worker process to deliver async handlers and external connector sync

## Proposed App Boundaries

The first stable app boundary model should be:

1. `cxsun`
   orchestration and shell composition for the platform base, including workspace composition, app registration, visibility resolution, shell routing, and the base frontend/backend application starting point
2. `apps/api`
   HTTP API gateway and transport layer
3. `apps/billing`
   finance and accounting workflows
4. `apps/crm`
   lead-to-customer workflows
5. `apps/ecommerce`
   storefront and order workflows
6. `apps/warehouse`
   inventory, stock movement, rack and bin operations
7. `apps/marketing`
   campaign and social media operations
8. `apps/integrations`
   connector orchestration surfaces and sync control pages
9. `apps/admin`
   platform settings, update controls, tenant management, audit, runtime controls

`cxsun` non-goal:

1. billing business rules
2. CRM business rules
3. ecommerce business rules

## Proposed Shared Packages

The minimum shared package set should be:

1. `packages/ui`
   design system, tokens, primitives, layout shells, block patterns
2. `packages/contracts`
   shared schemas, DTOs, event contracts, app contracts
3. `packages/config`
   env parsing, runtime config, tenant-aware config helpers
4. `packages/auth`
   reusable auth primitives, guards, hashing, token helpers
5. `packages/database`
   database access, migration tooling, tenancy helpers, repositories
6. `packages/observability`
   logs, metrics, tracing, audit contracts
7. `packages/integration-sdk`
   sync primitives, retry policy, mapping contracts, connector status helpers

## Multi-Tenant Strategy

Use tenant-aware design from day one:

1. every business record carries `tenantId`
2. access checks resolve tenant scope before business permissions
3. tenant-specific settings are stored separately from global platform settings
4. asset, media, and export paths remain tenant-aware
5. background jobs, webhooks, and sync pipelines carry tenant context explicitly

Recommended tenancy mode:

1. shared application codebase
2. tenant-scoped data with optional tenant-dedicated database path for enterprise customers
3. feature flags and industry packs resolved per tenant

## Multi-Industry Strategy

Do not fork the platform by industry. Use:

1. common core workflows
2. industry packs for extra entities, rules, and UI
3. feature flags for activation
4. app extension points for industry-specific workflows

Examples:

1. textiles:
   color-size variants, lots, rolls, batches
2. pharma:
   expiry, compliance, controlled stock
3. hardware:
   serial tracking, warranty, service linkage

## Multi-Vendor Strategy

Vendor behavior should be native to the platform, not a later patch:

1. vendor-specific catalog ownership
2. vendor fulfillment and stock visibility
3. vendor settlements and payout reporting
4. vendor-level tax and shipping logic where applicable
5. vendor approval and compliance workflow

## Integration Strategy

Treat integrations as controlled pipelines, not direct app-to-app hacks.

Connector model:

1. connector config
2. mapping rules
3. sync queue
4. reconciliation view
5. retry and dead-letter handling
6. audit log

Tally and ERPNext rules:

1. local platform state remains the operational source of truth for the UI
2. external sync status is explicit per document
3. failed syncs must be recoverable without mutating business history invisibly
4. connector code must not be mixed into domain app UI files

Integration events should be emitted from domain boundaries and consumed by connector workers instead of letting connector code invade billing, warehouse, or ecommerce domain logic.

## Scalability and Maintainability Rules

1. separate domain apps from shared packages early
2. keep transport, business logic, persistence, and UI in different modules
3. avoid giant catch-all files and giant catch-all apps
4. design for background jobs from the start because sync, notifications, reports, and updates will need them
5. keep feature registration explicit so apps can be enabled, hidden, or extended safely
6. keep bounded contexts stable before extracting any context into an external service
7. do not mistake event-driven design for mandatory microservices

## MVP-First Rule

Build the first working path before building the perfect framework around it.

That means:

1. deliver the smallest serious vertical slice first
2. prove the workflow before adding extra abstractions
3. refactor toward better structure as real duplication and pressure appear
4. keep the codebase easy to read while it grows

## File and Module Discipline

1. prefer small focused files
2. avoid files that drift beyond 500 to 700 lines
3. if a file becomes large, split it into little chunk structures with clear names and ownership
4. split by responsibility, not by artificial ceremony
5. shared code must earn its place through real reuse

## Engine Rule

Isolated engines are allowed only when they solve a reusable runtime concern such as:

1. event delivery
2. workflow orchestration
3. inventory movement logic
4. sync infrastructure
5. rules execution

Do not create an engine just to rename ordinary app logic.

## Recommended First Technical Shape

Phase 1 should still start as one deployable modular monolith with:

1. one API and web runtime
2. one worker runtime for async jobs and integration delivery
3. one database
4. one cache or queue
5. one shared event contract layer

That gives enough structure for scale without paying distributed-system cost too early.

## Auto-Update and Release Strategy

Auto-update should be platform-managed, not ad hoc shell scripting.

Required release components:

1. versioned build artifacts
2. changelog and migration plan
3. database migration runner
4. rollback-aware deployment process
5. health checks before and after release
6. maintenance mode or tenant-safe rolling update strategy

Recommended update model:

1. CI builds signed release artifacts
2. server pulls a release bundle, not raw git state
3. migration prechecks run before app switch
4. blue-green or rolling deployment is preferred for production
5. rollback returns both application version and compatible migration state where possible

## Live Deployment Strategy

Preferred production baseline:

1. containerized services
2. reverse proxy
3. managed database
4. managed object storage for media and backups
5. background worker runtime separate from web runtime
6. scheduled backups and health monitors

Minimum production services:

1. web app
2. API app
3. worker app
4. database
5. cache or queue
6. reverse proxy
7. monitoring and logging

## UI and Design System Direction

The UI must support dense enterprise operations without becoming visually stale.

Design system requirements:

1. token-based color, spacing, radius, typography, and motion
2. reusable primitives for forms, tables, filters, drawers, dialogs, tabs, badges, toasts, and charts
3. consistent operator shell with app switcher, tenant switcher, quick actions, notifications, and search
4. responsive behavior that still respects desktop-heavy ERP workflows
5. technical-name and component ownership discipline for inspectable surfaces

Enterprise UI rules:

1. list, detail, and upsert workflows must feel systematic across apps
2. tables and filters are first-class, not afterthoughts
3. keyboard-heavy workflows must be considered for billing and warehouse
4. color and typography should feel premium and operational, not generic template UI

## Suggested Build Order

1. structure and workspace foundation
2. auth, tenant, and permissions foundation
3. shared UI package and shell
4. billing baseline
5. CRM baseline
6. warehouse baseline
7. ecommerce baseline
8. integrations baseline
9. marketing baseline
10. analytics, automation, and advanced workflows
