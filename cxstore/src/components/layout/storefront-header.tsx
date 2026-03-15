import { HeartIcon, LayoutDashboardIcon, ShoppingCartIcon, UserCircle2Icon } from "lucide-react"
import { Link } from "react-router-dom"

import { Navbar } from "@/components/layout/navbar"
import { StorefrontMobileMenu } from "@/components/layout/storefront-mobile-menu"
import { StorefrontSearchBar } from "@/components/layout/storefront-search-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/blocks/theme/mode-toggle"
import { useCompanyConfig } from "@/config/company"
import { useCartStore } from "@/state/cartStore"
import { logout, useAuth } from "@/state/authStore"
import { useWishlistStore } from "@/state/wishlistStore"

type HeaderCategory = {
  label: string
  slug: string
}

export function StorefrontHeader({ categories }: { categories: HeaderCategory[] }) {
  const { company } = useCompanyConfig()
  const auth = useAuth()
  const wishlistCount = useWishlistStore((state) => state.items.length)
  const cartItemsCount = useCartStore((state) => state.cart?.totalItems ?? 0)

  const navItems = [
    { title: "Home", url: "/" },
    ...categories.slice(0, 4).map((category) => ({ title: category.label, url: `/category/${category.slug}` })),
    { title: "Wishlist", url: "/wishlist" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <StorefrontMobileMenu links={navItems} />
        <Link to="/" className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#c88638,#5e2a1a)] text-sm font-semibold text-white">
              CX
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Marketplace</div>
              <div className="truncate font-semibold text-foreground">{company.displayName}</div>
            </div>
          </div>
        </Link>

        <div className="hidden flex-1 lg:block">
          <StorefrontSearchBar compact />
        </div>

        <Navbar items={navItems} />

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="icon" render={<Link to="/wishlist" />} className="relative rounded-full">
            <HeartIcon className="size-5" />
            {wishlistCount > 0 ? <Badge className="absolute -top-1 -right-1 min-w-5 justify-center rounded-full px-1 text-[10px]">{wishlistCount}</Badge> : null}
          </Button>
          <Button variant="ghost" size="icon" render={<Link to="/cart" />} className="relative rounded-full">
            <ShoppingCartIcon className="size-5" />
            {cartItemsCount > 0 ? <Badge className="absolute -top-1 -right-1 min-w-5 justify-center rounded-full px-1 text-[10px]">{cartItemsCount}</Badge> : null}
          </Button>
          {auth.isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" render={<Link to="/account" />} className="rounded-full">
                <UserCircle2Icon className="size-5" />
              </Button>
              <Button variant="outline" size="sm" render={<Link to="/dashboard" />} className="hidden rounded-full md:inline-flex">
                <LayoutDashboardIcon className="size-4" />
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={() => void logout()} className="hidden rounded-full md:inline-flex">
                Logout
              </Button>
            </>
          ) : (
            <Button render={<Link to="/login" />} className="rounded-full px-4">Sign In</Button>
          )}
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-3 lg:hidden">
        <div className="mx-auto max-w-7xl">
          <StorefrontSearchBar compact />
        </div>
      </div>
    </header>
  )
}
