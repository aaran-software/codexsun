import type { AppManifest } from '@codexsun/core'

const apiAppManifest: AppManifest = {
  id: 'api',
  name: 'API',
  kind: 'platform',
  description:
    'Shared API composition that separates internal app contracts from external software contracts.',
  entry: 'cxsun',
  surfaces: {
    internalApi: true,
    externalApi: true,
  },
}

export { apiAppManifest }
