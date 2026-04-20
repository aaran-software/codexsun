import type { AppManifest } from '@codexsun/core'
import { apiAppManifest } from '../../../apps/api/src/app-manifest'
import { cliAppManifest } from '../../../apps/cli/src/app-manifest'
import { sitesAppManifest } from '../../../apps/sites/src/app-manifest'

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
  const apps = [apiAppManifest, cliAppManifest, sitesAppManifest] as const

  return {
    host: cxsunAppManifest,
    apps,
  }
}

export { createAppSuite, cxsunAppManifest }
