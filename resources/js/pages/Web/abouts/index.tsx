'use client';

import { Head } from '@inertiajs/react';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';

export default function AboutPage() {
    return (
        <WebLayout>
            <Head title="About Us" />
            <MenuBackdrop
                image="/assets/techmedia/services-hero"
                title="About"
                subtitle="End-to-End Technology."
            />
            about
        </WebLayout>
    );
}
