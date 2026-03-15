import { Link } from "react-router-dom"

import { useCompanyConfig } from "@/config/company"

export function StorefrontFooter() {
  const { company } = useCompanyConfig()

  return (
    <footer className="border-t border-border/70 bg-card/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="text-lg font-semibold">{company.displayName}</div>
          <p className="text-sm text-muted-foreground">
            Multi-vendor commerce, vendor-led supply, and operational workflows in one unified customer storefront.
          </p>
        </div>
        <div className="space-y-3">
          <div className="font-medium">Shop</div>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <Link to="/search">Search</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/account/orders">Orders</Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="font-medium">Company</div>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <Link to="/about">About</Link>
            <Link to="/services">Services</Link>
            <Link to="/contact">Support</Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="font-medium">Contact</div>
          <div className="grid gap-1 text-sm text-muted-foreground">
            <span>{company.supportEmail || company.email}</span>
            <span>{company.phone || "Customer support available on request"}</span>
            <span>{company.website || "https://codexsun.local"}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-4 text-center text-sm text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} {company.displayName}. Customer storefront powered by the Codexsun platform.
      </div>
    </footer>
  )
}
