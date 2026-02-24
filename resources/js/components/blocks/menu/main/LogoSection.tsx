// resources/js/components/blocks/menu/LogoSection.tsx
'use client';

import { Link } from '@inertiajs/react';
import { TenantLogo } from '@/components/blocks/logo/tenant-logo';

interface LogoSectionProps {
    currentTenant: any;
    scrolled: boolean;
    darkMode: boolean;
}

export default function LogoSection({
    currentTenant,
    scrolled,
    darkMode,
}: LogoSectionProps) {
    return (
        <Link href="/">
            <div className="group flex items-center space-x-3 transition-transform hover:scale-105">
                <TenantLogo
                    className={`h-9 w-auto transition-colors ${
                        scrolled || darkMode
                            ? 'fill-primary text-primary'
                            : 'fill-secondary text-secondary'
                    }`}
                />
                <span
                    className={`text-3xl font-bold tracking-tight transition-colors ${
                        scrolled || darkMode ? 'text-primary' : 'text-secondary'
                    }`}
                >
                    {currentTenant?.display_name ??
                        currentTenant?.name ??
                        'Aaran'}
                </span>
            </div>
        </Link>
    );
}
