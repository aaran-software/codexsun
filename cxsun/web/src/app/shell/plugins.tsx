import { defineShellModule } from '@codexsun/core'
import { sitesShellModule } from '@sites/plugin'
import { WorkspacePage } from './module-pages'
import type { ShellModuleRegistration } from './registration'

const hostShellModules: readonly ShellModuleRegistration[] = [
  {
    ...defineShellModule({
      id: 'workspace',
      title: 'Workspace',
      navLabel: 'Workspace',
      path: '/',
      summary: 'Shell composition, workspace visibility, and orchestration entry.',
      description:
        'The cxsun host owns app registration, route mounting, and API orchestration for plugin apps.',
      group: 'foundation',
    }),
    element: <WorkspacePage />,
  },
]

const frontendPlugins: readonly ShellModuleRegistration[] = [sitesShellModule]

function createFrontendPluginRegistry() {
  return [...hostShellModules, ...frontendPlugins]
}

export { createFrontendPluginRegistry, frontendPlugins, hostShellModules }
