# Sites App

`apps/sites` is a plugin website app mounted by `cxsun`.

Current structure:

- `shared/`
- `src/`
- `web/`

Rules:

- `src/` owns site-specific API behavior and manifest metadata
- `web/` owns site-specific React routes and UI behavior
- `shared/` owns site-only content and contracts
- `cxsun/src` mounts the site API routes
- `cxsun/web` mounts the site frontend routes
