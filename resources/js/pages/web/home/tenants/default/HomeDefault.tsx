import { Head, usePage } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import FloatingWhatsApp from '@/components/blocks/sliders/FloatingWhatsApp';
import TttSlider from '@/components/blocks/sliders/tttslider';
import WebLayout from '@/layouts/web-layout';
import AboutSection from '@/pages/web/home/tenants/default/blocks/about/AboutSection';
import BlogShowcaseSection from '@/pages/web/home/tenants/default/blocks/blog/BlogShowcaseSection';
import Partners from '@/pages/web/home/tenants/default/blocks/branding/partners';
import CallToAction from '@/pages/web/home/tenants/default/blocks/cta/CallToAction';
import FactoryAdvantage from '@/pages/web/home/tenants/default/blocks/FactoryAdvantage';
import HeroSection from '@/pages/web/home/tenants/default/blocks/HeroSection';
import LocationSection from '@/pages/web/home/tenants/default/blocks/location/LocationSection';
import CatalogSection from '@/pages/web/home/tenants/default/blocks/Product/CatalogSection';
import ProductRange from '@/pages/web/home/tenants/default/blocks/ProductRange';
import StatsSection from '@/pages/web/home/tenants/default/blocks/StatsSection';
import NewsletterSection from '@/pages/web/home/tenants/default/blocks/subscribtion/NewsletterSection';
import WhyChooseUs from '@/pages/web/home/tenants/default/blocks/whyus/WhyChooseUs';

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

            <TttSlider />

            <HeroSection />
            {/*<CategoryGrid />*/}
            <AboutSection />
            <StatsSection />
            <CatalogSection />
            <ProductRange />
            <WhyChooseUs />
            <Partners/>
            {/*<BrandSlider />*/}
            <FactoryAdvantage />
            <BlogShowcaseSection />
            <CallToAction />
            <LocationSection />
            <NewsletterSection />

            <FooterCard />
            {/*<FooterCard3/>*/}
        </WebLayout>
    );
}
