'use client';

import { Link, usePage } from '@inertiajs/react';
import * as React from 'react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const menuItems = [
    { title: 'About', href: '/about' },
    { title: 'Modules', hasDropdown: true },
    { title: 'Finance', hasDropdown: true },
    { title: 'Sales', hasDropdown: true },
    { title: 'Blog', href: '/blog' },
    { title: 'Contact', href: '/web-contact' },
];

const featuredModules = [
    {
        title: 'Finance',
        description: 'Invoicing, payments, expense tracking & multi-currency',
        image: '/images/module-finance.jpg',
        href: '/modules/finance',
    },
    {
        title: 'HR & Payroll',
        description: 'Employee management, attendance, payroll & leave',
        image: '/images/module-hr.jpg',
        href: '/modules/hr',
    },
    {
        title: 'Inventory',
        description: 'Stock management, warehouse, purchase & sales orders',
        image: '/images/module-inventory.jpg',
        href: '/modules/inventory',
    },
];

const featuredFinance = [
    {
        title: 'Accounts Payable',
        description: 'Vendor bills, payments & reconciliation',
        image: '/images/finance-ap.jpg',
        href: '/finance/payable',
    },
    {
        title: 'Accounts Receivable',
        description: 'Customer invoices & collections',
        image: '/images/finance-ar.jpg',
        href: '/finance/receivable',
    },
    {
        title: 'General Ledger',
        description: 'Journal entries & financial statements',
        image: '/images/finance-gl.jpg',
        href: '/finance/ledger',
    },
];

const featuredSales = [
    {
        title: 'Quotes & Orders',
        description: 'Create quotes, convert to sales orders',
        image: '/images/sales-quotes.jpg',
        href: '/sales/orders',
    },
    {
        title: 'POS & Invoicing',
        description: 'Point of sale & instant invoicing',
        image: '/images/sales-pos.jpg',
        href: '/sales/pos',
    },
    {
        title: 'Customer Management',
        description: 'CRM, contacts & sales pipeline',
        image: '/images/sales-crm.jpg',
        href: '/sales/customers',
    },
];

const quickLinks = [
    { title: 'All Modules', href: '/modules' },
    { title: 'Recent Activities', href: '/activities' },
    { title: 'Notifications', href: '/notifications' },
    { title: 'Help Center', href: '/help' },
];

export default function RichNavMenu() {
    const { url } = usePage();
    const currentPath = (url.split('?')[0] || '/').replace(/\/$/, '');

    const isActive = (href?: string) => {
        if (!href) return false;
        const cleanHref = href.replace(/\/$/, '');
        if (cleanHref === '/') return currentPath === '' || currentPath === '/';
        return (
            currentPath === cleanHref || currentPath.startsWith(cleanHref + '/')
        );
    };

    return (
        <NavigationMenu className="max-w-none justify-center">
            <NavigationMenuList className="gap-8">
                {menuItems.map((item) => (
                    <NavigationMenuItem key={item.title}>
                        {item.hasDropdown ? (
                            <>
                                <NavigationMenuTrigger
                                    className={cn(
                                        'group relative inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-base font-medium transition-colors select-none',
                                        'bg-transparent text-foreground hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-foreground',
                                        'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:transition-transform after:duration-250',
                                        'after:origin-right after:scale-x-0 hover:after:origin-left hover:after:scale-x-100 data-[state=open]:after:scale-x-100',
                                        isActive(item.href) &&
                                            'text-primary after:scale-x-100',
                                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                    )}
                                >
                                    {item.title}
                                </NavigationMenuTrigger>

                                <NavigationMenuContent className="overflow-hidden border-0 bg-transparent p-0 shadow-none">
                                    <div className="w-[920px] rounded-lg border bg-popover p-6 shadow-xl">
                                        <div className="grid grid-cols-12 gap-8">
                                            <div className="col-span-8">
                                                <div className="grid grid-cols-3 gap-6">
                                                    {(item.title === 'Modules'
                                                        ? featuredModules
                                                        : item.title ===
                                                            'Finance'
                                                          ? featuredFinance
                                                          : featuredSales
                                                    ).map((mod) => (
                                                        <Link
                                                            key={mod.title}
                                                            href={mod.href}
                                                            className={cn(
                                                                'group relative flex h-64 flex-col overflow-hidden rounded-xl border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
                                                                isActive(
                                                                    mod.href,
                                                                ) &&
                                                                    'bg-primary/5 ring-2 shadow-primary/20 ring-primary/70 ring-offset-2',
                                                            )}
                                                        >
                                                            <div className="relative h-3/5 w-full overflow-hidden">
                                                                <img
                                                                    src={
                                                                        mod.image
                                                                    }
                                                                    alt={
                                                                        mod.title
                                                                    }
                                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                                            </div>
                                                            <div className="flex flex-1 flex-col justify-center gap-2 px-5 pt-4 pb-6">
                                                                <h4
                                                                    className={cn(
                                                                        'text-base leading-tight font-semibold tracking-tight',
                                                                        isActive(
                                                                            mod.href,
                                                                        ) &&
                                                                            'text-primary',
                                                                    )}
                                                                >
                                                                    {mod.title}
                                                                </h4>
                                                                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                                                    {
                                                                        mod.description
                                                                    }
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="col-span-4 border-l pl-8">
                                                <div className="space-y-5">
                                                    <h6 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                        Quick Access
                                                    </h6>

                                                    <ul className="space-y-1.5">
                                                        {quickLinks.map(
                                                            (link) => (
                                                                <li
                                                                    key={
                                                                        link.title
                                                                    }
                                                                >
                                                                    <Link
                                                                        href={
                                                                            link.href
                                                                        }
                                                                        className={cn(
                                                                            'block rounded-md px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-transparent hover:text-foreground',
                                                                            isActive(
                                                                                link.href,
                                                                            ) &&
                                                                                'bg-muted/50 font-semibold text-primary',
                                                                        )}
                                                                    >
                                                                        {
                                                                            link.title
                                                                        }
                                                                    </Link>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>

                                                    <div className="pt-4">
                                                        <Link
                                                            href="/modules"
                                                            className={cn(
                                                                'inline-flex items-center gap-2 rounded-md border bg-background px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-transparent hover:text-foreground',
                                                                isActive(
                                                                    '/modules',
                                                                ) &&
                                                                    'border-primary bg-primary/5 font-semibold text-primary',
                                                            )}
                                                        >
                                                            Explore All Modules
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </NavigationMenuContent>
                            </>
                        ) : (
                            <Link href={item.href ?? '#'} className="block">
                                <div
                                    className={cn(
                                        'inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-base font-medium transition-colors select-none',
                                        'bg-transparent text-foreground hover:bg-transparent hover:text-foreground',
                                        isActive(item.href) && 'text-primary',
                                        'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:transition-transform after:duration-250',
                                        'after:origin-right after:scale-x-0',
                                        isActive(item.href)
                                            ? 'after:scale-x-100'
                                            : 'hover:after:origin-left hover:after:scale-x-100',
                                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                    )}
                                >
                                    {item.title}
                                </div>
                            </Link>
                        )}
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
