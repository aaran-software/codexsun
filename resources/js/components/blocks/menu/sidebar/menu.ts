import {
    BookOpen,
    Bot,
    Frame,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
} from 'lucide-react';

// This is sample data.
export const data = {
    navMain: [
        {
            title: 'Playground',
            url: '#',
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: 'History',
                    url: '#',
                },
                {
                    title: 'Starred',
                    url: '#',
                },
                {
                    title: 'Settings',
                    url: '#',
                },
            ],
        },
        {
            title: 'Models',
            url: '#',
            icon: Bot,
            items: [
                {
                    title: 'Genesis',
                    url: '#',
                },
                {
                    title: 'Explorer',
                    url: '#',
                },
                {
                    title: 'Quantum',
                    url: '#',
                },
            ],
        },
        {
            title: 'Documentation',
            url: '#',
            icon: BookOpen,
            items: [
                {
                    title: 'Introduction',
                    url: '#',
                },
                {
                    title: 'Get Started',
                    url: '#',
                },
                {
                    title: 'Tutorials',
                    url: '#',
                },
                {
                    title: 'Changelog',
                    url: '#',
                },
            ],
        },
        {
            title: 'Admin',
            url: '#',
            icon: Settings2,
            items: [
                {
                    title: 'Tenant',
                    url: '/admin/tenants',
                },
                {
                    title: 'Domain',
                    url: '/admin/domains',
                },
                {
                    title: 'Features',
                    url: '/admin/features',
                },
                {
                    title: 'Tenant Features',
                    url: '/admin/tenant-features',
                },
                {
                    title: 'Menu Group',
                    url: '/admin/menu-groups',
                },
                {
                    title: 'Menu',
                    url: '/admin/menus',
                },
            ],
        },
    ],
    projects: [
        {
            name: 'Templates',
            url: '/template',
            icon: Frame,
        },
        {
            name: 'Sales & Marketing',
            url: '#',
            icon: PieChart,
        },
        {
            name: 'Travel',
            url: '#',
            icon: Map,
        },
    ],
};
