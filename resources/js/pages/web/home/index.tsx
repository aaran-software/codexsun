import { Head, usePage } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import FloatingWhatsApp from '@/components/blocks/sliders/FloatingWhatsApp';
import TttSlider from '@/components/blocks/sliders/tttslider';
import WebLayout from '@/layouts/web-layout';
import AboutSection from '@/pages/web/home/blocks/AboutSection';
import BlogShowcaseSection from '@/pages/web/home/blocks/BlogShowcaseSection';
import BrandSlider from '@/pages/web/home/blocks/BrandSlider';
import CallToAction from '@/pages/web/home/blocks/CallToAction';
import CatalogSection from '@/pages/web/home/blocks/CatalogSection';
import FactoryAdvantage from '@/pages/web/home/blocks/FactoryAdvantage';
import HeroSection from '@/pages/web/home/blocks/HeroSection';
import LocationSection from '@/pages/web/home/blocks/LocationSection';
import NewsletterSection from '@/pages/web/home/blocks/NewsletterSection';
import ProductRange from '@/pages/web/home/blocks/ProductRange';
import StatsSection from '@/pages/web/home/blocks/StatsSection';
import WhyChooseUs from '@/pages/web/home/blocks/WhyChooseUs';

export default function index() {

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { tenant } = usePage().props as {
        tenant?: {
            key: string;
            name: string;
            industry?: string;
        };
    };

    console.log('Tenant from backend:', tenant);

    return (
        <WebLayout>
            <Head title="Home" />

            <FloatingWhatsApp />

            <TttSlider />

            <HeroSection />
            {/*<CategoryGrid />*/}
            <AboutSection />
            <StatsSection />
            <CatalogSection />
            <ProductRange />
            <WhyChooseUs />
            <BrandSlider />
            <FactoryAdvantage />
            <BlogShowcaseSection />
            <CallToAction />
            <LocationSection />
            <NewsletterSection />

            <FooterCard />
        </WebLayout>
    );
}
