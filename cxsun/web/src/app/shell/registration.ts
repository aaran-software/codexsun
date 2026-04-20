import type { ReactNode } from 'react'
import type { ShellModuleDefinition } from '@codexsun/core'

type ShellChildRouteRegistration = {
  index?: boolean
  path?: string
  element: ReactNode
}

type ShellModuleRegistration = ShellModuleDefinition & {
  element: ReactNode
  children?: readonly ShellChildRouteRegistration[]
}

export type { ShellChildRouteRegistration, ShellModuleRegistration }
