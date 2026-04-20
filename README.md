# Codexsun

Modular ERP platform scaffold under active structure-first development.

Current repo baseline:

- `cxsun/web` is the only frontend startup entrypoint
- `cxsun/src` is the only backend startup entrypoint
- `apps/sites` is the first website plugin app mounted through `cxsun`
- `apps/api` owns internal and external API composition
- `apps/cli` is the first operational plugin app and owns `github` and `github:now`
- `packages/core` is the shared workspace package for shell contracts and registry helpers
- `packages/ui` is a real npm workspace package exposed as `@codexsun/ui`

Current validation commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Primary architecture and workflow rules live under `ASSIST/`.
