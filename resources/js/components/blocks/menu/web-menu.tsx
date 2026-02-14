'use client';

import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogIn, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ScrollProgress from '@/components/animate/ScrollProgress';
import { tenantNav } from '@/components/blocks/menu/tenantNav';
import { TenantLogo } from '@/components/theme/tenant-logo';
import { dashboard, login, register } from '@/routes';

export default function WebMenu() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const { auth } = usePage<never>().props;
    const { tenant } = usePage().props as any;
    const currentUrl = usePage<never>().url;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [darkMode]);

    const key = tenant?.key ?? 'default';
    const navItems = tenantNav[key] ?? tenantNav.default;

    const current = navItems.find((i) => i.href === currentUrl)?.name || '';

    return (
        <>
            <header
                className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                    scrolled ? 'bg-secondary shadow-md' : 'bg-transparent'
                }`}
            >
                <ScrollProgress />

                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/">
                            <div className="group flex items-center space-x-2 transition-transform duration-300 hover:scale-105">
                                <TenantLogo
                                    className={`h-auto w-8 transition-colors duration-300 ${
                                        scrolled || darkMode
                                            ? 'fill-primary text-primary'
                                            : 'fill-secondary text-secondary'
                                    }`}
                                />
                                <span
                                    className={`text-3xl font-semibold transition-colors duration-300 ${
                                        scrolled || darkMode
                                            ? 'text-primary'
                                            : 'text-secondary'
                                    }`}
                                >
                                    {tenant.name}
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <nav className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
                            <ul className="flex space-x-8">
                                {navItems.map((item) => {
                                    const active = current === item.name;

                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={`group relative overflow-hidden pb-1 font-medium transition-all duration-200 ${
                                                    scrolled || darkMode
                                                        ? 'text-primary'
                                                        : 'text-secondary'
                                                }`}
                                            >
                                                <span className="relative z-10">
                                                    {item.name}
                                                </span>

                                                {/* Animated Underline */}
                                                <span
                                                    className={`absolute bottom-0 left-0 h-0.5 w-full origin-left transform transition-all duration-300 ${
                                                        scrolled
                                                            ? 'bg-primary'
                                                            : 'bg-secondary'
                                                    } ${
                                                        active
                                                            ? 'scale-x-100'
                                                            : 'scale-x-0 group-hover:scale-x-100'
                                                    }`}
                                                ></span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        {/* Right Side */}
                        <div className="hidden items-center space-x-4 md:flex">
                            {auth?.user ? (
                                <Link
                                    href={dashboard()}
                                    className={`group flex items-center space-x-1 font-medium transition-all duration-200 ${
                                        scrolled || darkMode
                                            ? 'text-primary'
                                            : 'text-secondary'
                                    } hover:text-primary`}
                                >
                                    <LayoutDashboard className="h-4 w-4 transition-transform group-hover:scale-110" />
                                    <span>Dashboard</span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className={`group flex items-center font-medium transition-all duration-200 ${
                                            scrolled || darkMode
                                                ? 'text-primary'
                                                : 'text-secondary'
                                        } hover:text-primary`}
                                    >
                                        <LogIn className="mr-1 h-4 w-4 transition-transform group-hover:scale-110" />
                                        Log in
                                    </Link>
                                </>
                            )}

                            {/* Theme Toggle */}
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`rounded-full p-2 transition-all duration-200 ${
                                    scrolled || darkMode
                                        ? 'text-primary'
                                        : 'text-secondary'
                                } hover:bg-primary/10`}
                            >
                                {darkMode ? (
                                    <Sun className="h-5 w-5 transition-transform hover:rotate-180" />
                                ) : (
                                    <Moon className="h-5 w-5 transition-transform hover:-rotate-12" />
                                )}
                            </button>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileMenu(!mobileMenu)}
                            className={`p-1 transition-transform duration-200 md:hidden ${
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

                    {/* Mobile Menu */}
                    {mobileMenu && (
                        <div className="animate-in border-t border-primary/20 bg-secondary duration-300 slide-in-from-top-2 md:hidden">
                            <nav className="space-y-1 px-4 py-3">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenu(false)}
                                        className={`block rounded-md px-3 py-2 transition-all duration-200 ${
                                            current === item.name
                                                ? 'bg-primary font-semibold text-secondary'
                                                : 'text-primary hover:bg-primary/10'
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}

                                <div className="space-y-1 border-t border-primary/20 pt-3">
                                    {auth?.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="flex items-center rounded-md px-3 py-2 text-primary hover:bg-primary/10"
                                        >
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={login()}
                                                className="flex items-center rounded-md px-3 py-2 text-primary hover:bg-primary/10"
                                            >
                                                <LogIn className="mr-2 h-4 w-4" />
                                                Log in
                                            </Link>

                                            <Link
                                                href={register()}
                                                className="block rounded-md px-3 py-2 text-primary hover:bg-primary/10"
                                            >
                                                Register
                                            </Link>
                                        </>
                                    )}

                                    <button
                                        onClick={() => setDarkMode(!darkMode)}
                                        className="flex w-full items-center rounded-md px-3 py-2 text-primary hover:bg-primary/10"
                                    >
                                        {darkMode ? (
                                            <Sun className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Moon className="mr-2 h-4 w-4" />
                                        )}
                                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                                    </button>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}
