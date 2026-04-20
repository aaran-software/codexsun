import { ArrowRight, ShieldCheck, Workflow, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@codexsun/ui/components/ui/button'
import { useSiteShell } from '@sites/app/use-site-shell'

function HomePage() {
  const { payload, health } = useSiteShell()
  const services = payload?.content.services ?? []

  return (
    <section className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-50 md:text-5xl">
            {payload?.content.brand.heroTitle ?? 'Structured websites for serious businesses.'}
          </h1>
          <p className="text-sm leading-7 text-stone-300">
            {payload?.content.brand.heroSummary}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/sites/service">
                Explore services
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-stone-700 bg-transparent text-stone-100 hover:bg-stone-900"
            >
              <Link to="/sites/contact">Start a project</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-stone-800 bg-stone-950/70 p-6">
          <p className="text-sm font-semibold text-stone-50">Runtime card</p>
          <div className="mt-4 grid gap-3">
            <Metric title="Backend status" value={health?.status ?? 'loading'} />
            <Metric title="Frontend route set" value="home, about, service, contact" />
            <Metric title="Backend app" value={health?.app ?? 'sites'} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          icon={ShieldCheck}
          title="Health-safe backend"
          summary="Dedicated backend endpoint and explicit process shutdown behavior for safe test orchestration."
        />
        <FeatureCard
          icon={Workflow}
          title="Wired frontend"
          summary="The website shell consumes backend payloads instead of hardcoding everything locally."
        />
        <FeatureCard
          icon={Wrench}
          title="Maintainable structure"
          summary="The app follows the repo app scaffold so future pages and server features have a clear home."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.title}
            className="rounded-3xl border border-stone-800 bg-stone-950/60 p-5"
          >
            <p className="text-lg font-semibold text-stone-50">{service.title}</p>
            <p className="mt-3 text-sm leading-7 text-stone-400">
              {service.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  summary,
}: {
  icon: typeof ShieldCheck
  title: string
  summary: string
}) {
  return (
    <article className="rounded-3xl border border-stone-800 bg-stone-950/60 p-5">
      <Icon className="size-5 text-amber-300" aria-hidden="true" />
      <p className="mt-4 text-lg font-semibold text-stone-50">{title}</p>
      <p className="mt-2 text-sm leading-7 text-stone-400">{summary}</p>
    </article>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/70 px-4 py-3">
      <p className="text-xs tracking-[0.18em] text-stone-500 uppercase">{title}</p>
      <p className="mt-2 text-sm font-medium text-stone-100">{value}</p>
    </div>
  )
}

export { HomePage }
