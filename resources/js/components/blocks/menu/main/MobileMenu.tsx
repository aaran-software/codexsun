// resources/js/components/blocks/menu/MobileMenu.tsx
'use client';

import { Link } from '@inertiajs/react';
import { ChevronDown, LayoutDashboard, LogIn, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

import { dashboard, login, register } from '@/routes';

import type { MenuItem } from './types';

interface MobileMenuProps {
    menu: MenuItem[];
    auth: any;
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    onClose: () => void;
}

export default function MobileMenu({
    menu,
    auth,
    darkMode,
    setDarkMode,
    onClose,
}: MobileMenuProps) {
    const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

    const toggleMenu = (label: string) => {
        const newSet = new Set(openMenus);
        if (newSet.has(label)) {
            newSet.delete(label);
        } else {
            newSet.add(label);
        }
        setOpenMenus(newSet);
    };

    return (
        <div className="animate-in duration-300 fade-in-10 slide-in-from-top-2">
            <nav className="divide-y divide-primary/10 bg-secondary/95 backdrop-blur-lg">
                <div className="space-y-1 px-4 py-3">
                    {menu.map((item) => {
                        const hasChildren =
                            item.children && item.children.length > 0;
                        const isOpen = openMenus.has(item.label);

                        return (
                            <div key={item.label} className="relative">
                                {hasChildren ? (
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium text-primary transition-colors hover:bg-primary/10"
                                    >
                                        <span>{item.label}</span>
                                        <ChevronDown
                                            className={`h-5 w-5 transition-transform duration-300 ${
                                                isOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href || '#'}
                                        onClick={onClose}
                                        className="flex items-center rounded-lg px-4 py-3 text-base font-medium text-primary transition-colors hover:bg-primary/10"
                                    >
                                        {item.label}
                                    </Link>
                                )}

                                {hasChildren && isOpen && (
                                    <div className="mt-1 animate-in space-y-1 border-l border-primary/20 pl-6 duration-200 fade-in-5 slide-in-from-top-1">
                                        {item.children!.map((child) => (
                                            <Link
                                                key={child.label}
                                                href={child.href}
                                                onClick={onClose}
                                                className="block rounded-lg px-4 py-2.5 text-sm text-primary/90 transition-colors hover:bg-primary/5 hover:text-primary"
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="border-t border-primary/10 px-4 py-4">
                    <div className="space-y-2">
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                onClick={onClose}
                                className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-primary transition-colors hover:bg-primary/10"
                            >
                                <LayoutDashboard className="h-5 w-5" />
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-primary transition-colors hover:bg-primary/10"
                                >
                                    <LogIn className="h-5 w-5" />
                                    Log in
                                </Link>

                                <Link
                                    href={register()}
                                    onClick={onClose}
                                    className="block rounded-lg px-4 py-3 text-base font-medium text-primary transition-colors hover:bg-primary/10"
                                >
                                    Register
                                </Link>
                            </>
                        )}

                        <button
                            onClick={() => {
                                setDarkMode(!darkMode);
                                onClose();
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-primary transition-colors hover:bg-primary/10"
                        >
                            {darkMode ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
}
