import { Head, usePage } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import FloatingWhatsApp from '@/components/blocks/sliders/FloatingWhatsApp';
import TechmediaSlider from '@/components/blocks/sliders/TechmediaSlider';
import WebLayout from '@/layouts/web-layout';
import AboutSection from '@/pages/web/home/blocks/about/AboutSection';
import BlogShowcaseSection from '@/pages/web/home/blocks/blog/BlogShowcaseSection';
import BrandSlider from '@/pages/web/home/blocks/branding/BrandSlider';
import CallToAction from '@/pages/web/home/blocks/cta/CallToAction';
import FactoryAdvantage from '@/pages/web/home/blocks/FactoryAdvantage';
import HeroSection from '@/pages/web/home/blocks/HeroSection';
import LocationSection from '@/pages/web/home/blocks/location/LocationSection';
import CatalogSection from '@/pages/web/home/blocks/Product/CatalogSection';
import ProductRange from '@/pages/web/home/blocks/ProductRange';
import StatsSection from '@/pages/web/home/blocks/StatsSection';
import NewsletterSection from '@/pages/web/home/blocks/subscribtion/NewsletterSection';
import WhyChooseUs from '@/pages/web/home/blocks/whyus/WhyChooseUs';

export default function index() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { tenant } = usePage().props as {
        tenant?: {
            key: string;
            name: string;
            industry?: string;
        };
    };

    console.log('TenantService from backend:', tenant);

    return (
        <WebLayout>
            <Head title="Home" />

            <FloatingWhatsApp />

            <TechmediaSlider />

            <HeroSection />
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
