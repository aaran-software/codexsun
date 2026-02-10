import { usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import WebMenu from '@/components/blocks/menu/web-menu';
import { useTenantFavicon } from '@/hooks/useTenantFavicon';

type Tenant = {
    key: string;
    name: string;
    industry: string;
};

export default function WebLayout({ children }: { children: React.ReactNode }) {
    useTenantFavicon();
    const { tenant } = usePage().props as {
        tenant?: Tenant;
    };

    useEffect(() => {
        if (tenant?.key) {
            document.documentElement.dataset.client = tenant.key;
        }
    }, [tenant?.key]);

    return (
        <>

            <WebMenu />
            {children}

            {/* DEV-only tenant badge */}
            {import.meta.env.DEV && tenant && (
                <div className="fixed right-2 bottom-2 rounded bg-black px-2 py-1 text-xs text-white shadow">
                    {tenant.key} · {tenant.industry}
                </div>
            )}
        </>
    );
}
