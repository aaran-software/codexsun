pnpm add -D @types/sqlite3 --filter @codexsun/cortex
pnpm list -r --depth -1
pnpm add -D @types/node --filter @codexsun/cortex





pnpm add -D @fastify/static --filter @codexsun/cortex

pnpm add -D fastify-plugin --filter @codexsun/cortex


pnpm add -Dw vite @vitejs/plugin-react



pnpm add -D @fastify/static --filter @codexsun/app-cxsun

pnpm add -D fastify-plugin --filter @codexsun/app-cxsun

pnpm add -D chalk -w


pnpm add -D pino chalk -w
pnpm add -D pino-pretty -w


pnpm add -D @fastify/cors@9 -w
pnpm add -D tailwindcss -w


pnpm add -D reflect-metadata -w


grep -R "const mdb" cortex/database to find dupicates

set npm_config_build_from_source=true
pnpm install

>Ignored build scripts: @swc/core, @tailwindcss/oxide, core-js, cpu-features, esbuild, sqlite3, ssh2.   │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts

pnpm approve-builds

then

pnpm install
