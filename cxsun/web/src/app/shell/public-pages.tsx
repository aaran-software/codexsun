import {
  ArrowRight,
  Blocks,
  CheckCircle2,
  LayoutDashboard,
  LockKeyhole,
  MonitorCog,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@codexsun/ui/components/ui/button'

const appHighlights = [
  {
    title: 'Desk operations',
    summary: 'A focused desktop-style command surface for daily operators.',
    icon: MonitorCog,
  },
  {
    title: 'Auth control',
    summary:
      'Login, roles, permissions, and session posture in one visual system.',
    icon: LockKeyhole,
  },
  {
    title: 'Dashboard shell',
    summary: 'Cards, alerts, app launchers, and runtime health for the suite.',
    icon: LayoutDashboard,
  },
]

function PublicTopbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-stone-50/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-stone-950 text-stone-50">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[0.2em] text-stone-950 uppercase">
              Codexsun
            </span>
            <span className="block text-xs text-stone-500">
              Business software
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
          <a href="#platform" className="hover:text-stone-950">
            Platform
          </a>
          <a href="#apps" className="hover:text-stone-950">
            Apps
          </a>
          <Link to="/sites" className="hover:text-stone-950">
            Sites
          </Link>
          <Link to="/dashboard" className="hover:text-stone-950">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/login?variant=desktop">Desk Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function PublicFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-200">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.24em] text-amber-200 uppercase">
            Codexsun
          </p>
          <p className="max-w-2xl text-sm leading-7 text-stone-400">
            Framework-led ERP, commerce, billing, site, and operations surfaces
            assembled through one host runtime.
          </p>
        </div>
        <div className="grid gap-5 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold text-stone-50">Surfaces</p>
            <div className="mt-3 space-y-2 text-stone-400">
              <p>Home</p>
              <p>Login</p>
              <p>Desk</p>
              <p>Dashboard</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-semibold text-stone-50">Version</p>
            <p className="mt-3 text-stone-400">v {__CXSUN_APP_VERSION__}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function PublicHomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_34%),linear-gradient(180deg,_#fafaf9_0%,_#f5f5f4_100%)] text-stone-950">
      <PublicTopbar />
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-7xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-stone-300 bg-white/75 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-stone-600 uppercase shadow-sm">
              Framework-first application suite
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-stone-950 md:text-7xl">
                Business software, made to work together.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
                Codexsun composes sites, operations, auth, desk workflows, and
                dashboards through one host so teams can move from public
                content to daily execution without switching systems.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/login">
                  Login
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            </div>
          </div>

          <div
            id="platform"
            className="rounded-[2.5rem] border border-stone-200 bg-white/82 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur"
          >
            <div className="rounded-[2rem] bg-stone-950 p-5 text-stone-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.22em] text-amber-200 uppercase">
                    Live shell
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">Suite control</h2>
                </div>
                <Blocks className="size-6 text-amber-200" aria-hidden="true" />
              </div>
              <div className="mt-8 grid gap-3">
                {appHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-white/10 bg-white/10 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <item.icon className="mt-0.5 size-5 text-amber-200" />
                      <div>
                        <p className="font-semibold text-stone-50">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-stone-400">
                          {item.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="apps"
          className="mx-auto w-full max-w-7xl px-5 pb-16 md:px-8"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Public website top menu and footer',
              'Role-aware auth and dashboard entry',
              'Desk-ready operational workspace',
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-stone-200 bg-white/75 p-5 shadow-sm"
              >
                <CheckCircle2 className="size-5 text-emerald-600" />
                <p className="mt-4 font-semibold text-stone-950">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2),_transparent_32%),linear-gradient(135deg,_#fafaf9,_#e7e5e4)] px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-3xl font-semibold tracking-[0.28em] text-stone-950 uppercase">
            Codexsun
          </p>
          <p className="mt-2 text-sm text-stone-600">
            One sign in for web, desk, and admin surfaces.
          </p>
        </div>
        <form className="rounded-[2rem] border border-stone-200 bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
              Welcome
            </h1>
            <p className="text-sm leading-6 text-stone-500">
              Auth is staged for the full backend flow. This screen mirrors the
              production access surface while the current demo remains static.
            </p>
          </div>
          <div className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm font-medium text-stone-700">
              <span>Email</span>
              <input
                type="email"
                placeholder="name@example.com"
                className="h-11 w-full rounded-xl border border-stone-300 bg-white px-4 transition outline-none focus:border-stone-950"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-stone-700">
              <span>Password</span>
              <input
                type="password"
                placeholder="Enter your password"
                className="h-11 w-full rounded-xl border border-stone-300 bg-white px-4 transition outline-none focus:border-stone-950"
              />
            </label>
            <Button asChild size="lg" className="w-full rounded-xl">
              <Link to="/dashboard">
                Login
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export { LoginPage, PublicFooter, PublicHomePage, PublicTopbar }
