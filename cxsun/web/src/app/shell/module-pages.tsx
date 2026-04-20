import { Blocks, Cable, LayoutDashboard, TerminalSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@codexsun/ui/components/ui/button'

function WorkspacePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Host Foundation
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Cxsun is now the only host entrypoint.
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          Backend startup, frontend startup, and API composition now begin in
          `cxsun`, while apps stay plugin-owned under `apps/`.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <WorkspaceStat
          title="Host entrypoints"
          value="2"
          note="one backend bootstrap and one frontend bootstrap"
        />
        <WorkspaceStat title="Plugin apps" value="3" note="api, cli, sites" />
        <WorkspaceStat
          title="API surfaces"
          value="2"
          note="internal and external contracts live under apps/api"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <WorkspaceCard
          icon={Blocks}
          title="Sites plugin"
          summary="The sites app owns pages and app behavior, but it mounts through the cxsun host."
          actionHref="/sites"
          actionLabel="Open sites"
        />
        <WorkspaceCard
          icon={Cable}
          title="API surfaces"
          summary="Internal routes are for first-party system calls, and external routes are for software outside this application."
          actionHref="/api/external/apps"
          actionLabel="View external registry"
          external
        />
        <WorkspaceCard
          icon={TerminalSquare}
          title="CLI plugin"
          summary="The first operational helper now lives in apps/cli with the immediate github:now commit-and-push flow."
          actionHref="/"
          actionLabel="Use github:now"
        />
      </div>
    </section>
  )
}

type WorkspaceStatProps = {
  title: string
  value: string
  note: string
}

function WorkspaceStat({ title, value, note }: WorkspaceStatProps) {
  return (
    <article className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p>
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
    <article className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-secondary p-3 text-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="text-sm leading-7 text-muted-foreground">{summary}</p>
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

export { WorkspacePage }
