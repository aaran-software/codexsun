import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import * as path from "node:path";


// Set which app to run/build via APP_DIR env; defaults to apps/cxsun
const APP_DIR = process.env.APP_DIR ?? 'apps/cxsun'


export default defineConfig({
    root: path.resolve(__dirname, APP_DIR),
    plugins: [
        react(),
    ],
    server: {
        port: 5173,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            },
            "/sse": "http://localhost:3000",
            "/ws": {
                target: "ws://localhost:3000",
                ws: true
            },
        },
    },
    build: {
        outDir: path.resolve(__dirname, 'dist', APP_DIR.replace(/\//g, '_')),
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, APP_DIR, 'src'),
        },
    },
    // ✅ Prevent esbuild from bundling native Oxide + LightningCSS
    optimizeDeps: {
        exclude: [
            '@tailwindcss/oxide',
            '@tailwindcss/oxide-win32-x64-msvc',
        ],
    },
    ssr: {
        noExternal: [
            '@tailwindcss/oxide',
        ],
    },
})