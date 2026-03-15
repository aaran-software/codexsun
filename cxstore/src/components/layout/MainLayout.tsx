import { Outlet } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

import { getProductCategories } from "@/api/productApi"
import { StorefrontBottomNav } from "@/components/layout/storefront-bottom-nav"
import { StorefrontFooter } from "@/components/layout/storefront-footer"
import { StorefrontHeader } from "@/components/layout/storefront-header"
import { useAuth } from "@/state/authStore"

function cleanCategoryLabel(label: string) {
  const trimmed = label.trim()
  const withoutHash = trimmed.replace(/\s+[0-9a-f]{8,}$/i, "")
  return withoutHash || "Category"
}

export default function MainLayout() {
  const auth = useAuth()
  const { data: categories = [] } = useQuery({
    queryKey: ["storefront", "categories", auth.isAuthenticated],
    queryFn: () => getProductCategories(false),
    enabled: auth.isAuthenticated,
  })

  const cleanCategories = categories
    .map((category) => ({
      label: cleanCategoryLabel(category.name),
      slug: category.slug,
    }))
    .filter((category, index, collection) =>
      collection.findIndex((candidate) => candidate.label === category.label) === index)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f6efe6,transparent_30%),linear-gradient(180deg,#fcfbf8_0%,#f5efe7_100%)] text-foreground">
      <StorefrontHeader categories={cleanCategories} />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <StorefrontFooter />
      <StorefrontBottomNav />
    </div>
  )
}
