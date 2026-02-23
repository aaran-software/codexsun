import { usePage } from '@inertiajs/react';
import React from 'react';
import CodexsunLogo from '@/components/blocks/logo/codexsun-logo';
import { DefaultLogo } from './default-logo';
import { TmLogo } from './techmedia-logo';
import { TTTLogo } from './ttt-logo';

type LogoProps = React.SVGProps<SVGSVGElement>;

export function TenantLogo(props: LogoProps) {
    const { currentTenant } = usePage().props as any;
    const key = currentTenant?.name ?? 'default';
    // console.log(currentTenant.name);

    switch (key) {
        case 'techmedia':
            return <TmLogo {...props} />;

        case 'default':
            return <DefaultLogo {...props} />;

        case 'ttt':
            return <TTTLogo {...props} />;

        case 'codexsun':
            return <CodexsunLogo {...props} />;

        default:
            return <CodexsunLogo {...props} />;
    }
}
