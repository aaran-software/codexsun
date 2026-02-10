import { Head } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import AboutHero from '@/pages/web/abouts/blocks/hero';
import AboutTeam from '@/pages/web/abouts/blocks/team';
import AboutTeama from '@/pages/web/abouts/blocks/teama';

export default function index() {
    return (
        <WebLayout>
            <Head title="About Us | The Tirupur Textiles" />

            <MenuBackdrop
                image="/assets/about/about-banner.jpg"
                title="About The Tirupur Textiles"
                subtitle="Direct sourcing from Tirupur’s manufacturing ecosystem"
            />

            <AboutHero />
            <AboutTeama />
            <AboutTeam />

            <FooterCard />
        </WebLayout>
    );
}
