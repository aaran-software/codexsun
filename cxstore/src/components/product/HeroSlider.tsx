import { ArrowRightIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function HeroSlider() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-[linear-gradient(135deg,#1f140f_0%,#5d241a_48%,#c88638_100%)] px-6 py-10 text-white shadow-[0_35px_90px_-42px_rgba(49,20,9,0.72)] sm:px-10 sm:py-14">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_60%)] lg:block" />
      <div className="relative max-w-2xl space-y-6">
        <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.32em] text-white/80">
          Multi-vendor storefront
        </div>
        <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
          Discover curated products, trusted vendors, and faster commerce flows.
        </h1>
        <p className="max-w-xl text-base text-white/78 sm:text-lg">
          Browse a shared marketplace, compare vendor-led offers, manage your cart, and convert checkout into live orders on the Codexsun platform.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link to="/search" />} className="rounded-full bg-white px-5 text-black hover:bg-white/90">
            Explore catalog
            <ArrowRightIcon className="size-4" />
          </Button>
          <Button render={<Link to="/account/orders" />} variant="outline" className="rounded-full border-white/25 bg-transparent px-5 text-white hover:bg-white/10">
            View orders
          </Button>
        </div>
      </div>
    </section>
  )
}
