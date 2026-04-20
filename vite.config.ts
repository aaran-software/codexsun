import path from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const cxsunWebDir = path.resolve(rootDir, './cxsun/web')
const corePackageEntry = path.resolve(rootDir, './packages/core/src/index.ts')
const packageManifest = JSON.parse(
  readFileSync(path.resolve(rootDir, './package.json'), 'utf8')
) as { version: string }

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')

  return {
    root: cxsunWebDir,
    envDir: rootDir,
    define: {
      __CXSUN_APP_VERSION__: JSON.stringify(packageManifest.version),
    },
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@codexsun/core': corePackageEntry,
        '@cxsun': path.resolve(cxsunWebDir, './src'),
        '@sites': path.resolve(rootDir, './apps/sites/web/src'),
        '@sites-shared': path.resolve(rootDir, './apps/sites/shared'),
      },
    },
    server: {
      host: env.FRONTEND_HOST || '127.0.0.1',
      port: Number(env.FRONTEND_HTTP_PORT || '4173'),
      proxy: {
        '/api': {
          target: `http://${env.APP_PROXY_HOST || '127.0.0.1'}:${env.CXSUN_SERVER_PORT || env.APP_HTTP_PORT || '4174'}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: path.resolve(rootDir, './dist'),
      emptyOutDir: true,
    },
  }
})
