import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"

import { getProducts } from "@/api/productApi"
import { StorefrontAuthNotice } from "@/components/layout/storefront-auth-notice"
import { ProductGrid } from "@/components/product/ProductGrid"
import { FilterSidebar } from "@/components/product/FilterSidebar"
import { SortDropdown } from "@/components/product/SortDropdown"
import { usePageMeta } from "@/hooks/usePageMeta"
import { useAuth } from "@/state/authStore"
import type { CatalogFilters, ProductSortOption } from "@/types/storefront"
import { filterProducts, sortProducts } from "@/utils/storefront"

const initialFilters: CatalogFilters = {
  minPrice: 0,
  maxPrice: 1_000_000,
  brand: "",
  vendor: "",
  availabilityOnly: false,
  rating: 0,
}

export default function SearchPage() {
  const auth = useAuth()
  const [params, setParams] = useSearchParams()
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters)
  const [sort, setSort] = useState<ProductSortOption>((params.get("sort") as ProductSortOption) || "featured")

  const query = params.get("q")?.trim().toLowerCase() ?? ""

  usePageMeta({
    title: query ? `Search - ${query}` : "Search Products",
    description: "Search the authenticated Codexsun product catalog.",
    canonicalPath: query ? `/search?q=${encodeURIComponent(query)}` : "/search",
  })

  const { data: products = [] } = useQuery({
    queryKey: ["storefront", "products", "search"],
    queryFn: () => getProducts(false),
    enabled: auth.isAuthenticated,
  })

  const searchedProducts = useMemo(() => {
    const scoped = products.filter((product) =>
      query.length === 0
      || product.name.toLowerCase().includes(query)
      || product.sku.toLowerCase().includes(query)
      || product.vendorCompanyName.toLowerCase().includes(query)
      || product.categoryName.toLowerCase().includes(query))

    return sortProducts(filterProducts(scoped, filters), sort)
  }, [filters, products, query, sort])

  if (!auth.isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <StorefrontAuthNotice title="Search requires sign-in" description="The current backend exposes product search through the authenticated catalog API. Sign in to run live catalog search." />
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr]">
      <FilterSidebar filters={filters} onChange={setFilters} />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-card p-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Search</div>
            <h1 className="text-3xl font-semibold">{query ? `Results for “${query}”` : "Browse the Catalog"}</h1>
            <p className="text-sm text-muted-foreground">{searchedProducts.length} products match your current query and filters.</p>
          </div>
          <SortDropdown
            value={sort}
            onChange={(next) => {
              setSort(next)
              const nextParams = new URLSearchParams(params)
              nextParams.set("sort", next)
              setParams(nextParams)
            }}
          />
        </div>
        <ProductGrid products={searchedProducts} emptyMessage="No products matched the current query." />
      </div>
    </div>
  )
}
