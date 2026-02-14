import { usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import WebMenu from '@/components/blocks/menu/web-menu';
import { useTenantFavicon } from '@/hooks/useTenantFavicon';
import GlobalSpinner from '@/components/blocks/spinner/global-spinner';

type Theme = {
    colors?: Record<string, string>;
    typography?: {
        font_family?: string;
    };
    radius?: Record<string, string>;
    logos?: {
        menu?: { src: string; width: number; height: number };
        footer?: { src: string; width: number; height: number };
        spinner?: { src: string; width: number; height: number };
    };
    features?: {
        has_login?: boolean;
        has_register?: boolean;
    };
};

type Tenant = {
    key: string;
    name: string;
    industry: string;
    theme?: Theme;
};

export default function WebLayout({ children }: { children: React.ReactNode }) {
    useTenantFavicon();

    const { tenant } = usePage().props as {
        tenant?: Tenant;
    };

    /**
     * Apply tenant key to html dataset
     */
    useEffect(() => {
        if (tenant?.key) {
            document.documentElement.dataset.client = tenant.key;
        }
    }, [tenant?.key]);

    /**
     * Autoload theme as CSS variables
     */
    useEffect(() => {
        if (!tenant?.theme) return;

        const { colors, typography, radius } = tenant.theme;

        // Apply colors
        if (colors) {
            Object.entries(colors).forEach(([key, value]) => {
                document.documentElement.style.setProperty(
                    `--${key}`,
                    value
                );
            });
        }

        // Apply font
        if (typography?.font_family) {
            document.documentElement.style.setProperty(
                '--font-family',
                typography.font_family
            );
        }

        // Apply radius
        if (radius) {
            Object.entries(radius).forEach(([key, value]) => {
                document.documentElement.style.setProperty(
                    `--radius-${key}`,
                    value
                );
            });
        }
    }, [tenant?.theme]);

    return (
        <>
            <GlobalSpinner />
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
