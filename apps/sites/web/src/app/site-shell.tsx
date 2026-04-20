import { Menu, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '@codexsun/ui/components/ui/button'
import {
  fetchSiteHealth,
  fetchSitePayload,
  type SiteHealth,
  type SitePayload,
} from '@sites/lib/api'

function SiteShell() {
  const [payload, setPayload] = useState<SitePayload | null>(null)
  const [health, setHealth] = useState<SiteHealth | null>(null)
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      const [sitePayload, siteHealth] = await Promise.all([
        fetchSitePayload(),
        fetchSiteHealth(),
      ])

      if (!active) {
        return
      }

      setPayload(sitePayload)
      setHealth(siteHealth)
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const navItems = payload?.content.navItems ?? []

  return (
    <main className="min-h-screen bg-stone-950 px-4 py-4 text-stone-100 md:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-[32px] border border-stone-800 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_28%),linear-gradient(180deg,_rgba(28,25,23,1)_0%,_rgba(17,17,17,1)_100%)] shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
        <aside
          className={[
            'fixed inset-y-4 left-4 z-30 w-[280px] rounded-[24px] border border-stone-800 bg-stone-950/95 p-5 shadow-xl transition-transform md:static md:translate-x-0 md:rounded-none md:border-0 md:border-r md:border-stone-800 md:bg-transparent md:shadow-none',
            navOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]',
          ].join(' ')}
        >
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-[0.22em] text-amber-300 uppercase">
              {payload?.content.brand.eyebrow ?? 'Portfolio Surface'}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-50">
              {payload?.content.brand.name ?? 'Codexsun Studio'}
            </h1>
              <p className="text-sm leading-6 text-stone-400">
              App-owned website behavior mounted through the cxsun host runtime.
              </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setNavOpen(false)}
                className={({ isActive }) =>
                  [
                    'block rounded-2xl border px-4 py-3 text-sm transition-colors',
                    isActive
                      ? 'border-amber-300/40 bg-amber-400/10 text-stone-50'
                      : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:bg-stone-900 hover:text-stone-50',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
            <div className="flex items-center gap-2 text-amber-300">
              <Zap className="size-4" aria-hidden="true" />
              <p className="text-sm font-medium">Backend health</p>
            </div>
            <p className="mt-2 text-sm text-stone-400">
              Status: <span className="text-stone-100">{health?.status ?? 'loading'}</span>
            </p>
            <p className="text-sm text-stone-400">
              Uptime: <span className="text-stone-100">{health?.uptimeSeconds ?? 0}s</span>
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-stone-800 px-5 py-4 md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-[0.22em] text-stone-500 uppercase">
                  First website app
                </p>
                <p className="text-lg font-semibold text-stone-50">
                  {payload?.content.brand.heroTitle ?? 'Loading...'}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-stone-700 bg-transparent text-stone-100 hover:bg-stone-900 md:hidden"
                onClick={() => setNavOpen((value) => !value)}
                aria-label="Toggle site navigation"
              >
                <Menu aria-hidden="true" />
              </Button>
            </div>
          </header>

          <div className="flex-1 px-5 py-6 md:px-8 md:py-8">
            <Outlet context={{ payload, health }} />
          </div>
        </div>
      </div>
    </main>
  )
}

export { SiteShell }
