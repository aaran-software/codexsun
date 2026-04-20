import type { AppManifest } from '@codexsun/core'
import type { PlatformRouteDefinition } from '../../../../cxsun/src/platform/http/routes'

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
  ]
}

export { createExternalApiRoutes }
