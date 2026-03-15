import { SparklesIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function DealBanner() {
  return (
    <section className="rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,#f4eadb,#fff8ef)] p-6 shadow-[0_22px_60px_-38px_rgba(86,52,18,0.25)] sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
            <SparklesIcon className="size-3.5" />
            Latest deals
          </div>
          <h2 className="text-2xl font-semibold">Seasonal offer windows and wholesale tiers are live in the shared catalog.</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">The storefront highlights offer-driven prices from the existing multi-channel pricing model while keeping one unified product catalog.</p>
        </div>
        <Button render={<Link to="/search?sort=price-asc" />} className="rounded-full px-5">Browse deals</Button>
      </div>
    </section>
  )
}
