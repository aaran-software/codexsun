import { createExternalApiRoutes } from '../../../apps/api/src/external/routes'
import { createInternalApiRoutes } from '../../../apps/api/src/internal/routes'
import { createSitesApiRoutes } from '../../../apps/sites/src/api-routes'
import type { PlatformRouteDefinition } from './http/routes'
import { createAppSuite } from './app-suite'

function createPlatformRoutes(startedAt: Date) {
  const appSuite = createAppSuite()
  const siteRoutes = createSitesApiRoutes(startedAt)

  const appRoutes: PlatformRouteDefinition[] = [
    ...siteRoutes.internalRoutes,
    ...siteRoutes.externalRoutes,
  ]

  return [
    {
      method: 'GET',
      path: '/api/health',
      summary: 'Host health for the cxsun orchestration runtime.',
      handler() {
        return {
          statusCode: 200,
          payload: {
            app: appSuite.host.id,
            status: 'ok',
            startedAt: startedAt.toISOString(),
            apps: appSuite.apps.map((app) => app.id),
          },
        }
      },
    },
    ...createInternalApiRoutes({
      host: appSuite.host,
      apps: appSuite.apps,
      appRoutes,
    }),
    ...createExternalApiRoutes(appSuite),
    ...appRoutes,
  ] satisfies PlatformRouteDefinition[]
}

export { createPlatformRoutes }
