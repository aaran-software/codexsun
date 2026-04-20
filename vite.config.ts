import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const cxsunWebDir = path.resolve(rootDir, './cxsun/web')
const corePackageEntry = path.resolve(rootDir, './packages/core/src/index.ts')

// https://vite.dev/config/
export default defineConfig({
  root: cxsunWebDir,
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
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4174',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.resolve(rootDir, './dist'),
    emptyOutDir: true,
  },
})
