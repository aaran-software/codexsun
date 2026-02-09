import React from 'react';
import WebMenu from '@/components/blocks/menu/web-menu';
import ScrollProgress from '@/components/animate/ScrollProgress';

export default function WebLayout({ children }: { children: React.ReactNode }) {
    return (
        <>

            <WebMenu />
            {children}
        </>
    );
}
