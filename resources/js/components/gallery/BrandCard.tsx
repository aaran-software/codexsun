import { Link } from "@inertiajs/react";
import { BrandGallery } from '@/pages/web/tirupur-textiles/data/GalleryData';

export default function BrandCard({ brand }: { brand: BrandGallery }) {
    return (
        <Link
            href={`/tirupur-textiles/gallery/${brand.slug}`}
            className="group relative overflow-hidden rounded-xl cursor-pointer"
        >
            <img
                src={brand.coverImage}
                alt={brand.title}
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/70 transition" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center opacity-0 group-hover:opacity-100 transition">
                <h3 className="text-2xl font-bold">{brand.title}</h3>
                <p className="text-sm mt-2 px-4">{brand.tagline}</p>
            </div>
        </Link>
    );
}
