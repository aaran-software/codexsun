import { usePage } from "@inertiajs/react";
import { galleryData } from "@/pages/web/tirupur-textiles/data/GalleryData";
import GallerySection from "@/components/gallery/GallerySection";
import Layout from '@/pages/web/tirupur-textiles/Layout/Layout';

type PageProps = {
    slug: string;
};

export default function GalleryShow() {
    const { props } = usePage<PageProps>();
    const { slug } = props;

    const brand = galleryData.find((b) => b.slug === slug);

    if (!brand) {
        return <div className="text-center py-20">Gallery not found</div>;
    }

    return <Layout><GallerySection hero={brand.hero} items={brand.items} /></Layout>;
}
