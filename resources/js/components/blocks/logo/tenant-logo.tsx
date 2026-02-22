import { usePage } from '@inertiajs/react';
import React from 'react';
import { DefaultLogo } from './default-logo';
import { TmLogo } from './techmedia-logo';
import { TTTLogo } from './ttt-logo';
import CodexsunLogo from '@/components/blocks/logo/codexsun-logo';

type LogoProps = React.SVGProps<SVGSVGElement>;

export function TenantLogo(props: LogoProps) {
    const { tenant } = usePage().props as any;
    const key = tenant?.name ?? 'default';
    console.log(tenant.name)

    switch (key) {
        case 'techmedia':
            return <TmLogo {...props} />;

        case 'ttt':
            return <TTTLogo {...props} />;

        case 'codexsun':
            return <CodexsunLogo {...props} />;

        default:
            return <CodexsunLogo {...props} />;
    }
}
