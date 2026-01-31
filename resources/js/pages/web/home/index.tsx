import { Head } from '@inertiajs/react'
import FooterCard from '@/components/blocks/footers/FooterCard';
import CategoryGrid from '@/components/blocks/sliders/CategoryGrid';
import FloatingWhatsApp from '@/components/blocks/sliders/FloatingWhatsApp';
import TttSlider from '@/components/blocks/sliders/tttslider';
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

            <FloatingWhatsApp />

            <TttSlider />
            <CategoryGrid />

            <FeaturesSection />

            <Showcase />

            <Partners />

            <Testimonial />

            <CtaSection />

            <FooterCard />
        </WebLayout>
    );
}
