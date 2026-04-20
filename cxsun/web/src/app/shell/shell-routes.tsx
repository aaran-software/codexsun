import { Navigate, Route, Routes } from 'react-router-dom'
import { shellRegistry } from './module-registry'
import { ShellLayout } from './shell-layout'

function ShellRoutes() {
  const visibleModules = shellRegistry.getVisibleModules()

  return (
    <Routes>
      <Route path="/" element={<ShellLayout />}>
        {visibleModules.map((moduleDefinition) =>
          moduleDefinition.path === '/' ? (
            <Route
              key={moduleDefinition.id}
              index
              element={moduleDefinition.element}
            />
          ) : moduleDefinition.children?.length ? (
            <Route
              key={moduleDefinition.id}
              path={moduleDefinition.path.slice(1)}
              element={moduleDefinition.element}
            >
              {moduleDefinition.children.map((routeDefinition) =>
                routeDefinition.index ? (
                  <Route
                    key={`${moduleDefinition.id}-index`}
                    index
                    element={routeDefinition.element}
                  />
                ) : (
                  <Route
                    key={`${moduleDefinition.id}-${routeDefinition.path ?? 'route'}`}
                    path={routeDefinition.path}
                    element={routeDefinition.element}
                  />
                ),
              )}
            </Route>
          ) : (
            <Route
              key={moduleDefinition.id}
              path={moduleDefinition.path.slice(1)}
              element={moduleDefinition.element}
            />
          ),
        )}
        <Route
          path="*"
          element={<Navigate replace to={shellRegistry.defaultPath} />}
        />
      </Route>
    </Routes>
  )
}

export { ShellRoutes }
