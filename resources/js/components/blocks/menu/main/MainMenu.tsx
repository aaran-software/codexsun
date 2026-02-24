// resources/js/components/blocks/menu/web-menu.tsx
'use client';

import { usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import ScrollProgress from '@/components/blocks/animate/ScrollProgress';
import LogoSection from './LogoSection';
import MainNavigation from './MainNavigation';
import MobileMenu from './MobileMenu';
import RightSection from './RightSection';

import type { MenuItem } from './types';
import RichNavigationMenu from '@/components/blocks/menu/main/SimpleMenuItem';

export default function WebMenu() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const { auth, currentTenant } = usePage().props as any;

    // Dummy rich data (replace with real backend later)
    const menu: MenuItem[] = [
        {
            label: 'Products',
            description: 'Powerful tools for modern businesses',
            children: [
                {
                    label: 'E-Commerce',
                    href: '/products/ecommerce',
                    description:
                        'Complete online store with payments & inventory',
                    icon: 'ShoppingCart',
                },
                {
                    label: 'Blog Platform',
                    href: '/products/blog',
                    description: 'SEO optimized blogging system',
                    icon: 'Newspaper',
                },
                {
                    label: 'CRM System',
                    href: '/products/crm',
                    description: 'Manage leads and customers effortlessly',
                    icon: 'Users',
                },
            ],
        },
        {
            label: 'Solutions',
            description: 'Tailored for every business size',
            children: [
                {
                    label: 'For Startups',
                    href: '/solutions/startups',
                    description: 'Launch fast with minimal cost',
                    icon: 'Rocket',
                },
                {
                    label: 'For Enterprises',
                    href: '/solutions/enterprise',
                    description: 'Enterprise-grade security & scale',
                    icon: 'Building2',
                },
            ],
        },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/web-contact' },
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <header
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white shadow-md dark:bg-gray-950'
                    : 'bg-transparent'
            }`}
        >
            <ScrollProgress />

            <div className="mx-auto px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Left - Logo */}
                    <LogoSection
                        currentTenant={currentTenant}
                        scrolled={scrolled}
                        darkMode={darkMode}
                    />

                    {/* Center - Mega Menu */}
                    <div className="hidden md:block">
                        <RichNavigationMenu
                            scrolled={scrolled}
                            darkMode={darkMode}
                        />
                    </div>

                    {/*Right - Auth + Theme*/}
                    <div className="hidden md:block">
                        <RightSection
                            auth={auth}
                            scrolled={scrolled}
                            darkMode={darkMode}
                            setDarkMode={setDarkMode}
                        />
                    </div>

                    {/*/!* Mobile Toggle *!/*/}
                    <button
                        onClick={() => setMobileMenu(!mobileMenu)}
                        className={`cursor-pointer p-1 transition-transform duration-200 md:hidden ${
                            scrolled || darkMode
                                ? 'text-primary'
                                : 'text-secondary'
                        } hover:scale-110`}
                    >
                        {mobileMenu ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            <div className="block md:hidden">
                {/* Mobile Menu */}
                {mobileMenu && (
                    <MobileMenu
                        menu={menu}
                        auth={auth}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        onClose={() => setMobileMenu(false)}
                    />
                )}
            </div>
        </header>
    );
}
