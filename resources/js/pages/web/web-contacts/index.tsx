import { Head } from '@inertiajs/react'
import FooterCard from '@/components/blocks/footers/FooterCard';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import CtaSection from '@/pages/web/home/blocks/cta';

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
