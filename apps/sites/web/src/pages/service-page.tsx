import { useSiteShell } from '@sites/app/use-site-shell'

function ServicePage() {
  const { payload } = useSiteShell()

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-stone-800 bg-stone-950/60 p-6">
        <p className="text-xs font-medium tracking-[0.22em] text-amber-300 uppercase">
          Services
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-stone-50">
          Minimal surface, practical delivery.
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {payload?.content.services.map((service) => (
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

export { ServicePage }
