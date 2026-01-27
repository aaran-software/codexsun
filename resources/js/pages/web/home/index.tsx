import { Head } from '@inertiajs/react'
import FooterCard from '@/components/blocks/footers/FooterCard';
import FullScreenSlider from '@/components/blocks/sliders/slider';
import WebLayout from '@/layouts/web-layout';
import CtaSection from '@/pages/web/home/blocks/cta';
import FeaturesSection from '@/pages/web/home/blocks/features';
import Partners from '@/pages/web/home/blocks/partners';
import Showcase from '@/pages/web/home/blocks/Showcase';
import Testimonial from '@/pages/web/home/blocks/testiomonials';

export default function index() {
    return (
        <WebLayout>
            <Head title="Home" />

            <FullScreenSlider />

            <FeaturesSection />

            <Showcase/>

            <Partners/>

            <Testimonial />

            <CtaSection />

            <FooterCard/>

        </WebLayout>
    );
}
