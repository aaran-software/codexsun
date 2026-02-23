'use client';

import { usePage } from '@inertiajs/react';

import { Command } from 'lucide-react';
import * as React from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuButton,
    SidebarRail,
} from '@/components/ui/sidebar';
import { AdminMain } from './admin-main';
import {data} from './menu'
import { NavProjects } from './nav-projects';
import { NavUser } from './nav-user';

// Quick fix version
interface TenantQuick {
    name: string;
    tagline?: string;
    // add other fields you actually use
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { currentTenant } = usePage().props as {
        currentTenant?: TenantQuick;
    };
    const name = currentTenant?.name ?? 'Aaran';
    const tagline = currentTenant?.tagline ?? 'ERP + CMS Platform';

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenuButton size="lg" asChild>
                    <a href="#">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <Command className="size-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{name}</span>
                            <span className="truncate text-xs">{tagline}</span>
                        </div>
                    </a>
                </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent>
                <AdminMain items={data.navMain} />
                <NavProjects projects={data.projects} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser/>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
