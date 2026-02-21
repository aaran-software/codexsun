import { Head } from '@inertiajs/react';
import FullScreenSlider from '@/components/blocks/slider/FullScreenSlider';
import WebLayout from '@/layouts/web-layout';
import type { HomePageProps } from '@/types/web';

export default function Home() {
    return (
        <WebLayout>
            <Head title="Home" />

            <FullScreenSlider />

hi

        </WebLayout>
    );
}
