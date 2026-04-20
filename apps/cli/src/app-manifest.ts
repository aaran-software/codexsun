import type { AppManifest } from '@codexsun/core'

const cliAppManifest: AppManifest = {
  id: 'cli',
  name: 'CLI',
  kind: 'ops',
  description:
    'Operational tooling for repository workflows, version sync, and immediate git push flows.',
  entry: 'cxsun',
  surfaces: {
    cli: true,
    internalApi: true,
  },
}

export { cliAppManifest }
