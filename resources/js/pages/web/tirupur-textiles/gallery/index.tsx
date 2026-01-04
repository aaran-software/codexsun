'use client';
import Layout from '@/pages/web/tirupur-textiles/Layout/Layout';
import { galleryData } from '../data/GalleryData';
import BrandCard from '@/components/gallery/BrandCard';

export default function About() {
    return (
        <Layout>
            <section className="relative overflow-hidden py-16 md:py-24">
                {/* Background Image */}
                <img
                    src="/assets/hero.jpg"
                    alt="Textiles background"
                    className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Color Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/70 to-secondary/70" />

                {/* Content */}
                <div className="relative container mx-auto px-4 text-center md:px-6">
                    <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                        Our Gallery
                    </h1>

                    <p className="mx-auto max-w-3xl text-lg text-white/90 md:text-xl">
                        For over two decades, we've been at the forefront of textile innovation,
                        delivering exceptional quality and service to clients worldwide.
                    </p>
                </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-10 px-4 md:px-[10%]">
                {galleryData.map((brand) => (
                    <BrandCard key={brand.slug} brand={brand} />
                ))}
            </div>
        </Layout>
    );
}
