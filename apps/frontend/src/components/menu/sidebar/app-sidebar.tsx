"use client"

import * as React from "react"
import {
    BookOpen,
    Bot,
    Frame,
    Map,
    PieChart,
    Settings2,
    LayoutDashboard,
    SquareTerminal
} from "lucide-react"

import {NavMain} from "./nav-main"
import {NavProjects} from "./nav-projects"
import {NavUser} from "./nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarRail,
} from "../../ui/sidebar"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
            isActive: true,
            items: [
                {
                    title: "view-1",
                    url: "/dashboard",
                },
                {
                    title: "view-2",
                    url: "/dashboard",
                },
            ],
        },
        {
            title: "Master",
            url: "/master",
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: "User",
                    url: "/users",
                },
                {
                    title: "Credits",
                    url: "/credit",
                },
                {
                    title: "Todos",
                    url: "/todos",
                },
            ],
        },
        {
            title: "Models",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "User",
                    url: "/user",
                },
                {
                    title: "iuser",
                    url: "/iuser",
                },
                {
                    title: "itodos",
                    url: "/itodos",
                },
            ],
        },
        {
            title: "Documentation",
            url: "#",
            icon: BookOpen,
            items: [
                {
                    title: "Introduction",
                    url: "#",
                },
                {
                    title: "Get Started",
                    url: "#",
                },
                {
                    title: "Tutorials",
                    url: "#",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "UI Components",
            url: "#",
            icon: SquareTerminal,
            items: [
                {
                    title: "Templates",
                    url: "/templates",
                },
                {
                    title: "card",
                    url: "/card",
                },
                {
                    title: "button",
                    url: "/button",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: Frame,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Travel",
            url: "#",
            icon: Map,
        },
    ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarContent>
                <NavMain items={data.navMain}/>
                <NavProjects projects={data.projects}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user}/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
