import { Outlet } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

import { getProductCategories } from "@/api/productApi"
import { StorefrontBottomNav } from "@/components/layout/storefront-bottom-nav"
import { StorefrontFooter } from "@/components/layout/storefront-footer"
import { StorefrontHeader } from "@/components/layout/storefront-header"
import { useAuth } from "@/state/authStore"

export default function MainLayout() {
  const auth = useAuth()
  const { data: categories = [] } = useQuery({
    queryKey: ["storefront", "categories", auth.isAuthenticated],
    queryFn: () => getProductCategories(false),
    enabled: auth.isAuthenticated,
  })

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f6efe6,transparent_30%),linear-gradient(180deg,#fcfbf8_0%,#f5efe7_100%)] text-foreground">
      <StorefrontHeader categories={categories.map((category) => ({ label: category.name, slug: category.slug }))} />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <StorefrontFooter />
      <StorefrontBottomNav />
    </div>
  )
}
