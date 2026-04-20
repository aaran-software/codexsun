import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const cxsunWebDir = path.resolve(rootDir, './cxsun/web')
const corePackageEntry = path.resolve(rootDir, './packages/core/src/index.ts')
const sitesWebDir = path.resolve(rootDir, './apps/sites/web')
const sitesSharedDir = path.resolve(rootDir, './apps/sites/shared')

export default defineConfig({
  resolve: {
    alias: {
      '@codexsun/core': corePackageEntry,
      '@cxsun': path.resolve(cxsunWebDir, './src'),
      '@sites': path.resolve(sitesWebDir, './src'),
      '@sites-shared': sitesSharedDir,
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    include: [
      'cxsun/web/src/**/*.test.{ts,tsx}',
      'cxsun/src/**/*.test.ts',
      'apps/sites/src/**/*.test.ts',
      'apps/sites/web/src/**/*.test.{ts,tsx}',
      'packages/core/src/**/*.test.ts',
    ],
    exclude: ['tests/e2e/**'],
  },
})
