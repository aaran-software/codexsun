import { ChangeEvent } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CatalogFilters } from "@/types/storefront"

export function FilterSidebar({
  filters,
  onChange,
}: {
  filters: CatalogFilters
  onChange: (next: CatalogFilters) => void
}) {
  const handleValueChange = (key: keyof CatalogFilters) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value
    onChange({
      ...filters,
      [key]: typeof filters[key] === "number" ? Number(value) : value,
    })
  }

  return (
    <aside className="space-y-4 rounded-[1.8rem] border border-border/60 bg-card p-5 shadow-[0_24px_50px_-38px_rgba(45,29,19,0.22)]">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Filters</h2>
        <p className="text-sm text-muted-foreground">Refine the current catalog view client-side using the products already available from the authenticated API.</p>
      </div>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Min Price</Label>
          <Input type="number" value={filters.minPrice} onChange={handleValueChange("minPrice")} />
        </div>
        <div className="space-y-2">
          <Label>Max Price</Label>
          <Input type="number" value={filters.maxPrice} onChange={handleValueChange("maxPrice")} />
        </div>
        <div className="space-y-2">
          <Label>Brand Keyword</Label>
          <Input value={filters.brand} onChange={handleValueChange("brand")} placeholder="Search in product names" />
        </div>
        <div className="space-y-2">
          <Label>Vendor</Label>
          <Input value={filters.vendor} onChange={handleValueChange("vendor")} placeholder="Vendor or company name" />
        </div>
        <div className="space-y-2">
          <Label>Minimum Rating</Label>
          <Input type="number" min={0} max={5} value={filters.rating} onChange={handleValueChange("rating")} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filters.availabilityOnly} onChange={handleValueChange("availabilityOnly")} />
          Show only in-stock items
        </label>
      </div>
    </aside>
  )
}
