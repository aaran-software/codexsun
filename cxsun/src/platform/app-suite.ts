import type { AppManifest } from '@codexsun/core'
import { backendPlugins } from './plugins'

const cxsunAppManifest: AppManifest = {
  id: 'cxsun',
  name: 'Cxsun',
  kind: 'host',
  description:
    'Host orchestration app that mounts backend routes and frontend routes for every plugin app.',
  entry: 'cxsun',
  surfaces: {
    web: true,
    internalApi: true,
    externalApi: true,
  },
}

function createAppSuite() {
  const apps = backendPlugins.map((plugin) => plugin.manifest)

  return {
    host: cxsunAppManifest,
    apps,
  }
}

export { createAppSuite, cxsunAppManifest }
