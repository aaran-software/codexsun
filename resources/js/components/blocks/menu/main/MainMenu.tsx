'use client';

import { usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import ScrollProgress from '@/components/blocks/animate/ScrollProgress';
import RichNavigationMenu from '@/components/blocks/menu/main/RichNavMenu';
import { cn } from '@/lib/utils';
import LogoSection from './LogoSection';

import MobileMenu from './MobileMenu';
import RightSection from './RightSection';


export default function MainMenu() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const { auth, currentTenant } = usePage().props as any;

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

                    {/* Right - Auth + Theme */}
                    <div className="hidden md:block">
                        <RightSection
                            auth={auth}
                            scrolled={scrolled}
                            darkMode={darkMode}
                            setDarkMode={setDarkMode}
                        />
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setMobileMenu(!mobileMenu)}
                        className={cn(
                            'cursor-pointer rounded-full p-2 transition-all duration-200 md:hidden',
                            scrolled || darkMode
                                ? 'text-foreground hover:bg-accent'
                                : 'text-white hover:bg-white/20',
                            'hover:scale-105 active:scale-95',
                        )}
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
                {mobileMenu && (
                    <MobileMenu
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
