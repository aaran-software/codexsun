'use client';

import { Head } from '@inertiajs/react';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';

export default function ServicesPage() {
    return (
        <WebLayout>
            <Head title="Services" />
            <MenuBackdrop
                image="/assets/techmedia/services-hero"
                title="Services"
                subtitle="End-to-End Technology."
            />
            Services
        </WebLayout>
    );
}
