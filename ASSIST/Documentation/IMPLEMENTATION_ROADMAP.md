# Implementation Roadmap

## Purpose

This document turns the platform blueprint into an execution order.

## Phase 1: Structure Foundation

Goal:

Create the repository structure and platform operating model for a modular monolith with DDD and EDA.

Starting posture:

1. simple modules
2. simple event bus
3. clean separation
4. MVP flow first
5. no overengineering

Deliverables:

1. approved monorepo folder structure
2. package and app naming rules
3. environment strategy
4. tenant-aware architecture baseline
5. UI design-system package plan
6. deployment and auto-update operating model
7. bounded context rules
8. event model and outbox plan
9. standard self-contained domain folder contract
10. engineering discipline for file size, module ownership, and engine boundaries

Key decisions:

1. choose workspace tooling
2. choose backend framework
3. choose database strategy
4. choose queue and worker strategy
5. choose deployment model
6. define the first bounded contexts
7. define domain-event vs integration-event rules
8. define the initial in-process event bus contract
9. define the standard domain module shape:
   `entities`, `services`, `repositories`, `events`, `handlers`, `api`, `dto`, `types`, `constants`, `validators`, `mappers`, `database/migration`, `database/seeder`

## Phase 2: Platform Core

Goal:

Build the modular-monolith backbone before business-heavy apps expand.

Deliverables:

1. auth and session model
2. tenant model
3. role and permission model
4. app registration model
5. shared contracts and config packages
6. shell app and navigation baseline
7. event bus and outbox baseline
8. worker execution baseline

## Phase 3: UI System

Goal:

Create the design-system and operator shell foundation.

Deliverables:

1. tokens
2. layout shells
3. form primitives
4. data table system
5. filter patterns
6. feedback patterns
7. page composition standards

## Phase 4: Billing First

Goal:

Ship the accounting backbone as the first deep bounded context because other workflows eventually connect into it.

Deliverables:

1. masters
2. vouchers
3. sales and purchase flows
4. receipt and payment flows
5. journal and contra
6. tax and reporting baseline

## Phase 5: CRM and Conversion

Goal:

Connect lead handling to financial and commercial workflows.

Deliverables:

1. lead management
2. pipeline
3. follow-up system
4. quotation handoff
5. billing conversion linkage

## Phase 6: Warehouse and Inventory

Goal:

Add operational stock control with warehouse-grade workflows.

Deliverables:

1. warehouse hierarchy
2. rack and bin model
3. inward and outward flows
4. stock movement
5. reservation and reconciliation
6. barcode and scan workflows

## Phase 7: Ecommerce

Goal:

Connect catalog and order workflows to billing and warehouse.

Deliverables:

1. product catalog
2. pricing and promotions
3. cart and checkout
4. order lifecycle
5. delivery and return handling

## Phase 8: Integrations

Goal:

Make Tally and ERP sync reliable and observable.

Deliverables:

1. connector management
2. sync queues
3. mapping UI
4. reconciliation workflows
5. retry and failure handling
6. integration event consumers and delivery monitoring

## Phase 9: Marketing and Social

Goal:

Add outbound growth tooling on top of the operational system.

Deliverables:

1. campaign manager
2. social calendar
3. social publishing workflow
4. attribution and performance linkage

## Phase 10: Operations and Scale

Goal:

Harden the platform for serious live usage.

Deliverables:

1. backups
2. update pipeline
3. tenant provisioning
4. audit and observability
5. analytics and automation

## First Phase Immediate Work Items

The next implementation batch should answer these before code expansion:

1. monorepo layout:
   keep root app or move immediately to `apps/` and `packages/`
2. backend stack:
   Node framework, API shape, worker runtime
3. database baseline:
   PostgreSQL or MariaDB, tenancy model, migration tooling
4. queue baseline:
   Redis-based queue or equivalent
5. package management:
   npm workspaces, pnpm, or Turborepo-style orchestration
6. deployment baseline:
   Docker Compose first, then production cluster strategy
7. UI baseline:
   package-owned design system and shell structure
8. domain model baseline:
   identify bounded contexts, aggregates, and cross-context contracts
9. event model baseline:
   define domain events, integration events, outbox, and worker flow
10. module communication policy:
   forbid direct cross-module internals and define public contracts only
