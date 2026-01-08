'use client';

import FooterSection from '@/pages/web/home/FooterSection';
import Header from '@/components/Common/header/header';
import "../../../../../css/textiles.css"
import { ReactNode } from 'react';
const navItems = [
    { name: 'Home', href: '/tirupur-textiles' },
    { name: 'About', href: '/tirupur-textiles/about' },
    { name: 'Services', href: '/tirupur-textiles/services' },
    { name: 'Gallery', href: '/tirupur-textiles/gallery' },
    { name: 'Blogs', href: '/blog/web/articles' },
    { name: 'Contact', href: '/tirupur-textiles/contact' },
];
export default function Layout({ children }: { children:ReactNode }) {
    return (
        <>
            <Header navItems={navItems} companyName={'Tirupur Textiles'} />

            <main>{children}</main>

            <FooterSection />
        </>
    );
}
