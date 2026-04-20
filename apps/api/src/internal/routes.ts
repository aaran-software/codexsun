import type { AppManifest } from '@codexsun/core'
import type { PlatformRouteDefinition } from '../../../../cxsun/src/platform/http/routes'
import {
  getSystemUpdateStatus,
  runSystemUpdateCommand,
  verifyUpdateSecret,
} from '../system-update/service'

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
    {
      method: 'GET',
      path: '/api/internal/system-update/status',
      summary: 'Internal deployment update status for host-side operations.',
      handler() {
        return {
          statusCode: 200,
          payload: getSystemUpdateStatus(),
        }
      },
    },
    {
      method: 'POST',
      path: '/api/internal/system-update/run',
      summary: 'Internal deployment update trigger when explicitly enabled.',
      async handler({ request }) {
        if (!verifyUpdateSecret(request.headers['x-codexsun-update-key'])) {
          return {
            statusCode: 403,
            payload: {
              error: 'A valid x-codexsun-update-key header is required.',
            },
          }
        }

        return runSystemUpdateCommand()
      },
    },
  ]
}

export { createInternalApiRoutes }
