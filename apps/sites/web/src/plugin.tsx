import type { ReactNode } from 'react'
import { defineShellModule, type ShellModuleDefinition } from '@codexsun/core'
import { SiteShell } from './app/site-shell'
import { AboutPage } from './pages/about-page'
import { ContactPage } from './pages/contact-page'
import { HomePage } from './pages/home-page'
import { ServicePage } from './pages/service-page'

type ShellChildRouteRegistration = {
  index?: boolean
  path?: string
  element: ReactNode
}

type ShellModuleRegistration = ShellModuleDefinition & {
  element: ReactNode
  children?: readonly ShellChildRouteRegistration[]
}

const sitesShellModule: ShellModuleRegistration = {
  ...defineShellModule({
    id: 'sites',
    title: 'Sites',
    navLabel: 'Sites',
    path: '/sites',
    summary: 'Plugin website experiences mounted through the cxsun host.',
    description:
      'The sites app owns its pages and API behavior, while cxsun owns startup and orchestration.',
    group: 'sales',
  }),
  element: <SiteShell />,
  children: [
    {
      index: true,
      element: <HomePage />,
    },
    {
      path: 'about',
      element: <AboutPage />,
    },
    {
      path: 'service',
      element: <ServicePage />,
    },
    {
      path: 'contact',
      element: <ContactPage />,
    },
  ],
}

export { sitesShellModule }
export type { ShellChildRouteRegistration, ShellModuleRegistration }
