import React from 'react';
import WebMenu from '@/components/blocks/menu/web-menu';

export default function WebLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <WebMenu/>
            {children}
            <script
                src="https://www.google.com/recaptcha/api.js"
                async
                defer
            ></script>
        </>
    );
}
