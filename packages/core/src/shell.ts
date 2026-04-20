type ShellModulePath = '/' | `/${string}`

type ShellVisibilityContext = {
  enabledModuleIds?: readonly string[]
}

type ShellModuleDefinition = {
  id: string
  title: string
  navLabel: string
  path: ShellModulePath
  summary: string
  description: string
  group: 'foundation' | 'operations' | 'sales'
}

type ShellRegistry<TModule extends ShellModuleDefinition> = {
  modules: readonly TModule[]
  defaultPath: ShellModulePath
  getVisibleModules: (context?: ShellVisibilityContext) => readonly TModule[]
  getModuleById: (moduleId: string) => TModule | undefined
  getModuleByPathname: (pathname: string) => TModule | undefined
}

function defineShellModule<TModule extends ShellModuleDefinition>(
  moduleDefinition: TModule,
) {
  return moduleDefinition
}

function createShellRegistry<TModule extends ShellModuleDefinition>(
  modules: readonly TModule[],
): ShellRegistry<TModule> {
  if (modules.length === 0) {
    throw new Error('Shell registry requires at least one module.')
  }

  const moduleIds = new Set<string>()
  const modulePaths = new Set<string>()

  for (const moduleDefinition of modules) {
    if (moduleIds.has(moduleDefinition.id)) {
      throw new Error(`Duplicate shell module id: ${moduleDefinition.id}`)
    }

    if (modulePaths.has(moduleDefinition.path)) {
      throw new Error(`Duplicate shell module path: ${moduleDefinition.path}`)
    }

    moduleIds.add(moduleDefinition.id)
    modulePaths.add(moduleDefinition.path)
  }

  const defaultPath = modules[0].path

  return {
    modules,
    defaultPath,
    getVisibleModules(context) {
      if (!context?.enabledModuleIds?.length) {
        return modules
      }

      const enabledModuleIds = new Set(context.enabledModuleIds)

      return modules.filter((moduleDefinition) =>
        enabledModuleIds.has(moduleDefinition.id),
      )
    },
    getModuleById(moduleId) {
      return modules.find((moduleDefinition) => moduleDefinition.id === moduleId)
    },
    getModuleByPathname(pathname) {
      const normalizedPathname =
        pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

      return modules.find(
        (moduleDefinition) => moduleDefinition.path === normalizedPathname,
      )
    },
  }
}

export { createShellRegistry, defineShellModule }
export type { ShellModuleDefinition, ShellRegistry, ShellVisibilityContext }
