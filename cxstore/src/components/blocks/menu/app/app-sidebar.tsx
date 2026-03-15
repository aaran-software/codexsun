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
import { TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, LifeBuoyIcon, SendIcon, TerminalIcon, DatabaseIcon } from "lucide-react"

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

  const navMain = [
    {
      title: "Workspace",
      url: "/dashboard",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Account",
      url: auth.user?.role === "Vendor" ? "/vendor" : "/dashboard",
      icon: <BotIcon />,
      items: [
        {
          title: "Profile",
          url: "/dashboard",
        },
        {
          title: "Session",
          url: auth.user?.role === "Vendor" ? "/vendor" : "/dashboard",
        },
      ],
    },
    {
      title: "Documentation",
      url: "/services",
      icon: <BookOpenIcon />,
      items: [
        {
          title: "Services",
          url: "/services",
        },
        {
          title: "About",
          url: "/about",
        },
      ],
    },
    {
      title: "Administration",
      url: auth.user?.role === "Admin" ? "/admin" : "/dashboard",
      icon: <Settings2Icon />,
      items: adminItems,
    },
    ...(masterItems.length > 0
      ? [
          {
            title: "Master",
            url: masterItems[0]?.url ?? "/dashboard",
            icon: <DatabaseIcon />,
            items: masterItems,
          },
        ]
      : []),
    ...(salesItems.length > 0
      ? [
          {
            title: "Sales",
            url: salesItems[0]?.url ?? "/dashboard",
            icon: <DatabaseIcon />,
            items: salesItems,
          },
        ]
      : []),
    ...(inventoryItems.length > 0
      ? [
          {
            title: "Inventory",
            url: inventoryItems[0]?.url ?? "/dashboard",
            icon: <DatabaseIcon />,
            items: inventoryItems,
          },
        ]
      : []),
    ...(vendorItems.length > 0
      ? [
          {
            title: "Vendors",
            url: vendorItems[0]?.url ?? "/dashboard",
            icon: <DatabaseIcon />,
            items: vendorItems,
          },
        ]
      : []),
    ...(promotionItems.length > 0
      ? [
          {
            title: "Promotions",
            url: promotionItems[0]?.url ?? "/dashboard",
            icon: <DatabaseIcon />,
            items: promotionItems,
          },
        ]
      : []),
    ...(shippingItems.length > 0
      ? [
          {
            title: "Shipping",
            url: shippingItems[0]?.url ?? "/dashboard",
            icon: <DatabaseIcon />,
            items: shippingItems,
          },
        ]
      : []),
    ...(returnsItems.length > 0
      ? [
          {
            title: "Returns",
            url: returnsItems[0]?.url ?? "/dashboard",
            icon: <DatabaseIcon />,
            items: returnsItems,
          },
        ]
      : []),
    ...(analyticsItems.length > 0
      ? [
          {
            title: "Analytics",
            url: analyticsItems[0]?.url ?? "/dashboard",
            icon: <DatabaseIcon />,
            items: analyticsItems,
          },
        ]
      : []),
    ...(mediaItems.length > 0
      ? [
          {
            title: "Media",
            url: mediaItems[0]?.url ?? "/dashboard",
            icon: <DatabaseIcon />,
            items: mediaItems,
          },
        ]
      : []),
    ...(notificationItems.length > 0
      ? [
          {
            title: "Notifications",
            url: notificationItems[0]?.url ?? "/dashboard",
            icon: <DatabaseIcon />,
            items: notificationItems,
          },
        ]
      : []),
    ...(monitoringItems.length > 0
      ? [
          {
            title: "Monitoring",
            url: monitoringItems[0]?.url ?? "/dashboard",
            icon: <DatabaseIcon />,
            items: monitoringItems,
          },
        ]
      : []),
    ...(settingsItems.length > 0
      ? [
          {
            title: "Settings",
            url: settingsItems[0]?.url ?? "/dashboard",
            icon: <DatabaseIcon />,
            items: settingsItems,
          },
        ]
      : []),
    ...(commonItems.length > 0
      ? [
          {
            title: "Common",
            url: "/admin/common/brands",
            icon: <DatabaseIcon />,
            items: commonItems,
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
            <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TerminalIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{company.displayName}</span>
                <span className="truncate text-xs">{auth.user?.role ?? "Workspace"}</span>
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
