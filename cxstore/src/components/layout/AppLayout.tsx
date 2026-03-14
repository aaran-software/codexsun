import { HomeIcon } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

type BreadcrumbEntry = {
  label: string
  href?: string
}

const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Admin",
  users: "User",
  create: "Create",
  edit: "Edit",
  roles: "Role",
  permissions: "Permissions",
  vendor: "Vendor",
  common: "Common",
  cities: "City",
  states: "State",
  "product-types": "Product Type",
  units: "Unit",
  brands: "Brand",
}

const hiddenSegments = new Set(["admin", "vendor", "common"])

function toTitleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function buildBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) {
    return [{ label: "Home" }]
  }

  const breadcrumbs: BreadcrumbEntry[] = [{ label: "Home", href: "/dashboard" }]

  if (pathname === "/dashboard") {
    return breadcrumbs
  }

  const visibleSegments = segments.filter((segment, index) => {
    if (index === 0 && (segment === "admin" || segment === "vendor")) {
      return false
    }

    if (segment === "common") {
      return false
    }

    return true
  })

  const idSegmentIndex = segments.findIndex((segment, index) => index > 0 && /^\d+$/.test(segment))

  visibleSegments.forEach((segment, index) => {
    const isLast = index === visibleSegments.length - 1
    const isIdLike = /^[0-9a-f-]{8,}$/i.test(segment)

    if (isIdLike) {
      return
    }

    const segmentIndex = segments.findIndex((value, searchIndex) => value === segment && !hiddenSegments.has(value) && searchIndex > 0)
    const href = isLast
      ? undefined
      : (() => {
          if (segment === "create" || segment === "edit") {
            return undefined
          }

          if (segments[0] === "admin") {
            if (segments[1] === "common" && segments[2]) {
              return `/admin/common/${segments[2]}`
            }

            if (segments[1]) {
              return `/admin/${segments[1]}`
            }
          }

          if (segments[0] === "vendor") {
            return "/vendor"
          }

          return `/${segments.slice(0, segmentIndex + 1).join("/")}`
        })()

    if (segment === "create" || segment === "edit") {
      breadcrumbs.push({ label: breadcrumbLabels[segment] ?? toTitleCase(segment) })
      return
    }

    if (idSegmentIndex !== -1 && segment === "permissions") {
      breadcrumbs.push({ label: "Permissions" })
      return
    }

    breadcrumbs.push({
      label: breadcrumbLabels[segment] ?? toTitleCase(segment),
      href,
    })
  })

  return breadcrumbs
}

export default function AppLayout() {
  const location = useLocation()
  const breadcrumbs = buildBreadcrumbs(location.pathname)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-11">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => {
                  const isLast = index === breadcrumbs.length - 1

                  return (
                    <div key={`${breadcrumb.label}-${index}`} className="inline-flex items-center gap-1">
                      <BreadcrumbItem>
                        {isLast || !breadcrumb.href ? (
                          <BreadcrumbPage className="inline-flex items-center gap-1.5">
                            {index === 0 ? <HomeIcon className="size-4" /> : null}
                            <span>{breadcrumb.label}</span>
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            className="inline-flex items-center gap-1.5"
                            render={<Link to={breadcrumb.href} />}
                          >
                            {index === 0 ? <HomeIcon className="size-4" /> : null}
                            <span>{breadcrumb.label}</span>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast ? <BreadcrumbSeparator /> : null}
                    </div>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-3">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
