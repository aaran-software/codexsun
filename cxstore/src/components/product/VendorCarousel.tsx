import { Link } from "react-router-dom"

import type { VendorSummary } from "@/types/vendor"
import { slugify } from "@/utils/storefront"

export function VendorCarousel({ vendors }: { vendors: VendorSummary[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {vendors.map((vendor) => (
        <Link
          key={vendor.id}
          to={`/store/${slugify(vendor.companyName)}`}
          className="rounded-[1.8rem] border border-border/60 bg-card p-5 shadow-[0_24px_50px_-38px_rgba(45,29,19,0.26)] transition hover:-translate-y-1"
        >
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
            {vendor.companyName.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-lg font-semibold">{vendor.companyName}</div>
          <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">{vendor.website || vendor.email || "Vendor storefront partner"}</div>
          <div className="mt-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">{vendor.userCount} staff users</div>
        </Link>
      ))}
    </div>
  )
}
