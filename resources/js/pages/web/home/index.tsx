import { Head } from '@inertiajs/react'
import FullScreenSlider from '@/components/blocks/sliders/slider';
import WebLayout from '@/layouts/web-layout';
import FeaturesSection from '@/pages/web/home/blocks/features';

export default function index() {
    return (
        <WebLayout>

            <Head title="Home" />

            <FullScreenSlider />

            <FeaturesSection/>



        </WebLayout>
    );
}
