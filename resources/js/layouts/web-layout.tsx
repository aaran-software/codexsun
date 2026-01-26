import React from 'react';
import WebMenu from '@/components/blocks/menu/web-menu';

export default function WebLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <WebMenu/>
            {children}
        </>
    );
}
