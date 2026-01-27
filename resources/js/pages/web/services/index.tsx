import { Head } from '@inertiajs/react';
import WebLayout from '@/layouts/web-layout';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import CtaSection from '@/pages/web/home/blocks/cta';
import FooterCard from '@/components/blocks/footers/FooterCard';

export default function index() {
    return (
        <WebLayout>
            <Head title="Services" />

            <MenuBackdrop
                image="/assets/techmedia/repair.jpg"
                title="Services we Do"
                subtitle="IT Infrastructure & Hardware Solutions"
            />

            <CtaSection />

            <FooterCard />
        </WebLayout>
    );
}
