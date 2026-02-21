import type { ReactNode } from 'react';
import WebMenu from '@/components/blocks/menu/web-menu';

interface Props {
    children: ReactNode;
}

export default function WebLayout({ children }: Props) {
    return (
        <>
            <WebMenu />
            <main>{children}</main>
        </>
    );
}
