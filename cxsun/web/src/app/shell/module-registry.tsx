import type { ReactNode } from 'react'
import {
  createShellRegistry,
  defineShellModule,
  type ShellModuleDefinition,
} from '@codexsun/core'
import {
  sitesShellModule,
  type ShellChildRouteRegistration,
} from '@sites/plugin'
import { WorkspacePage } from './module-pages'

type ShellModuleRegistration = ShellModuleDefinition & {
  element: ReactNode
  children?: readonly ShellChildRouteRegistration[]
}

const shellModules: readonly ShellModuleRegistration[] = [
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
  sitesShellModule,
]

const shellRegistry = createShellRegistry(shellModules)

export { shellRegistry }
export type { ShellModuleRegistration }
