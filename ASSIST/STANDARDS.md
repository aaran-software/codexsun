# Codexsun - Engineering Standards

## Architecture

- Keep the monorepo modular.
- Preserve clear boundaries between orchestration, API, frontend, and shared assets.
- Prefer configuration-driven infrastructure wiring over hard-coded environment assumptions.

## Backend

- Use dependency injection for infrastructure services.
- Keep API contracts explicit and strongly typed.
- Prefer health checks and typed configuration for infrastructure dependencies.

## Infrastructure

- Standardize local development ports across services.
- Keep container configuration under root infrastructure folders.
- Persist stateful container data with named volumes.
- Store local development environment values in dedicated env files.

## Quality

- Ensure the solution builds successfully.
- Add automated tests for new infrastructure-critical behavior.
- Update repository documentation when structure or runtime dependencies change.
