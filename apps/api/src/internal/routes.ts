import type { AppManifest } from '@codexsun/core'
import type { PlatformRouteDefinition } from '../../../../cxsun/src/platform/http/routes'

type CreateInternalApiRoutesInput = {
  host: AppManifest
  apps: readonly AppManifest[]
  appRoutes: readonly PlatformRouteDefinition[]
}

function createInternalApiRoutes({
  host,
  apps,
  appRoutes,
}: CreateInternalApiRoutesInput): PlatformRouteDefinition[] {
  return [
    {
      method: 'GET',
      path: '/api/internal/apps',
      summary: 'Internal registry for the cxsun host and plugin apps.',
      handler() {
        return {
          statusCode: 200,
          payload: {
            scope: 'internal',
            host,
            apps,
          },
        }
      },
    },
    {
      method: 'GET',
      path: '/api/internal/routes',
      summary: 'Internal view of the mounted application routes.',
      handler() {
        return {
          statusCode: 200,
          payload: {
            scope: 'internal',
            routes: appRoutes.map((route) => ({
              method: route.method,
              path: route.path,
              summary: route.summary,
            })),
          },
        }
      },
    },
  ]
}

export { createInternalApiRoutes }
