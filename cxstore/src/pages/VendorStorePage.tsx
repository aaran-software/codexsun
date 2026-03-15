import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"

import { getProducts } from "@/api/productApi"
import { getVendors } from "@/api/vendorApi"
import { StorefrontAuthNotice } from "@/components/layout/storefront-auth-notice"
import { ProductGrid } from "@/components/product/ProductGrid"
import { RatingStars } from "@/components/product/RatingStars"
import { usePageMeta } from "@/hooks/usePageMeta"
import { useAuth } from "@/state/authStore"
import { getAverageRating, getReviewCount, slugify } from "@/utils/storefront"

export default function VendorStorePage() {
  const { vendorSlug = "" } = useParams()
  const auth = useAuth()

  const { data: vendors = [] } = useQuery({
    queryKey: ["storefront", "vendors", "store", vendorSlug],
    queryFn: getVendors,
    enabled: auth.isAuthenticated,
  })
  const { data: products = [] } = useQuery({
    queryKey: ["storefront", "products", "vendor-store", vendorSlug],
    queryFn: () => getProducts(false),
    enabled: auth.isAuthenticated,
  })

  const vendor = vendors.find((entry) => slugify(entry.companyName) === vendorSlug)
  const vendorProducts = useMemo(() => products.filter((product) => slugify(product.vendorCompanyName || product.vendorName) === vendorSlug), [products, vendorSlug])
  const vendorRating = vendorProducts.length > 0
    ? vendorProducts.reduce((total, product) => total + getAverageRating(product.id), 0) / vendorProducts.length
    : 0
  const vendorReviewCount = vendorProducts.reduce((total, product) => total + getReviewCount(product.id), 0)

  usePageMeta({
    title: vendor ? `${vendor.companyName} - Vendor Store` : "Vendor Store",
    description: vendor ? `Browse products sold by ${vendor.companyName}.` : "Browse a vendor storefront in the Codexsun marketplace.",
    canonicalPath: `/store/${vendorSlug}`,
  })

  if (!auth.isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <StorefrontAuthNotice title="Vendor storefronts require sign-in" description="The current vendor and product APIs are authenticated. Sign in to browse vendor storefronts and live vendor catalogs." />
      </div>
    )
  }

  if (!vendor) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6">Loading vendor storefront...</div>
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <section className="rounded-[2.4rem] border border-border/60 bg-[linear-gradient(135deg,#25140f,#59261b_55%,#c37d2f)] px-6 py-10 text-white shadow-[0_30px_90px_-44px_rgba(41,16,8,0.6)] sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-[0.32em] text-white/70">Vendor Store</div>
            <h1 className="text-4xl font-semibold">{vendor.companyName}</h1>
            <p className="max-w-2xl text-sm text-white/78">{vendor.website || vendor.email || "Vendor profile information is managed centrally in the platform."}</p>
          </div>
          <div className="rounded-[1.8rem] border border-white/15 bg-white/10 px-5 py-4">
            <div className="text-sm text-white/72">Seller Rating</div>
            <div className="mt-2"><RatingStars rating={vendorRating} reviewCount={vendorReviewCount} size="md" /></div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Products" value={String(vendorProducts.length)} />
        <Metric label="Staff Users" value={String(vendor.userCount)} />
        <Metric label="Status" value={vendor.status} />
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-semibold">Vendor Products</h2>
        <ProductGrid products={vendorProducts} emptyMessage="This vendor does not have published storefront products yet." />
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.8rem] border border-border/60 bg-card p-5 shadow-[0_20px_50px_-38px_rgba(40,28,18,0.18)]">
      <div className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{label}</div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
    </div>
  )
}
