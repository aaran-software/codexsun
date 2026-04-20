import { Layers3, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Button } from '@codexsun/ui/components/ui/button'
import { shellRegistry } from './module-registry'

function getCurrentModule(pathname: string) {
  return shellRegistry.modules.find((moduleDefinition) => {
    if (moduleDefinition.path === '/') {
      return pathname === '/'
    }

    return (
      pathname === moduleDefinition.path ||
      pathname.startsWith(`${moduleDefinition.path}/`)
    )
  })
}

function ShellLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()
  const visibleModules = shellRegistry.getVisibleModules()
  const currentModule = getCurrentModule(location.pathname) ?? visibleModules[0]

  return (
    <main className="bg-background min-h-screen p-4 md:p-6">
      <div className="border-border/70 bg-background mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-[28px] border shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        <aside
          className={[
            'border-border/70 bg-card fixed inset-y-4 left-4 z-30 w-[280px] rounded-[24px] border p-5 shadow-xl transition-transform md:static md:translate-x-0 md:rounded-none md:border-0 md:border-r md:shadow-none',
            navOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]',
          ].join(' ')}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                CXSUN Shell
              </p>
              <p className="text-foreground text-xl font-semibold tracking-tight">
                Workspace Registry
              </p>
              <p className="text-muted-foreground text-sm leading-6">
                Apps mount through the shell, but app-owned behavior stays
                outside the host.
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation"
            >
              <PanelLeftClose aria-hidden="true" />
            </Button>
          </div>

          <nav className="mt-8 space-y-2">
            {visibleModules.map((moduleDefinition) => (
              <NavLink
                key={moduleDefinition.id}
                to={moduleDefinition.path}
                end={moduleDefinition.path === '/'}
                onClick={() => setNavOpen(false)}
                className={({ isActive }) =>
                  [
                    'block rounded-2xl border px-4 py-4 transition-colors',
                    isActive
                      ? 'border-primary/30 bg-primary/8 text-foreground'
                      : 'border-border/70 bg-background text-muted-foreground hover:bg-secondary',
                  ].join(' ')
                }
              >
                <p className="text-sm font-semibold">
                  {moduleDefinition.navLabel}
                </p>
                <p className="mt-1 text-sm leading-6">
                  {moduleDefinition.summary}
                </p>
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-border/70 border-b px-5 py-4 md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setNavOpen((value) => !value)}
                  aria-label="Toggle navigation"
                >
                  {navOpen ? (
                    <PanelLeftClose aria-hidden="true" />
                  ) : (
                    <PanelLeftOpen aria-hidden="true" />
                  )}
                </Button>
                <div className="bg-secondary text-foreground rounded-2xl p-3">
                  <Layers3 className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                    {currentModule.group}
                  </p>
                  <p className="text-foreground text-lg font-semibold">
                    {currentModule.title}
                  </p>
                </div>
              </div>
              <div className="hidden max-w-xl text-right md:block">
                <p className="text-muted-foreground text-sm leading-6">
                  {currentModule.description}
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 px-5 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>

          <footer className="border-border/70 flex justify-end border-t px-5 py-3 md:px-8">
            <p className="border-border/70 bg-secondary/60 text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium tracking-[0.12em] uppercase">
              v {__CXSUN_APP_VERSION__}
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}

export { ShellLayout }
