import type { AppManifest } from '@codexsun/core'
import type { PlatformRouteDefinition } from '../../../../cxsun/src/platform/http/routes'
import {
  getSystemUpdateStatus,
  runSystemUpdateCommand,
  verifyUpdateSecret,
} from '../system-update/service'

type CreateExternalApiRoutesInput = {
  host: AppManifest
  apps: readonly AppManifest[]
}

function createExternalApiRoutes({
  host,
  apps,
}: CreateExternalApiRoutesInput): PlatformRouteDefinition[] {
  return [
    {
      method: 'GET',
      path: '/api/external/apps',
      summary: 'External registry of public application surfaces.',
      handler() {
        return {
          statusCode: 200,
          payload: {
            scope: 'external',
            host: {
              id: host.id,
              name: host.name,
            },
            apps: apps.map((app) => ({
              id: app.id,
              name: app.name,
              kind: app.kind,
              description: app.description,
              surfaces: {
                web: app.surfaces.web ?? false,
                externalApi: app.surfaces.externalApi ?? false,
                cli: app.surfaces.cli ?? false,
              },
            })),
          },
        }
      },
    },
    {
      method: 'GET',
      path: '/api/external/system-update/status',
      summary: 'External deployment update status for remote monitors.',
      handler() {
        const status = getSystemUpdateStatus()

        return {
          statusCode: 200,
          payload: {
            app: status.app,
            version: status.version,
            mode: status.mode,
            apiUpdateEnabled: status.apiUpdateEnabled,
            branch: status.branch,
            localHead: status.localHead,
            originHead: status.originHead,
          },
        }
      },
    },
    {
      method: 'POST',
      path: '/api/external/system-update/run',
      summary: 'External deployment update trigger for release automation.',
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

export { createExternalApiRoutes }
