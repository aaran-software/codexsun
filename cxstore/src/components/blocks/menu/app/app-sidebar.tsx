import * as React from "react"
import { Link } from "react-router-dom"

import { getAdminMenuItems, getAnalyticsMenuItems, getCommonMenuItems, getInventoryMenuItems, getMasterMenuItems, getMediaMenuItems, getMonitoringMenuItems, getNotificationMenuItems, getPromotionMenuItems, getReturnsMenuItems, getSalesMenuItems, getSettingsMenuItems, getShippingMenuItems, getVendorMenuItems } from "@/components/admin/menu/admin-menu"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import { useAuth } from "@/state/authStore"
import { useCompanyConfig } from "@/config/company"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  BellIcon,
  BoxesIcon,
  ChartColumnBigIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  PackageSearchIcon,
  PackagePlusIcon,
  ReceiptTextIcon,
  SendIcon,
  Settings2Icon,
  ShieldCheckIcon,
  StoreIcon,
  SwatchBookIcon,
  TruckIcon,
  UsersRoundIcon,
  WalletCardsIcon,
} from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const auth = useAuth()
  const { company } = useCompanyConfig()
  const adminItems = getAdminMenuItems(auth.user?.role)
  const masterItems = getMasterMenuItems(auth.user?.role)
  const salesItems = getSalesMenuItems(auth.user?.role)
  const inventoryItems = getInventoryMenuItems(auth.user?.role)
  const vendorItems = getVendorMenuItems(auth.user?.role)
  const promotionItems = getPromotionMenuItems(auth.user?.role)
  const shippingItems = getShippingMenuItems(auth.user?.role)
  const returnsItems = getReturnsMenuItems(auth.user?.role)
  const analyticsItems = getAnalyticsMenuItems(auth.user?.role)
  const mediaItems = getMediaMenuItems(auth.user?.role)
  const notificationItems = getNotificationMenuItems(auth.user?.role)
  const monitoringItems = getMonitoringMenuItems(auth.user?.role)
  const settingsItems = getSettingsMenuItems(auth.user?.role)
  const commonItems = getCommonMenuItems(auth.user?.role)
  const portalHome = auth.user?.role === "Admin" ? "/admin" : auth.user?.role === "Vendor" ? "/vendor" : "/dashboard"
  const displayLogo = company.logoUrl || "/Aspire.png"

  const navMain = [
    {
      title: "Overview",
      url: portalHome,
      icon: <LayoutDashboardIcon />,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: portalHome,
        },
      ],
    },
    ...(masterItems.length > 0
      ? [
          {
            title: auth.user?.role === "Vendor" ? "Catalog" : "Catalog",
            url: masterItems[0]?.url ?? "/dashboard",
            icon: <SwatchBookIcon />,
            items: masterItems,
          },
        ]
      : []),
    ...(salesItems.length > 0
      ? [
          {
            title: "Sales",
            url: salesItems[0]?.url ?? "/dashboard",
            icon: <ReceiptTextIcon />,
            items: salesItems,
          },
        ]
      : []),
    ...(inventoryItems.length > 0
      ? [
          {
            title: "Inventory",
            url: inventoryItems[0]?.url ?? "/dashboard",
            icon: <BoxesIcon />,
            items: inventoryItems,
          },
        ]
      : []),
    ...(vendorItems.length > 0
      ? [
          {
            title: "Vendors",
            url: vendorItems[0]?.url ?? "/dashboard",
            icon: <StoreIcon />,
            items: vendorItems,
          },
        ]
      : []),
    ...(promotionItems.length > 0
      ? [
          {
            title: "Promotions",
            url: promotionItems[0]?.url ?? "/dashboard",
            icon: <PackagePlusIcon />,
            items: promotionItems,
          },
        ]
      : []),
    ...(shippingItems.length > 0
      ? [
          {
            title: "Shipping",
            url: shippingItems[0]?.url ?? "/dashboard",
            icon: <TruckIcon />,
            items: shippingItems,
          },
        ]
      : []),
    ...(returnsItems.length > 0
      ? [
          {
            title: "Returns",
            url: returnsItems[0]?.url ?? "/dashboard",
            icon: <ClipboardListIcon />,
            items: returnsItems,
          },
        ]
      : []),
    ...(analyticsItems.length > 0
      ? [
          {
            title: "Analytics",
            url: analyticsItems[0]?.url ?? "/dashboard",
            icon: <ChartColumnBigIcon />,
            items: analyticsItems,
          },
        ]
      : []),
    ...(commonItems.length > 0
      ? [
          {
            title: "Common",
            url: "/admin/common/brands",
            icon: <PackageSearchIcon />,
            items: commonItems,
          },
        ]
      : []),
    ...(mediaItems.length > 0
      ? [
          {
            title: "Media",
            url: mediaItems[0]?.url ?? "/dashboard",
            icon: <WalletCardsIcon />,
            items: mediaItems,
          },
        ]
      : []),
    ...(notificationItems.length > 0
      ? [
          {
            title: "Notifications",
            url: notificationItems[0]?.url ?? "/dashboard",
            icon: <BellIcon />,
            items: notificationItems,
          },
        ]
      : []),
    ...(monitoringItems.length > 0
      ? [
          {
            title: "Monitoring",
            url: monitoringItems[0]?.url ?? "/dashboard",
            icon: <ShieldCheckIcon />,
            items: monitoringItems,
          },
        ]
      : []),
    ...(settingsItems.length > 0
      ? [
          {
            title: "Settings",
            url: settingsItems[0]?.url ?? "/dashboard",
            icon: <Settings2Icon />,
            items: settingsItems,
          },
        ]
      : []),
    ...(adminItems.length > 0
      ? [
          {
            title: auth.user?.role === "Admin" ? "Administration" : "Workspace",
            url: adminItems[0]?.url ?? portalHome,
            icon: <UsersRoundIcon />,
            items: adminItems,
          },
        ]
      : []),
  ]

  const navSecondary = [
    {
      title: "Support",
      url: "/contact",
      icon: <LifeBuoyIcon />,
    },
    {
      title: "Feedback",
      url: "/contact",
      icon: <SendIcon />,
    },
  ]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to={portalHome} />}>
              <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/70 bg-sidebar-accent/40">
                <img src={displayLogo} alt={company.displayName} className="size-full object-cover" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{company.displayName}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{auth.user?.role ?? "Workspace"} Portal</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {/*<NavProjects projects={projects} />*/}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: auth.user?.username ?? auth.claims?.username ?? "Guest",
          email: auth.user?.email ?? "unknown@example.com",
          avatar: "",
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
