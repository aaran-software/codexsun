import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backendTarget = process.env.SERVER_HTTPS || process.env.SERVER_HTTP || "http://localhost:7021"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined
          }

          if (id.includes("react-dom") || id.includes("react")) {
            return "react-vendor"
          }

          if (id.includes("@base-ui") || id.includes("lucide-react") || id.includes("class-variance-authority")) {
            return "ui-vendor"
          }

          if (id.includes("recharts") || id.includes("embla-carousel-react") || id.includes("react-day-picker")) {
            return "feature-vendor"
          }

          return "vendor"
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT ?? 7023),
    strictPort: true,
    proxy: {
      // Proxy API calls to the app service
      '/api': {
        target: backendTarget,
        changeOrigin: true
      },
      '/auth': {
        target: backendTarget,
        changeOrigin: true
      },
      '/common': {
        target: backendTarget,
        changeOrigin: true
      },
      '/contacts': {
        target: backendTarget,
        changeOrigin: true
      },
      '/products': {
        target: backendTarget,
        changeOrigin: true
      },
      '/storefront': {
        target: backendTarget,
        changeOrigin: true
      },
      '/cart': {
        target: backendTarget,
        changeOrigin: true
      },
      '/orders': {
        target: backendTarget,
        changeOrigin: true
      },
      '/invoices': {
        target: backendTarget,
        changeOrigin: true
      },
      '/payments': {
        target: backendTarget,
        changeOrigin: true
      },
      '/vendor-payouts': {
        target: backendTarget,
        changeOrigin: true
      },
      '/vendors': {
        target: backendTarget,
        changeOrigin: true
      },
      '/company': {
        target: backendTarget,
        changeOrigin: true
      },
      '/inventory': {
        target: backendTarget,
        changeOrigin: true
      },
      '/analytics': {
        target: backendTarget,
        changeOrigin: true
      },
      '/promotions': {
        target: backendTarget,
        changeOrigin: true
      },
      '/coupons': {
        target: backendTarget,
        changeOrigin: true
      },
      '/shipments': {
        target: backendTarget,
        changeOrigin: true
      },
      '/returns': {
        target: backendTarget,
        changeOrigin: true
      },
      '/refunds': {
        target: backendTarget,
        changeOrigin: true
      },
      '/notifications': {
        target: backendTarget,
        changeOrigin: true
      },
      '/media': {
        target: backendTarget,
        changeOrigin: true
      },
      '/monitoring': {
        target: backendTarget,
        changeOrigin: true
      }
    }
  }
})
