import { useSiteShell } from '@sites/app/use-site-shell'

function AboutPage() {
  const { payload } = useSiteShell()

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-3xl border border-stone-800 bg-stone-950/60 p-6">
        <p className="text-xs font-medium tracking-[0.22em] text-amber-300 uppercase">
          About
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-stone-50">
          Built for structured delivery, not just visual polish.
        </h1>
      </article>

      <article className="rounded-3xl border border-stone-800 bg-stone-950/60 p-6">
        <p className="text-sm leading-7 text-stone-300">
          {payload?.content.company.summary}
        </p>
        <p className="mt-4 text-sm leading-7 text-stone-400">
          {payload?.content.company.mission}
        </p>
      </article>
    </section>
  )
}

export { AboutPage }
