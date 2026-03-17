import { Link } from "react-router-dom"
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon, MapPinIcon, MailIcon, PhoneIcon } from "lucide-react"

import { useCompanyConfig } from "@/config/company"

export function StorefrontFooter() {
  const { company } = useCompanyConfig()

  return (
    <footer className="w-full border-t border-border/70 bg-card/60 pt-16 pb-8">
      {/* Main Footer Content */}
      <div className="mx-auto w-full px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-8">
          
          {/* Brand & About Column (Takes up 2 cols on lg screens) */}
          <div className="space-y-6 lg:col-span-2 lg:pr-8">
            <Link to="/" className="inline-block">
              <div className="flex items-center gap-3">
                {company.logoUrl ? (
                  <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-border/50">
                    <img src={company.logoUrl} alt={company.displayName} className="size-full object-contain" />
                  </div>
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#c88638,#5e2a1a)] text-sm font-bold text-white shadow-md">
                    {company.displayName.slice(0, 2).toUpperCase() || "CX"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight text-foreground">{company.displayName}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Marketplace</span>
                </div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your premier destination for multi-vendor commerce. Discover curated products from trusted sellers around the world, all in one unified shopping experience with faster checkout flows.
            </p>
            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              {(company.address?.addressLine1 || company.address?.cityName || company.address?.stateName) ? (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {[company.address?.addressLine1, company.address?.addressLine2, company.address?.cityName, company.address?.stateName, company.address?.pincodeValue].filter(Boolean).join(", ")}
                  </span>
                </div>
              ) : null}
              {company.phone ? (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="size-4 shrink-0" />
                  <a href={`tel:${company.phone}`} className="hover:text-foreground transition-colors">{company.phone}</a>
                </div>
              ) : null}
              {(company.supportEmail || company.email) ? (
                <div className="flex items-center gap-3">
                  <MailIcon className="size-4 shrink-0" />
                  <a href={`mailto:${company.supportEmail || company.email}`} className="hover:text-foreground transition-colors">{company.supportEmail || company.email}</a>
                </div>
              ) : null}
              {company.website ? (
                <div className="flex items-center gap-3">
                  <span className="size-4 shrink-0 text-center text-xs">🌐</span>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">{company.website.replace(/^https?:\/\//, "")}</a>
                </div>
              ) : null}
            </div>
          </div>

          {/* Categories Column */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Top Categories</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li><Link to="/category/electronics" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Electronics & Gadgets</Link></li>
              <li><Link to="/category/fashion" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Fashion & Apparel</Link></li>
              <li><Link to="/category/home-decor" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Home & Furniture</Link></li>
              <li><Link to="/category/beauty" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Beauty & Personal Care</Link></li>
              <li><Link to="/category/sports" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Sports & Outdoors</Link></li>
              <li><Link to="/search" className="inline-block font-medium text-foreground transition-transform hover:-translate-y-0.5 hover:text-primary">View All Categories →</Link></li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Help & Support</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li><Link to="/help" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Help Center / FAQ</Link></li>
              <li><Link to="/account/orders" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Track Your Order</Link></li>
              <li><Link to="/returns" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Returns & Exchanges</Link></li>
              <li><Link to="/shipping" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Shipping Information</Link></li>
              <li><Link to="/contact" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>

          {/* About Us Column */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">About Us</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Our Story</Link></li>
              <li><Link to="/careers" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Careers</Link></li>
              <li><Link to="/vendor" className="inline-block font-medium text-primary transition-transform hover:-translate-y-0.5 hover:text-primary/80">Become a Seller</Link></li>
              <li><Link to="/press" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Press & News</Link></li>
              <li><Link to="/investors" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Investor Relations</Link></li>
            </ul>
          </div>

          {/* Legal column */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Legal & Policies</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li><Link to="/terms" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Cookie Policy</Link></li>
              <li><Link to="/accessibility" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Accessibility</Link></li>
              <li><Link to="/shipping-carriers" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Shipping Carriers</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Copyright & Socials Bar */}
      <div className="mt-16 border-t border-border/60">
        <div className="mx-auto flex w-full flex-col items-center justify-between gap-6 px-6 py-6 md:flex-row md:px-12 lg:px-16">
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" className="flex size-10 items-center justify-center rounded-full transition-all hover:-translate-y-1 hover:bg-black hover:text-white hover:shadow-md dark:hover:bg-white dark:hover:text-black">
              <FacebookIcon className="size-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="flex size-10 items-center justify-center rounded-full transition-all hover:-translate-y-1 hover:bg-black hover:text-white hover:shadow-md dark:hover:bg-white dark:hover:text-black">
              <TwitterIcon className="size-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="flex size-10 items-center justify-center rounded-full transition-all hover:-translate-y-1 hover:bg-black hover:text-white hover:shadow-md dark:hover:bg-white dark:hover:text-black">
              <InstagramIcon className="size-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="flex size-10 items-center justify-center rounded-full transition-all hover:-translate-y-1 hover:bg-black hover:text-white hover:shadow-md dark:hover:bg-white dark:hover:text-black">
              <YoutubeIcon className="size-5" />
              <span className="sr-only">YouTube</span>
            </a>
          </div>

          <div className="text-center text-sm text-muted-foreground md:text-right">
            © {new Date().getFullYear()} {company.legalName || company.displayName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
