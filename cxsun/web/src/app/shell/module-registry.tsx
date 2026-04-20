import { createShellRegistry } from '@codexsun/core'
import { createFrontendPluginRegistry } from './plugins'
import type { ShellModuleRegistration } from './registration'

const shellRegistry = createShellRegistry(createFrontendPluginRegistry())

export { shellRegistry }
export type { ShellModuleRegistration }
