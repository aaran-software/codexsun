import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Workflow,
  Wrench,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@codexsun/ui/components/ui/button'
import { useSiteShell } from '@sites/app/use-site-shell'

function HomePage() {
  const { payload, health } = useSiteShell()
  const services = payload?.content.services ?? []
  const brand = payload?.content.brand

  return (
    <div>
      <section className="bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_34%),linear-gradient(180deg,_#fafaf9_0%,_#f5f5f4_100%)]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-16 md:px-8 lg:min-h-[680px] lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex rounded-full border border-stone-300 bg-white/75 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-stone-600 uppercase shadow-sm">
              {brand?.eyebrow ?? 'Portfolio Surface'}
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-stone-950 md:text-7xl">
                {brand?.heroTitle ??
                  'Structured websites for serious businesses.'}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
                {brand?.heroSummary ??
                  'Launch a credible digital surface with content, backend handoff, and conversion paths already wired.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/sites/service">
                  Explore services
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                <Link to="/sites/contact">Start a project</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-stone-200 bg-white/85 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="rounded-[2rem] bg-stone-950 p-6 text-stone-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.22em] text-amber-200 uppercase">
                    Runtime card
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">
                    Website app live
                  </h2>
                </div>
                <Sparkles
                  className="size-6 text-amber-200"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-8 grid gap-3">
                <Metric
                  title="Backend status"
                  value={health?.status ?? 'loading'}
                />
                <Metric
                  title="Frontend route set"
                  value="home, about, service, contact"
                />
                <Metric title="Backend app" value={health?.app ?? 'sites'} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-5 py-12 md:grid-cols-3 md:px-8">
        <FeatureCard
          icon={ShieldCheck}
          title="Health-safe backend"
          summary="Dedicated backend endpoint and explicit process shutdown behavior for safe orchestration."
        />
        <FeatureCard
          icon={Workflow}
          title="Wired frontend"
          summary="The website shell consumes backend payloads and keeps navigation app-owned."
        />
        <FeatureCard
          icon={Wrench}
          title="Maintainable structure"
          summary="Pages, API routes, and shared content stay inside the sites plugin boundary."
        />
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-16 md:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-stone-500 uppercase">
              Services
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              Content, conversion, and backend clarity.
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/sites/contact" aria-label="Open project form">
              Open form
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <p className="text-lg font-semibold text-stone-950">
                {service.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-stone-500">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
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
    <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <Icon className="size-5 text-amber-600" aria-hidden="true" />
      <p className="mt-4 text-lg font-semibold text-stone-950">{title}</p>
      <p className="mt-2 text-sm leading-7 text-stone-500">{summary}</p>
    </article>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-xs tracking-[0.18em] text-stone-500 uppercase">
        {title}
      </p>
      <p className="mt-2 text-sm font-medium text-stone-100">{value}</p>
    </div>
  )
}

export { HomePage }
