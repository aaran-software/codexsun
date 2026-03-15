import { MenuIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type MobileMenuLink = {
  title: string
  url: string
}

export function StorefrontMobileMenu({ links }: { links: MobileMenuLink[] }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="icon" className="rounded-full md:hidden"><MenuIcon className="size-5" /></Button>} />
      <SheetContent side="left" className="w-[320px]">
        <SheetHeader>
          <SheetTitle>Browse Store</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 grid gap-3">
          {links.map((link) => (
            <Link
              key={link.url}
              to={link.url}
              className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-accent"
            >
              {link.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
