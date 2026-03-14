import * as React from "react"
import { Link } from "react-router-dom"

import { getAdminMenuItems } from "@/components/admin/menu/admin-menu"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import { useAuth } from "@/state/authStore"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, LifeBuoyIcon, SendIcon, FrameIcon, PieChartIcon, MapIcon, TerminalIcon } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const auth = useAuth()
  const adminItems = getAdminMenuItems(auth.user?.role)

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

  const projects = [
    {
      name: "Identity",
      url: "/dashboard",
      icon: <FrameIcon />,
    },
    {
      name: "Analytics",
      url: "/dashboard",
      icon: <PieChartIcon />,
    },
    {
      name: "Routing",
      url: "/dashboard",
      icon: <MapIcon />,
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
                <span className="truncate font-medium">Codexsun</span>
                <span className="truncate text-xs">{auth.user?.role ?? "Workspace"}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
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
