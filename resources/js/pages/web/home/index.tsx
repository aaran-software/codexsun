import { Head, usePage } from '@inertiajs/react';
import WebLayout from '@/layouts/web-layout';

import HomeDefault from './tenants/default/HomeDefault';
import HomeTechmedia from './tenants/techmedia/HomeTechmedia';
import HomeTtt from './tenants/ttt/HomeTtt';

export default function Home() {
    const { tenant } = usePage().props as {
        tenant?: {
            key: string;
            name: string;
        };
    };

    const key = tenant?.key ?? 'default';

    const tenantPages = {
        techmedia: HomeTechmedia,
        ttt: HomeTtt,
        default: HomeDefault,
    };

    const TenantHomeComponent =
        tenantPages[key as keyof typeof tenantPages] ?? tenantPages.default;

    return (
        <WebLayout>
            <Head title="Home" />
            <TenantHomeComponent />
        </WebLayout>
    );
}
