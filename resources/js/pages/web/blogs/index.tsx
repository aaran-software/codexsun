import WebLayout from '@/layouts/web-layout';
import { Head } from '@inertiajs/react';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import CtaSection from '@/pages/web/home/blocks/cta';
import FooterCard from '@/components/blocks/footers/FooterCard';

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
