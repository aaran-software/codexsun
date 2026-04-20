import type { AppManifest } from '@codexsun/core'
import { apiAppManifest } from '../../../apps/api/src/app-manifest'
import { cliAppManifest } from '../../../apps/cli/src/app-manifest'
import { createSitesApiRoutes, sitesAppManifest } from '../../../apps/sites/src/app-manifest'
import type { PlatformRouteDefinition } from './http/routes'

type BackendPluginRouteSet = {
  internalRoutes: readonly PlatformRouteDefinition[]
  externalRoutes: readonly PlatformRouteDefinition[]
}

type BackendPluginRegistration = {
  manifest: AppManifest
  createRoutes?: (startedAt: Date) => BackendPluginRouteSet
}

const backendPlugins: readonly BackendPluginRegistration[] = [
  {
    manifest: apiAppManifest,
  },
  {
    manifest: cliAppManifest,
  },
  {
    manifest: sitesAppManifest,
    createRoutes: createSitesApiRoutes,
  },
]

function createBackendPluginRegistry(startedAt: Date) {
  const apps = backendPlugins.map((plugin) => plugin.manifest)
  const routeSets = backendPlugins
    .map((plugin) => plugin.createRoutes?.(startedAt))
    .filter((routeSet): routeSet is BackendPluginRouteSet => Boolean(routeSet))

  const appRoutes: PlatformRouteDefinition[] = routeSets.flatMap((routeSet) => [
    ...routeSet.internalRoutes,
    ...routeSet.externalRoutes,
  ])

  return {
    apps,
    appRoutes,
  }
}

export { backendPlugins, createBackendPluginRegistry }
export type { BackendPluginRegistration, BackendPluginRouteSet }
