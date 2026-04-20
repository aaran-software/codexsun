# Cxsun

Root-level `cxsun` is the only host and orchestration app for the platform.

Structure:

- `src/` backend startup, HTTP host, app registry, and API mounting
- `web/` frontend startup, shell routing, and plugin route mounting

Scope:

- workspace composition
- app registration
- backend route orchestration
- frontend route orchestration
- visibility resolution
- shell routing

Non-goal:

- app-specific billing business rules
- app-specific sites business rules
- app-specific ecommerce business rules
