import {
  Activity,
  Blocks,
  Cable,
  KeyRound,
  LayoutDashboard,
  MonitorCog,
  RefreshCw,
  ShieldCheck,
  ShipWheel,
  TerminalSquare,
  UsersRound,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@codexsun/ui/components/ui/button'

const dashboardApps = [
  {
    title: 'Sites',
    route: '/sites',
    badge: 'Public web',
    summary:
      'Content, top menu, contact flow, and footer-owned website surface.',
    icon: Blocks,
  },
  {
    title: 'Auth',
    route: '/auth',
    badge: 'Access',
    summary: 'Login policy, roles, permissions, and session posture.',
    icon: KeyRound,
  },
  {
    title: 'Desk',
    route: '/desk',
    badge: 'Ops',
    summary: 'Desktop-style execution board for operators and support teams.',
    icon: MonitorCog,
  },
  {
    title: 'System Update',
    route: '/system-update',
    badge: 'Deploy',
    summary: 'Manual Git sync, Docker rebuild, and release automation bridge.',
    icon: ShipWheel,
  },
]

type SystemUpdateStatus = {
  version: string
  mode: string
  apiUpdateEnabled: boolean
  branch: string
  repositoryUrl: string
  localHead: string
  originHead: string | null
  dirty: boolean
  command: string
  nextMode: string
}

function WorkspacePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
          Host Foundation
        </p>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          Cxsun is now the app suite entrypoint.
        </h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-7 md:text-base">
          Home, login, desk, auth, dashboard, and website surfaces now mount
          from one `cxsun` frontend while apps stay plugin-owned under `apps/`.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <WorkspaceStat
          title="Host surfaces"
          value="5"
          note="home, login, dashboard, auth, desk"
        />
        <WorkspaceStat title="Plugin apps" value="3" note="api, cli, sites" />
        <WorkspaceStat
          title="Container image"
          value="v2"
          note="client deployment runs through .container"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <WorkspaceCard
          icon={Blocks}
          title="Sites plugin"
          summary="The website app owns public content, top navigation, and footer composition."
          actionHref="/sites"
          actionLabel="Open sites"
        />
        <WorkspaceCard
          icon={Cable}
          title="API surfaces"
          summary="Internal and external API routes remain composed by the cxsun runtime."
          actionHref="/api/external/apps"
          actionLabel="View external registry"
          external
        />
        <WorkspaceCard
          icon={TerminalSquare}
          title="CLI plugin"
          summary="Operational helper flow owns version sync, git commits, and immediate push."
          actionHref="/dashboard"
          actionLabel="Open dashboard"
        />
      </div>
    </section>
  )
}

function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="border-border/70 bg-card rounded-[2rem] border p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
              Framework
            </p>
            <h1 className="text-foreground mt-3 text-3xl font-semibold tracking-tight">
              Business software, made to work together.
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7">
              A single dashboard opens app workspaces, framework services, and
              operational controls from the same shell.
            </p>
          </div>
          <Button asChild>
            <Link to="/desk">Open desk</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {dashboardApps.map((app) => (
          <Link
            key={app.title}
            to={app.route}
            className="group border-border/70 bg-card hover:border-primary/40 rounded-[1.5rem] border p-5 shadow-sm transition hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="bg-secondary text-foreground rounded-2xl p-3">
                <app.icon className="size-5" />
              </div>
              <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                {app.badge}
              </span>
            </div>
            <p className="text-foreground mt-5 text-lg font-semibold">
              {app.title}
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-7">
              {app.summary}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Framework services" icon={Activity}>
          {[
            'Runtime config',
            'Container deployment',
            'Versioned git helper',
          ].map((item) => (
            <div
              key={item}
              className="border-border/70 bg-background/70 text-muted-foreground rounded-2xl border px-4 py-3 text-sm"
            >
              {item}
            </div>
          ))}
        </Panel>
        <Panel title="Access profile" icon={UsersRound}>
          {['Guest Operator', 'Desk enabled', 'Admin preview'].map((item) => (
            <div
              key={item}
              className="border-border/70 bg-background/70 text-muted-foreground rounded-2xl border px-4 py-3 text-sm"
            >
              {item}
            </div>
          ))}
        </Panel>
      </div>
    </section>
  )
}

function DeskPage() {
  const lanes = [
    { title: 'To do', items: ['Review site leads', 'Check runtime health'] },
    {
      title: 'In progress',
      items: ['Prepare deployment', 'Validate auth policy'],
    },
    { title: 'Done', items: ['Build image', 'Run docker e2e'] },
  ]

  return (
    <section className="space-y-6">
      <div>
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
          Desktop Variant
        </p>
        <h1 className="text-foreground mt-3 text-3xl font-semibold tracking-tight">
          Task execution desk
        </h1>
        <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7">
          A compact operator board inspired by the reference desk layout, ready
          for drag-and-drop task flows when backend task APIs are introduced.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {lanes.map((lane) => (
          <article
            key={lane.title}
            className="border-border/70 bg-card rounded-[1.75rem] border p-5"
          >
            <p className="text-foreground font-semibold">{lane.title}</p>
            <div className="mt-4 space-y-3">
              {lane.items.map((item) => (
                <div
                  key={item}
                  className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-3 text-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function AuthDashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
          Auth Dashboard
        </p>
        <h1 className="text-foreground mt-3 text-3xl font-semibold tracking-tight">
          Access, roles, and session posture
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <WorkspaceStat
          title="Login surface"
          value="1"
          note="web and desktop variants"
        />
        <WorkspaceStat
          title="Roles staged"
          value="3"
          note="guest, operator, admin"
        />
        <WorkspaceStat
          title="Policy"
          value="MFA ready"
          note="OTP and reset env keys configured"
        />
      </div>
      <Panel title="Security controls" icon={ShieldCheck}>
        {[
          'JWT and lockout settings sourced from .env',
          'Role-aware dashboard routes prepared',
          'Admin and desk surfaces separated visually',
        ].map((item) => (
          <div
            key={item}
            className="border-border/70 bg-background/70 text-muted-foreground rounded-2xl border px-4 py-3 text-sm"
          >
            {item}
          </div>
        ))}
      </Panel>
    </section>
  )
}

function SystemUpdatePage() {
  const [status, setStatus] = useState<SystemUpdateStatus | null>(null)
  const [secret, setSecret] = useState('')
  const [message, setMessage] = useState('Load update status to inspect the deployment state.')
  const [isLoading, setIsLoading] = useState(false)

  async function loadStatus() {
    setIsLoading(true)
    setMessage('Loading update status...')

    try {
      const response = await fetch('/api/internal/system-update/status')
      const payload = (await response.json()) as SystemUpdateStatus

      setStatus(payload)
      setMessage('Update status loaded.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load status.')
    } finally {
      setIsLoading(false)
    }
  }

  async function requestApiUpdate() {
    setIsLoading(true)
    setMessage('Requesting API-triggered update...')

    try {
      const response = await fetch('/api/internal/system-update/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-codexsun-update-key': secret,
        },
        body: JSON.stringify({ action: 'update' }),
      })
      const payload = (await response.json()) as { error?: string; status?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Update request failed.')
      }

      setMessage(payload.status ?? 'Update request accepted.')
      await loadStatus()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Update request failed.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadStatus()
    })
  }, [])

  return (
    <section className="space-y-6">
      <div className="border-border/70 bg-card rounded-[2rem] border p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
              Deployment
            </p>
            <h1 className="text-foreground mt-3 text-3xl font-semibold tracking-tight">
              Manual update now, release automation later.
            </h1>
            <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7">
              Production keeps Docker setup as a one-time action. Updates run
              from the host checkout, reset to GitHub, rebuild the image, and
              recreate only the application container.
            </p>
          </div>
          <Button onClick={() => void loadStatus()} disabled={isLoading}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <WorkspaceStat
          title="Current version"
          value={status?.version ?? '...'}
          note={`branch ${status?.branch ?? 'loading'}`}
        />
        <WorkspaceStat
          title="Local head"
          value={status?.localHead ?? '...'}
          note={`origin ${status?.originHead ?? 'not fetched'}`}
        />
        <WorkspaceStat
          title="Update mode"
          value={status?.apiUpdateEnabled ? 'API ready' : 'Manual'}
          note={status?.dirty ? 'local changes detected' : 'clean or unknown'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Panel title="Manual host command" icon={TerminalSquare}>
          <div className="border-border/70 bg-background/70 rounded-2xl border p-4">
            <p className="text-muted-foreground text-sm leading-7">
              Run this on the production server from the repository root:
            </p>
            <code className="text-foreground mt-3 block rounded-xl bg-black px-4 py-3 text-sm text-white">
              {status?.command ?? 'npm run deploy:update'}
            </code>
          </div>
          <div className="border-border/70 bg-background/70 text-muted-foreground rounded-2xl border px-4 py-3 text-sm leading-7">
            This force-syncs tracked files to GitHub and preserves ignored
            `.env`, Docker volumes, the `codexion` network, and the database.
          </div>
        </Panel>

        <Panel title="API update bridge" icon={ShipWheel}>
          <input
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            type="password"
            placeholder="x-codexsun-update-key"
            className="border-border/70 bg-background/70 text-foreground placeholder:text-muted-foreground rounded-2xl border px-4 py-3 text-sm outline-none"
          />
          <Button
            onClick={() => void requestApiUpdate()}
            disabled={isLoading || !secret}
          >
            Request API update
          </Button>
          <div className="border-border/70 bg-background/70 text-muted-foreground rounded-2xl border px-4 py-3 text-sm leading-7">
            {message}
          </div>
          <div className="border-border/70 bg-background/70 text-muted-foreground rounded-2xl border px-4 py-3 text-sm leading-7">
            {status?.nextMode ??
              'GitHub release workflow can SSH to the server and run the same command.'}
          </div>
        </Panel>
      </div>
    </section>
  )
}

function Panel({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode
  icon: typeof LayoutDashboard
  title: string
}) {
  return (
    <article className="border-border/70 bg-card rounded-[1.75rem] border p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Icon className="text-primary size-5" />
        <p className="text-foreground font-semibold">{title}</p>
      </div>
      <div className="mt-4 grid gap-3">{children}</div>
    </article>
  )
}

type WorkspaceStatProps = {
  title: string
  value: string
  note: string
}

function WorkspaceStat({ title, value, note }: WorkspaceStatProps) {
  return (
    <article className="border-border/70 bg-card rounded-3xl border p-5 shadow-sm">
      <p className="text-foreground text-sm font-semibold">{title}</p>
      <p className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="text-muted-foreground mt-2 text-sm leading-6">{note}</p>
    </article>
  )
}

type WorkspaceCardProps = {
  icon: typeof LayoutDashboard
  title: string
  summary: string
  actionHref: string
  actionLabel: string
  external?: boolean
}

function WorkspaceCard({
  icon: Icon,
  title,
  summary,
  actionHref,
  actionLabel,
  external = false,
}: WorkspaceCardProps) {
  return (
    <article className="border-border/70 bg-card rounded-3xl border p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="bg-secondary text-foreground rounded-2xl p-3">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <p className="text-foreground text-lg font-semibold">{title}</p>
          <p className="text-muted-foreground text-sm leading-7">{summary}</p>
          {external ? (
            <Button asChild>
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : (
            <Button asChild>
              <Link to={actionHref}>{actionLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

export {
  AuthDashboardPage,
  DashboardPage,
  DeskPage,
  SystemUpdatePage,
  WorkspacePage,
}
