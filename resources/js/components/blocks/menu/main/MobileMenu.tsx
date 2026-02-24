// resources/js/components/blocks/menu/MobileMenu.tsx
'use client';

import { Link } from '@inertiajs/react';
import { ChevronDown, LayoutDashboard, LogIn, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

import { dashboard, login, register } from '@/routes';

import type { MenuItem } from './types';
import { cn } from '@/lib/utils';

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
            <nav
                className={cn(
                    'divide-y divide-border/50 bg-background/95 backdrop-blur-lg',
                    darkMode ? 'dark' : '',
                )}
            >
                <div className="space-y-1 px-5 py-4">
                    {menu.map((item) => {
                        const hasChildren =
                            item.children && item.children.length > 0;
                        const isOpen = openMenus.has(item.label);

                        return (
                            <div key={item.label} className="relative">
                                {hasChildren ? (
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className="flex w-full items-center justify-between rounded-xl px-5 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                    >
                                        <span>{item.label}</span>
                                        <ChevronDown
                                            className={cn(
                                                'h-5 w-5 transition-transform duration-300',
                                                isOpen && 'rotate-180',
                                            )}
                                        />
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href || '#'}
                                        onClick={onClose}
                                        className="flex items-center rounded-xl px-5 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                    >
                                        {item.label}
                                    </Link>
                                )}

                                {hasChildren && isOpen && (
                                    <div className="mt-1 animate-in space-y-1 border-l border-border/40 pl-6 duration-200 fade-in-5 slide-in-from-top-1">
                                        {item.children!.map((child) => (
                                            <Link
                                                key={child.label}
                                                href={child.href}
                                                onClick={onClose}
                                                className="block rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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

                <div className="border-t border-border/50 px-5 py-5">
                    <div className="space-y-2">
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                onClick={onClose}
                                className="flex items-center gap-3 rounded-xl px-5 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                <LayoutDashboard className="h-5 w-5" />
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-5 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                    <LogIn className="h-5 w-5" />
                                    Log in
                                </Link>

                                <Link
                                    href={register()}
                                    onClick={onClose}
                                    className="block rounded-xl px-5 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
                            className="flex w-full items-center gap-3 rounded-xl px-5 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
