// resources/js/components/blocks/menu/RightSection.tsx
'use client';

import { Link } from '@inertiajs/react';
import { LayoutDashboard, LogIn, Moon, Sun } from 'lucide-react';

interface RightSectionProps {
    auth: any;
    scrolled: boolean;
    darkMode: boolean;
    setDarkMode: (v: boolean) => void;
}

export default function RightSection({
    auth,
    scrolled,
    darkMode,
    setDarkMode,
}: RightSectionProps) {
    return (
        <div className="flex items-center gap-6">
            {auth?.user ? (
                <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 font-medium transition-colors ${
                        scrolled || darkMode ? 'text-primary' : 'text-secondary'
                    } hover:text-primary`}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                </Link>
            ) : (
                <Link
                    href="/login"
                    className={`flex items-center gap-2 font-medium transition-colors ${
                        scrolled || darkMode ? 'text-primary' : 'text-secondary'
                    } hover:text-primary`}
                >
                    <LogIn className="h-4 w-4" />
                    Log in
                </Link>
            )}

            <button
                onClick={() => setDarkMode(!darkMode)}
                className={`rounded-full p-2 transition-all hover:bg-accent ${
                    scrolled || darkMode ? 'text-primary' : 'text-secondary'
                }`}
            >
                {darkMode ? (
                    <Sun className="h-5 w-5" />
                ) : (
                    <Moon className="h-5 w-5" />
                )}
            </button>
        </div>
    );
}
