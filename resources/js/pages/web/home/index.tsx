import { Head } from '@inertiajs/react'
import FooterCard from '@/components/blocks/footers/FooterCard';
import CategoryGrid from '@/components/blocks/sliders/CategoryGrid';
import FloatingWhatsApp from '@/components/blocks/sliders/FloatingWhatsApp';
import TttSlider from '@/components/blocks/sliders/tttslider';
import WebLayout from '@/layouts/web-layout';
import AboutSection from '@/pages/web/home/blocks/AboutSection';
import CallToAction from '@/pages/web/home/blocks/CallToAction';
import FactoryAdvantage from '@/pages/web/home/blocks/FactoryAdvantage';
import HeroSection from '@/pages/web/home/blocks/HeroSection';
import ProductRange from '@/pages/web/home/blocks/ProductRange';
import WhyChooseUs from '@/pages/web/home/blocks/WhyChooseUs';

export default function index() {
    return (
        <WebLayout>
            <Head title="Home" />

            <FloatingWhatsApp />

            <TttSlider />

            <CategoryGrid />

            <HeroSection />
            <AboutSection />
            <WhyChooseUs />
            <ProductRange />
            <FactoryAdvantage />
            <CallToAction />

            {/*<CtaSection />*/}

            <FooterCard />
        </WebLayout>
    );
}
