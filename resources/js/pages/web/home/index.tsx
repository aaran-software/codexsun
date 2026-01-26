import { Head } from '@inertiajs/react'
import FullScreenSlider from '@/components/blocks/sliders/slider';
import WebLayout from '@/layouts/web-layout';
import CtaSection from '@/pages/web/home/blocks/cta';
import FeaturesSection from '@/pages/web/home/blocks/features';

export default function index() {
    return (
        <WebLayout>

            <Head title="Home" />

            <FullScreenSlider />

            <FeaturesSection/>

            <CtaSection/>


        </WebLayout>
    );
}
