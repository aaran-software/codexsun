# Apps

This folder holds plugin apps only.

Rules:

- `cxsun` is the only host and orchestration entrypoint
- apps under `apps/` can own behavior, routes, pages, helpers, and app contracts
- apps under `apps/` cannot become standalone host entrypoints
- backend behavior from apps mounts through `cxsun/src`
- frontend behavior from apps mounts through `cxsun/web`
- `apps/api` owns shared API composition for internal and external surfaces

Current apps:

- `api`
- `billing`
- `cli`
- `ecommerce`
- `sites`
