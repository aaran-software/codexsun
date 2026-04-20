# ASSIST Guide

## Purpose

`ASSIST/` is the operating manual for building this ERP platform.

The repository does not yet contain the full platform scaffold, but the approved target direction is now fixed:

1. modular monolith
2. domain-driven design
3. event-driven architecture
4. multi-tenant, multi-industry, multi-vendor ERP platform

Current implementation may still be smaller than the target. `ASSIST` must keep that distinction explicit.

## Read First

Before meaningful work, read in this order:

1. `ASSIST/README.md`
2. `ASSIST/AI_RULES.md`
3. `ASSIST/Documentation/ARCHITECTURE.md`
4. `ASSIST/Documentation/PROJECT_OVERVIEW.md`
5. `ASSIST/Documentation/PLATFORM_BLUEPRINT.md`
6. `ASSIST/Documentation/IMPLEMENTATION_ROADMAP.md`
7. `ASSIST/Documentation/SETUP_AND_RUN.md`
8. task-relevant files under `ASSIST/Discipline`
9. `ASSIST/Execution/TASK.md`
10. `ASSIST/Execution/PLANNING.md`

## Folder Structure

- `AI_RULES.md`: top-level implementation rules
- `Documentation/`: current-state architecture, target blueprint, roadmap, setup, contribution, and changelog
- `Discipline/`: coding, testing, review, release, and versioning discipline
- `Execution/`: active task tracking and planning

## Documentation Model

Each doc must own one concern:

1. `ARCHITECTURE.md`
   current structure and approved target direction
2. `PLATFORM_BLUEPRINT.md`
   target ERP architecture model
3. `IMPLEMENTATION_ROADMAP.md`
   phased execution order
4. `SETUP_AND_RUN.md`
   actual available commands and current setup path
5. `CONTRIBUTING.md`
   workflow discipline

## Operating Rules

1. keep current-state docs honest
2. keep target-state docs explicit
3. do not mix implemented architecture with planned architecture
4. do not duplicate the same rules across multiple docs
5. keep execution docs limited to active work
6. when architecture posture changes, update `ASSIST` in the same batch

## Host And Plugin Rules

These rules are strict and non-optional:

1. `cxsun` is the only host entrypoint for backend startup and frontend startup
2. every product app under `apps/` is a plugin app, not a standalone host
3. app-owned behavior must stay inside the app, but app startup must be orchestrated by `cxsun`
4. no app may own its own top-level server bootstrap when the behavior belongs to the shared host
5. no app may own its own top-level frontend bootstrap when the behavior belongs to the shared host
6. app frontend code may exist under the app boundary, but route mounting must happen through `cxsun/web`
7. app backend code may exist under the app boundary, but HTTP mounting must happen through `cxsun/src`
8. `apps/api` owns application API composition only, with two explicit surfaces:
9. internal API is for first-party app-to-app communication inside this system
10. external API is for software outside this system connecting to this application
11. app APIs must be registered into the shared API composition instead of exposing disconnected route trees
12. if an app needs CLI behavior, jobs, or web behavior, it still remains a plugin app under `apps/`

## Mandatory Delivery Discipline

For every meaningful implementation or refactor:

1. create or update the task first
2. create or update the plan first
3. implement only after task and plan exist
4. update the changelog before commit
5. increment the serial reference
6. run lint, type-safety validation, and tests before commit
7. use the serial in the commit message

## Strict Engineering Posture

These rules are strict:

1. build the MVP flow first
2. do not overengineer before the first working path exists
3. keep code modular, readable, and easy to change
4. keep code app-owned or module-owned with clear ownership
5. introduce isolated engines only when there is a real reusable runtime concern
6. split large files early before they become maintenance debt

## What Does Not Belong Here

- stale historical instructions
- duplicate architecture explanations
- speculative features presented as implemented
- abandoned plans left as active guidance
