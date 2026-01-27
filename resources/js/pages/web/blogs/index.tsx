import { Head } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import CtaSection from '@/pages/web/home/blocks/cta';

export default function index() {
    return (
        <WebLayout>
            <Head title="About us" />

            <MenuBackdrop
                image="/assets/techmedia/repair.jpg"
                title="Blogs"
                subtitle="Ideas that inform. Stories that inspire"
            />

            <CtaSection />

            <FooterCard />

        </WebLayout>
    );
}
