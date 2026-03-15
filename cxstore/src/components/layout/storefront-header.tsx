import { HeartIcon, LayoutDashboardIcon, ShoppingCartIcon, UserCircle2Icon } from "lucide-react"
import { Link } from "react-router-dom"

import { Navbar } from "@/components/layout/navbar"
import { StorefrontMobileMenu } from "@/components/layout/storefront-mobile-menu"
import { StorefrontSearchBar } from "@/components/layout/storefront-search-bar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
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
    { title: "Shop", url: "/search" },
    { title: "Deals", url: "/search?sort=price-asc" },
    { title: "Support", url: "/contact" },
    ...(auth.isAuthenticated ? [{ title: "Orders", url: "/account/orders" }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="flex w-full items-center gap-3 px-4 py-3 sm:px-6">
        <StorefrontMobileMenu links={navItems} categories={categories.slice(0, 6)} />
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

        <div className="hidden min-w-[16rem] flex-1 lg:block">
          <StorefrontSearchBar compact />
        </div>

        <Navbar items={navItems} />

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <Link to="/wishlist" className={buttonVariants({ variant: "ghost", size: "icon", className: "relative rounded-full" })}>
            <HeartIcon className="size-5" />
            {wishlistCount > 0 ? <Badge className="absolute -top-1 -right-1 min-w-5 justify-center rounded-full px-1 text-[10px]">{wishlistCount}</Badge> : null}
          </Link>
          <Link to="/cart" className={buttonVariants({ variant: "ghost", size: "icon", className: "relative rounded-full" })}>
            <ShoppingCartIcon className="size-5" />
            {cartItemsCount > 0 ? <Badge className="absolute -top-1 -right-1 min-w-5 justify-center rounded-full px-1 text-[10px]">{cartItemsCount}</Badge> : null}
          </Link>
          {auth.isAuthenticated ? (
            <>
              <Link to="/account" className={buttonVariants({ variant: "ghost", size: "icon", className: "rounded-full" })}>
                <UserCircle2Icon className="size-5" />
              </Link>
              <Link to="/dashboard" className={buttonVariants({ variant: "outline", size: "sm", className: "hidden rounded-full md:inline-flex" })}>
                <LayoutDashboardIcon className="size-4" />
                Dashboard
              </Link>
              <button type="button" onClick={() => void logout()} className={buttonVariants({ variant: "outline", size: "sm", className: "hidden rounded-full md:inline-flex" })}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className={buttonVariants({ className: "rounded-full px-4" })}>Sign In</Link>
          )}
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-3 lg:hidden">
        <StorefrontSearchBar compact />
      </div>
    </header>
  )
}
