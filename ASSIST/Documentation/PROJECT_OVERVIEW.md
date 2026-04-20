# Project Overview

## Mission

Build a scalable ERP platform that can serve:

1. multiple tenants
2. multiple industries
3. multiple vendors
4. businesses ranging from small to large operations

## Product Scope

The target platform covers:

1. billing and finance
2. CRM
3. ecommerce
4. warehouse and inventory
5. marketing and social operations
6. live integrations such as Tally and ERPNext

## Build Strategy

The build strategy is:

1. start as a modular monolith
2. model core domains as bounded contexts
3. connect modules through public contracts and events
4. keep the system deployable as one main house first, with root-level `cxsun` owning shell orchestration and composition
5. extract infrastructure or services only when necessary

## Current Stage

The repository is still in the planning and structure-foundation stage.

Current priorities are:

1. extend the backend bootstrap from `cxsun/src` into real platform modules
2. grow `apps/sites` from the first portfolio surface into a repeatable plugin app pattern mounted by `cxsun`
3. define event model and module communication rules
4. add the first domain registrations on top of the shell and core foundation
5. define deployment and auto-update posture

Current shared UI rule:

1. shared UI components and style tokens belong in `packages/ui`
2. apps should consume shared primitives from that package instead of duplicating them locally

Current shared core rule:

1. shell contracts and registry helpers belong in `packages/core`
2. the typed in-process event bus also belongs in `packages/core`
3. apps should consume those contracts while keeping route elements and business logic app-owned
