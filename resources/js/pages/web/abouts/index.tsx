import { Head } from '@inertiajs/react';
import WebLayout from '@/layouts/web-layout';
import FeaturesSection from '@/pages/web/home/blocks/features';

export default function index() {
    return (
        <WebLayout>
            <Head title="About us" />
            <FeaturesSection />
        </WebLayout>
    );
}
