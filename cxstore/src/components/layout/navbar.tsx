import { Link, useLocation } from "react-router-dom"

import { cn } from "@/lib/utils"

type NavItem = {
  title: string
  url: string
}

export function Navbar({ items }: { items: NavItem[] }) {
  const location = useLocation()

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {items.map((item) => {
        const isActive = location.pathname === item.url || location.pathname.startsWith(`${item.url}/`)

        return (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-medium transition",
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
