import { Navigate, Route, Routes } from 'react-router-dom'
import { shellRegistry } from './module-registry'
import { LoginPage, PublicHomePage } from './public-pages'
import { ShellLayout } from './shell-layout'

function ShellRoutes() {
  const visibleModules = shellRegistry.getVisibleModules()
  const publicSiteModule = visibleModules.find(
    (moduleDefinition) => moduleDefinition.id === 'sites'
  )
  const shellModules = visibleModules.filter(
    (moduleDefinition) => moduleDefinition.id !== 'sites'
  )

  return (
    <Routes>
      <Route index element={<PublicHomePage />} />
      <Route path="/login" element={<LoginPage />} />
      {publicSiteModule?.children?.length ? (
        <Route
          path={publicSiteModule.path.slice(1)}
          element={publicSiteModule.element}
        >
          {publicSiteModule.children.map((routeDefinition) =>
            routeDefinition.index ? (
              <Route
                key={`${publicSiteModule.id}-index`}
                index
                element={routeDefinition.element}
              />
            ) : (
              <Route
                key={`${publicSiteModule.id}-${routeDefinition.path ?? 'route'}`}
                path={routeDefinition.path}
                element={routeDefinition.element}
              />
            )
          )}
        </Route>
      ) : null}
      <Route element={<ShellLayout />}>
        {shellModules.map((moduleDefinition) =>
          moduleDefinition.children?.length ? (
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
                )
              )}
            </Route>
          ) : (
            <Route
              key={moduleDefinition.id}
              path={moduleDefinition.path.slice(1)}
              element={moduleDefinition.element}
            />
          )
        )}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  )
}

export { ShellRoutes }
