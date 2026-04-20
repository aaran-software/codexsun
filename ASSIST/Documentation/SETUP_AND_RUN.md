# Setup And Run

## Current Reality

These commands actually exist today:

```bash
npm install
npm run dev
npm run typecheck
npm run test
npm run test:e2e
npm run test:e2e:docker
npm run build
npm run lint
npm run preview
npm run github
npm run github:now
npm run docker:build
npm run docker:up
npm run docker:down
```

Current frontend entry now lives under:

1. `cxsun/web/index.html`
2. `cxsun/web/src/main.tsx`
3. `cxsun/web/src/App.tsx`

Current shared UI entry now lives under:

1. `packages/ui/src/components`
2. `packages/ui/src/lib`
3. `packages/ui/src/styles/globals.css`
4. package name: `@codexsun/ui`

Current backend starting point scaffold now lives under:

1. `cxsun/src`
2. `cxsun/src/server.ts`
3. `cxsun/src/platform/runtime.ts`
4. `cxsun/src/modules/health/health-module.ts`
5. `cxsun/src/platform/plugins.ts`
6. `cxsun/src/platform/http/static.ts`

Current plugin apps live under:

1. `apps/api`
2. `apps/cli`
3. `apps/sites`

Current frontend plugin registration now lives under:

1. `cxsun/web/src/app/shell/plugins.tsx`
2. `cxsun/web/src/app/shell/registration.ts`

Current deployment assets now live under:

1. `Dockerfile`
2. `docker-compose.yml`
3. `.container/`
4. `.github/workflows/ci-cd.yml`

## Current Validation Commands

Current working validation commands:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build`
5. `npm run test:e2e`
6. `npm run test:e2e:docker`

Current frontend local alias rule:

1. use `@cxsun/*` for `cxsun/web/src/*`
2. use `@sites/*` for `apps/sites/web/src/*`
3. use `@codexsun/ui/*` for shared UI package imports

## Planned Discipline Baseline

The mandatory target validation flow before commit is:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`

For browser-level smoke coverage, use:

1. `npm run test:e2e`
