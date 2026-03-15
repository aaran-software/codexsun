import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"

import { getProducts, getProductCategories } from "@/api/productApi"
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

export default function CategoryPage() {
  const { slug = "" } = useParams()
  const auth = useAuth()
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters)
  const [sort, setSort] = useState<ProductSortOption>("featured")

  usePageMeta({
    title: `Category - ${slug}`,
    description: "Browse the current category view in the Codexsun storefront.",
    canonicalPath: `/category/${slug}`,
  })

  const { data: products = [] } = useQuery({
    queryKey: ["storefront", "products", "category", slug],
    queryFn: () => getProducts(false),
    enabled: auth.isAuthenticated,
  })
  const { data: categories = [] } = useQuery({
    queryKey: ["storefront", "categories", slug],
    queryFn: () => getProductCategories(false),
    enabled: auth.isAuthenticated,
  })

  const category = categories.find((entry) => entry.slug === slug)
  const categoryProducts = useMemo(() => products.filter((product) => product.categoryId === category?.id), [category?.id, products])
  const filteredProducts = sortProducts(filterProducts(categoryProducts, filters), sort)

  if (!auth.isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <StorefrontAuthNotice title="Category browsing requires sign-in" description="The current product and category APIs are authenticated. Sign in to browse live category results." />
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr]">
      <FilterSidebar filters={filters} onChange={setFilters} />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-card p-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Category</div>
            <h1 className="text-3xl font-semibold">{category?.name ?? "Unknown Category"}</h1>
            <p className="text-sm text-muted-foreground">{filteredProducts.length} products match the current storefront filters.</p>
          </div>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
        <ProductGrid products={filteredProducts} emptyMessage="No products matched the current category filters." />
      </div>
    </div>
  )
}
