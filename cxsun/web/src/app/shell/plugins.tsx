import { defineShellModule } from '@codexsun/core'
import { sitesShellModule } from '@sites/plugin'
import {
  AuthDashboardPage,
  DashboardPage,
  DeskPage,
  SystemUpdatePage,
  WorkspacePage,
} from './module-pages'
import type { ShellModuleRegistration } from './registration'

const hostShellModules: readonly ShellModuleRegistration[] = [
  {
    ...defineShellModule({
      id: 'workspace',
      title: 'Workspace',
      navLabel: 'Workspace',
      path: '/workspace',
      summary:
        'Shell composition, workspace visibility, and orchestration entry.',
      description:
        'The cxsun host owns app registration, route mounting, and API orchestration for plugin apps.',
      group: 'foundation',
    }),
    element: <WorkspacePage />,
  },
  {
    ...defineShellModule({
      id: 'dashboard',
      title: 'Dashboard',
      navLabel: 'Dashboard',
      path: '/dashboard',
      summary: 'Suite-level app launcher and framework service overview.',
      description:
        'The dashboard mirrors the reference app suite control surface with cards for apps, services, and access.',
      group: 'operations',
    }),
    element: <DashboardPage />,
  },
  {
    ...defineShellModule({
      id: 'desk',
      title: 'Desk',
      navLabel: 'Desk',
      path: '/desk',
      summary: 'Desktop-style operator workflow surface.',
      description:
        'The desk provides a compact execution board for operational work and future task APIs.',
      group: 'operations',
    }),
    element: <DeskPage />,
  },
  {
    ...defineShellModule({
      id: 'system-update',
      title: 'System Update',
      navLabel: 'System Update',
      path: '/system-update',
      summary: 'Manual deployment update and release automation bridge.',
      description:
        'The update surface exposes host-side Git sync, Docker rebuild guidance, and guarded API-triggered update hooks.',
      group: 'operations',
    }),
    element: <SystemUpdatePage />,
  },
  {
    ...defineShellModule({
      id: 'auth',
      title: 'Auth',
      navLabel: 'Auth',
      path: '/auth',
      summary: 'Access, roles, permissions, and session posture.',
      description:
        'The auth dashboard stages login policy and access controls for the system frontend.',
      group: 'foundation',
    }),
    element: <AuthDashboardPage />,
  },
]

const frontendPlugins: readonly ShellModuleRegistration[] = [sitesShellModule]

function createFrontendPluginRegistry() {
  return [...hostShellModules, ...frontendPlugins]
}

export { createFrontendPluginRegistry, frontendPlugins, hostShellModules }
