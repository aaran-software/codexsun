import {
  HeartIcon,
  LayoutDashboardIcon,
  ShoppingCartIcon,
  UserCircle2Icon,
  ChevronDownIcon,
  PackageIcon,
  StoreIcon,
  GiftIcon,
  CreditCardIcon,
  BellIcon,
  HeadphonesIcon,
  TrendingUpIcon,
  DownloadIcon,
  LogOutIcon,
} from "lucide-react"
import { Link } from "react-router-dom"


import { StorefrontMobileMenu } from "@/components/layout/storefront-mobile-menu"
import { StorefrontSearchBar } from "@/components/layout/storefront-search-bar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
          <StorefrontSearchBar />
        </div>



        <div className="ml-auto flex items-center gap-2">
          <Link to="/wishlist" className={buttonVariants({ variant: "ghost", size: "icon", className: "relative rounded-full" })}>
            <HeartIcon className="size-5" />
            {wishlistCount > 0 ? <Badge className="absolute -top-1 -right-1 min-w-5 justify-center rounded-full px-1 text-[10px]">{wishlistCount}</Badge> : null}
          </Link>
          <Link to="/cart" className={buttonVariants({ variant: "ghost", size: "icon", className: "relative rounded-full" })}>
            <ShoppingCartIcon className="size-5" />
            {cartItemsCount > 0 ? <Badge className="absolute -top-1 -right-1 min-w-5 justify-center rounded-full px-1 text-[10px]">{cartItemsCount}</Badge> : null}
          </Link>
          {auth.isAuthenticated ? null : (
            <Link to="/login" className={buttonVariants({ className: "hidden rounded-full px-4 md:inline-flex" })}>
              Sign In
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "group cursor-pointer rounded-full px-3 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground md:px-4" })}>
              <UserCircle2Icon className="size-5 md:mr-2" />
              <span className="hidden md:inline-block">{auth.isAuthenticated ? "Account" : "Login"}</span>
              <ChevronDownIcon className="hidden size-4 transition-transform group-data-open:-rotate-180 group-data-[state=open]:-rotate-180 md:ml-1 md:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              {!auth.isAuthenticated ? (
                <>
                  <div className="mb-2 flex items-center justify-between px-2 py-2">
                    <span className="text-sm font-medium text-muted-foreground">New customer?</span>
                    <Link to="/register" className="text-sm font-bold text-primary hover:underline">
                      Sign Up
                    </Link>
                  </div>
                  <DropdownMenuSeparator className="mb-2" />
                </>
              ) : (
                <>
                  <div className="mb-2 flex flex-col px-2 py-2">
                    <span className="text-sm font-semibold">{auth.user?.username ?? "Customer"}</span>
                    <span className="text-xs text-muted-foreground">{auth.user?.email}</span>
                  </div>
                  <DropdownMenuSeparator className="mb-2" />
                </>
              )}

              <DropdownMenuItem render={<Link to="/account/profile" />} className="cursor-pointer">
                <UserCircle2Icon className="mr-3 size-4 text-muted-foreground" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/account/orders" />} className="cursor-pointer">
                <PackageIcon className="mr-3 size-4 text-muted-foreground" />
                <span>Orders</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/wishlist" />} className="cursor-pointer">
                <HeartIcon className="mr-3 size-4 text-muted-foreground" />
                <span>Wishlist</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/rewards" />} className="cursor-pointer">
                <GiftIcon className="mr-3 size-4 text-muted-foreground" />
                <span>Rewards</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/gift-cards" />} className="cursor-pointer">
                <CreditCardIcon className="mr-3 size-4 text-muted-foreground" />
                <span>Gift Cards</span>
              </DropdownMenuItem>

              {auth.isAuthenticated && (
                <>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem render={<Link to="/dashboard" />} className="cursor-pointer">
                    <LayoutDashboardIcon className="mr-3 size-4 text-muted-foreground" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={() => void logout()}>
                    <LogOutIcon className="mr-3 size-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "group cursor-pointer rounded-full px-3 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground md:px-4" })}>
              <span className="hidden text-sm font-medium md:inline-block">More</span>
              <ChevronDownIcon className="hidden size-4 transition-transform group-data-open:-rotate-180 group-data-[state=open]:-rotate-180 md:ml-1 md:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2">
              <div className="mb-2 px-2 py-2">
                <span className="text-sm font-semibold">Explore More Options</span>
              </div>
              <DropdownMenuSeparator className="mb-2" />
              <DropdownMenuItem render={<Link to="/vendor" />} className="cursor-pointer">
                <StoreIcon className="mr-3 size-4 text-muted-foreground" />
                <span>Become a Seller</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/account/notifications" />} className="cursor-pointer">
                <BellIcon className="mr-3 size-4 text-muted-foreground" />
                <span>Notification Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/support" />} className="cursor-pointer">
                <HeadphonesIcon className="mr-3 size-4 text-muted-foreground" />
                <span>24x7 Customer Care</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/advertise" />} className="cursor-pointer">
                <TrendingUpIcon className="mr-3 size-4 text-muted-foreground" />
                <span>Advertise</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/download" />} className="cursor-pointer">
                <DownloadIcon className="mr-3 size-4 text-muted-foreground" />
                <span>Download App</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-3 lg:hidden">
        <StorefrontSearchBar />
      </div>
    </header>
  )
}
