import { Head } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import CtaSection from '@/pages/web/home/blocks/cta';

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
