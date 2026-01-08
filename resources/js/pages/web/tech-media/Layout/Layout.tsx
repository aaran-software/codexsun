'use client';

import Header from '@/components/Common/header/header';
import "../../../../../css/techmedia.css"
import { ReactNode } from 'react';
import Footer from '@/components/Common/Footer/Footer';
const navItems = [
    { name: 'Home', href: '/tech-media' },
    { name: 'About', href: '/tech-media/about' },
    { name: 'Services', href: '/tech-media/services' },
    { name: 'Blogs', href: '/blog/web/articles' },
    { name: 'Contact', href: '/tech-media/contact' },
];
export default function Layout({ children }: { children:ReactNode }) {
    return (
        <>
            <Header navItems={navItems} companyName={'Tech Media'} />

            <main>{children}</main>

            <Footer companyName={'Tech Media'} />
        </>
    );
}
