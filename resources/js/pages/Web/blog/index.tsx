'use client';

import { Head } from '@inertiajs/react';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';

export default function BlogPage() {
    return (
        <WebLayout>
            <Head title="Blog" />
            <MenuBackdrop
                image="/assets/techmedia/services-hero"
                title="Blog"
                subtitle="End-to-End Technology."
            />
            Services
        </WebLayout>
    );
}
