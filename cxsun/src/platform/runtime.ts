import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createEventBus, type EventBus } from '@codexsun/core'
import {
  createHealthModule,
  type HealthStatus,
} from '../modules/health/health-module'
import { getPlatformServerConfig, type PlatformServerConfig } from './config'
import type { PlatformEvents } from './events'
import { applyCorsHeaders, readJsonBody, sendJson } from './http/response'
import {
  canServeStaticFile,
  resolveStaticAssetPath,
  serveStaticFile,
} from './http/static'
import type { PlatformModule } from './modules'
import { createPlatformRoutes } from './routes'

type PlatformRuntime = {
  runtimeId: string
  modules: readonly PlatformModule[]
  eventBus: EventBus<PlatformEvents>
  routes: ReturnType<typeof createPlatformRoutes>
  start: () => Promise<void>
  stop: () => Promise<void>
  getUrl: () => string
  checkHealth: () => HealthStatus
}

function createPlatformRuntime(
  runtimeId = 'cxsun-runtime',
  config: PlatformServerConfig = getPlatformServerConfig()
): PlatformRuntime {
  const eventBus = createEventBus<PlatformEvents>()
  const modules: readonly PlatformModule[] = [createHealthModule()]
  const startedAt = new Date()
  const routes = createPlatformRoutes(startedAt)

  for (const platformModule of modules) {
    platformModule.register(eventBus)
  }

  const server = createServer(async (request, response) => {
    try {
      applyCorsHeaders(response, config.allowedOrigin)

      if (request.method === 'OPTIONS') {
        response.writeHead(204)
        response.end()
        return
      }

      const url = new URL(request.url ?? '/', `http://${request.headers.host}`)
      const body = request.method === 'POST' ? await readJsonBody(request) : {}
      const canServeStaticMethod =
        request.method === 'GET' || request.method === 'HEAD'
      const route = routes.find(
        (candidate) =>
          candidate.method === request.method && candidate.path === url.pathname
      )

      if (!route) {
        const assetPath = resolveStaticAssetPath(config.publicDir, url.pathname)

        if (
          canServeStaticMethod &&
          assetPath &&
          canServeStaticFile(assetPath)
        ) {
          serveStaticFile(response, assetPath, request.method === 'GET')
          return
        }

        const spaEntryPath = resolveStaticAssetPath(
          config.publicDir,
          '/index.html'
        )

        if (
          canServeStaticMethod &&
          spaEntryPath &&
          canServeStaticFile(spaEntryPath) &&
          !url.pathname.startsWith('/api/')
        ) {
          serveStaticFile(response, spaEntryPath, request.method === 'GET')
          return
        }

        sendJson(response, 404, {
          error: 'Route not found.',
        })
        return
      }

      const result = await route.handler({
        request,
        response,
        url,
        body,
      })

      sendJson(response, result.statusCode, result.payload)
    } catch (error) {
      sendJson(response, 500, {
        error:
          error instanceof Error ? error.message : 'Unexpected server error.',
      })
    }
  })

  server.on('clientError', (_, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
  })

  return {
    runtimeId,
    modules,
    eventBus,
    routes,
    async start() {
      if (server.listening) {
        return
      }

      await new Promise<void>((resolve, reject) => {
        server.once('error', reject)
        server.listen(config.port, config.host, () => {
          server.off('error', reject)
          resolve()
        })
      })

      await eventBus.emit('platform.started', {
        runtimeId,
        moduleIds: modules.map((platformModule) => platformModule.id),
      })
    },
    async stop() {
      if (!server.listening) {
        return
      }

      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }

          resolve()
        })
      })
    },
    getUrl() {
      const address = server.address() as AddressInfo | null
      const port = address?.port ?? config.port

      return `http://${config.host}:${port}`
    },
    checkHealth() {
      return {
        runtimeId,
        status: 'ok',
      }
    },
  }
}

export { createPlatformRuntime }
export type { PlatformRuntime }
