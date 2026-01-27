import { Head } from '@inertiajs/react'
import WebLayout from '@/layouts/web-layout';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import CtaSection from '@/pages/web/home/blocks/cta';
import FooterCard from '@/components/blocks/footers/FooterCard';

export default function index() {
    return (
        <WebLayout>
            <Head title="Contact" />

            <MenuBackdrop
                image="/assets/techmedia/repair.jpg"
                title="Contact Us"
                subtitle="Your trusted partner for computer sales, repairs, and hardware solutions"
            />

            <CtaSection />

            <FooterCard />
        </WebLayout>
    );
}
