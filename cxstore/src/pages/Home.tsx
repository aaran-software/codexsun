import type { ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"

import { getStorefrontCategories, getStorefrontProducts } from "@/api/productApi"
import { getStorefrontVendors } from "@/api/vendorApi"
import { CategoryGrid } from "@/components/product/CategoryGrid"
import { DealBanner } from "@/components/product/DealBanner"
import { HeroSlider } from "@/components/product/HeroSlider"
import { ProductGrid } from "@/components/product/ProductGrid"
import { VendorCarousel } from "@/components/product/VendorCarousel"
import { buttonVariants } from "@/components/ui/button"
import { useCompanyConfig } from "@/config/company"
import { usePageMeta } from "@/hooks/usePageMeta"
import { sortProducts } from "@/utils/storefront"

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

export default function Home() {
  const { company } = useCompanyConfig()
  usePageMeta({
    title: `${company.displayName} Storefront`,
    description: `Browse products, categories, and vendor storefronts through the ${company.displayName} marketplace.`,
    canonicalPath: "/",
  })

  const { data: products = [] } = useQuery({
    queryKey: ["storefront", "products", "home"],
    queryFn: () => getStorefrontProducts({ limit: 24 }),
  })
  const { data: categories = [] } = useQuery({
    queryKey: ["storefront", "categories"],
    queryFn: getStorefrontCategories,
  })
  const { data: vendors = [] } = useQuery({
    queryKey: ["storefront", "vendors"],
    queryFn: () => getStorefrontVendors(8),
  })

  const activeProducts = products.filter((product) => product.isActive && product.isPublished)
  const featuredProducts = sortProducts(activeProducts, "featured").slice(0, 6)
  const bestSellers = sortProducts(activeProducts, "inventory-desc").slice(0, 3)
  const trendingProducts = sortProducts(activeProducts, "latest").slice(0, 6)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 sm:py-10">
      <HeroSlider />

      <Section title="Featured Products" description="Published products surfaced from the public catalog API and ranked for customer discovery.">
        <ProductGrid products={featuredProducts} emptyMessage="No featured products are available yet." />
      </Section>

      <Section title="Popular Categories" description="Top storefront entry points driven by active categories that currently have public catalog inventory.">
        <CategoryGrid categories={categories.slice(0, 8)} />
      </Section>

      <DealBanner />

      <Section title="Best Sellers" description="Inventory-led picks and high-availability products for faster cart conversion.">
        <ProductGrid products={bestSellers} emptyMessage="No best sellers are available yet." />
      </Section>

      <Section title="Top Vendors" description="Explore the businesses behind the catalog without splitting the storefront into separate vendor apps.">
        <VendorCarousel vendors={vendors.slice(0, 4)} />
      </Section>

      <Section title="Trending Products" description="Latest additions and newly published catalog entries for repeat discovery.">
        <ProductGrid products={trendingProducts} emptyMessage="No trending products are available yet." />
      </Section>

      <section className="rounded-[2rem] border border-border/60 bg-card px-6 py-8 shadow-[0_24px_60px_-40px_rgba(40,28,18,0.18)] sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_auto] lg:items-center">
          <div className="space-y-2">
            <div className="text-2xl font-semibold">Newsletter Signup</div>
            <p className="text-sm text-muted-foreground">The backend does not yet expose a customer newsletter endpoint, so this storefront phase keeps the signup CTA visual and routes customers to support.</p>
          </div>
          <Link to="/contact" className={buttonVariants({ className: "rounded-full px-5" })}>Contact Support</Link>
        </div>
      </section>
    </div>
  )
}
