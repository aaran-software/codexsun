import { Head, usePage } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import FloatingWhatsApp from '@/components/blocks/sliders/FloatingWhatsApp';
import TechmediaSlider from '@/components/blocks/sliders/TechmediaSlider';
import WebLayout from '@/layouts/web-layout';
import AboutSection from '@/pages/web/home/tenants/techmedia/blocks/about/AboutSection';
import BlogShowcaseSection from '@/pages/web/home/tenants/techmedia/blocks/blog/BlogShowcaseSection';
import CallToAction from '@/pages/web/home/tenants/techmedia/blocks/cta/CallToAction';
import FactoryAdvantage from '@/pages/web/home/tenants/techmedia/blocks/FactoryAdvantage';
import HeroSection from '@/pages/web/home/tenants/techmedia/blocks/HeroSection';
import LocationSection from '@/pages/web/home/tenants/techmedia/blocks/location/LocationSection';
import CatalogSection from '@/pages/web/home/tenants/techmedia/blocks/Product/CatalogSection';
import ProductRange from '@/pages/web/home/tenants/techmedia/blocks/ProductRange';
import StatsSection from '@/pages/web/home/tenants/techmedia/blocks/StatsSection';
import NewsletterSection from '@/pages/web/home/tenants/techmedia/blocks/subscribtion/NewsletterSection';
import WhyChooseUs from '@/pages/web/home/tenants/techmedia/blocks/whyus/WhyChooseUs';
import BrandSlider from '@/pages/web/home/tenants/ttt/blocks/branding/BrandSlider';

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
