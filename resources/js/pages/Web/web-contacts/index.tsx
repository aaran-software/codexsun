'use client';

import { Head } from '@inertiajs/react';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';

export default function WebContactPage() {
    return (
        <WebLayout>
            <Head title="Contact" />
            <MenuBackdrop
                image="/assets/techmedia/services-hero"
                title="Contact"
                subtitle="End-to-End Technology."
            />
            Services
        </WebLayout>
    );
}
