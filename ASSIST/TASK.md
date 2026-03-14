# Current Task

## Prompt

001_INITIAL_INFRASTRUCTURE_SETUP

## Objective

Implement the initial infrastructure setup for Codexsun with Docker, PostgreSQL, Redis, Aspire alignment, a database connectivity test project, naming corrections, and standardized ports.

## Constraints

- Preserve the existing `cx.AppHost`, `cxserver`, and `cxstore` service roles.
- Keep module boundaries intact.
- Do not modify unrelated modules.
- Follow Clean Architecture and repository documentation rules.

## Plan

1. Audit current ports, naming, and infrastructure references.
2. Add root `.container` assets for PostgreSQL and Redis.
3. Align Aspire, backend, and frontend configuration with ports `7020` through `7025`.
4. Add `cxtest` and validate PostgreSQL connectivity with `SELECT 1`.
5. Update solution and documentation, then verify build, containers, and tests.
