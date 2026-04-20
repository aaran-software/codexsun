import { Menu, Sparkles, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
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

  const navItems = payload?.content.navItems ?? [
    { path: '/sites', label: 'Home' },
    { path: '/sites/about', label: 'About' },
    { path: '/sites/service', label: 'Services' },
    { path: '/sites/contact', label: 'Contact' },
  ]
  const brand = payload?.content.brand

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-stone-50/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-4 md:px-8">
          <Link to="/sites" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-300 text-stone-950">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[0.22em] uppercase">
                {brand?.name ?? 'Codexsun Studio'}
              </span>
              <span className="block text-xs text-stone-500">
                {brand?.eyebrow ?? 'Portfolio Surface'}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/sites'}
                className={({ isActive }) =>
                  isActive
                    ? 'text-stone-950'
                    : 'transition hover:text-stone-950'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="outline" size="sm">
              <Link to="/">Suite home</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/sites/contact">Start project</Link>
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setNavOpen((value) => !value)}
            aria-label="Toggle site navigation"
          >
            <Menu aria-hidden="true" />
          </Button>
        </div>

        {navOpen ? (
          <nav className="border-t border-stone-200 px-5 py-4 md:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/sites'}
                  onClick={() => setNavOpen(false)}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        ) : null}
      </header>

      <main>
        <Outlet context={{ payload, health }} />
      </main>

      <footer className="border-t border-stone-800 bg-stone-950 text-stone-200">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.24em] text-amber-200 uppercase">
              {brand?.name ?? 'Codexsun Studio'}
            </p>
            <p className="max-w-2xl text-sm leading-7 text-stone-400">
              {brand?.heroSummary ??
                'Structured websites and maintainable backend handoffs for serious businesses.'}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-stone-50">Menu</p>
              <div className="mt-3 grid gap-2 text-sm text-stone-400">
                {navItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-label={`Footer menu item ${index + 1}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-amber-200">
                <Zap className="size-4" aria-hidden="true" />
                <p className="text-sm font-semibold">Backend health</p>
              </div>
              <p className="mt-3 text-sm text-stone-400">
                Status:{' '}
                <span className="font-medium text-stone-50">
                  {health?.status ?? 'loading'}
                </span>
              </p>
              <p className="text-sm text-stone-400">
                App:{' '}
                <span className="font-medium text-stone-50">
                  {health?.app ?? 'sites'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export { SiteShell }
