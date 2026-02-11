import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export function useTenantFavicon() {
    const { tenant } = usePage().props as any;

    useEffect(() => {
        if (!tenant?.key) return;

        const faviconUrl = `/assets/${tenant.key}/logo/favicon.ico`;

        const link =
            document.querySelector("link[rel='icon']") ||
            document.createElement('link');

        link.setAttribute('rel', 'icon');
        link.setAttribute('type', 'image/x-icon');
        link.setAttribute('href', faviconUrl);

        document.head.appendChild(link);
    }, [tenant?.key]);
}
