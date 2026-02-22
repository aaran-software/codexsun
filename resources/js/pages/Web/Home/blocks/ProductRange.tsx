// resources/js/pages/web/home/blocks/ProductRange.tsx
'use client';

import { Link } from '@inertiajs/react';
import { Marquee } from '@/components/ui/marquee';
import { type ProductRangeData } from '@/lib/tenant/types';
import { cn } from '@/lib/utils';

interface ProductRangeSectionProps {
    productRange?: ProductRangeData | null;
}

export default function ProductRange({
    productRange,
}: ProductRangeSectionProps) {
    if (!productRange || productRange.categories.length === 0) return null;

    const { heading, subheading, categories } = productRange;

    // Duplicate for smooth infinite loop
    const duplicated = [...categories, ...categories, ...categories];

    // Split into 4 vertical marquees (top to bottom flow)
    const chunkSize = Math.ceil(duplicated.length / 4);
    const col1 = duplicated.slice(0, chunkSize);
    const col2 = duplicated.slice(chunkSize, chunkSize * 2);
    const col3 = duplicated.slice(chunkSize * 2, chunkSize * 3);
    const col4 = duplicated.slice(chunkSize * 3);

    return (
        <section className="overflow-hidden bg-gray-50 py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 text-center md:mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                        {heading}
                    </h2>
                    {subheading && (
                        <p className="mx-auto mt-3 max-w-3xl text-lg text-gray-600">
                            {subheading}
                        </p>
                    )}
                </div>

                {/* 3D Perspective Marquee Container */}
                <div className="relative h-80 w-full overflow-hidden backdrop-blur-sm md:h-96">
                    <div
                        className="absolute inset-0 flex flex-row items-center justify-center gap-6 overflow-hidden md:gap-10"
                        style={{
                            perspective: '800px',
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        <div
                            className="flex flex-row items-start gap-6 md:gap-10"
                            style={{
                                transform:
                                    'translateX(-80px) translateY(0px) translateZ(-180px) rotateX(18deg) rotateY(-12deg) rotateZ(15deg)',
                            }}
                        >
                            {/* Column 1 */}
                            <Marquee
                                vertical
                                pauseOnHover
                                className="[--duration:28s]"
                            >
                                {col1.map((cat, idx) => (
                                    <ProductCard
                                        key={`${cat.slug}-${idx}`}
                                        name={cat.name}
                                        image={cat.image}
                                        slug={cat.slug}
                                    />
                                ))}
                            </Marquee>

                            {/* Column 2 - reverse */}
                            <Marquee
                                vertical
                                reverse
                                pauseOnHover
                                className="[--duration:32s]"
                            >
                                {col2.map((cat, idx) => (
                                    <ProductCard
                                        key={`${cat.slug}-${idx}`}
                                        name={cat.name}
                                        image={cat.image}
                                        slug={cat.slug}
                                    />
                                ))}
                            </Marquee>

                            {/* Column 3 */}
                            <Marquee
                                vertical
                                pauseOnHover
                                className="[--duration:30s]"
                            >
                                {col3.map((cat, idx) => (
                                    <ProductCard
                                        key={`${cat.slug}-${idx}`}
                                        name={cat.name}
                                        image={cat.image}
                                        slug={cat.slug}
                                    />
                                ))}
                            </Marquee>

                            {/* Column 4 - reverse */}
                            <Marquee
                                vertical
                                reverse
                                pauseOnHover
                                className="[--duration:34s]"
                            >
                                {col4.map((cat, idx) => (
                                    <ProductCard
                                        key={`${cat.slug}-${idx}`}
                                        name={cat.name}
                                        image={cat.image}
                                        slug={cat.slug}
                                    />
                                ))}
                            </Marquee>
                        </div>
                    </div>

                    {/* Fade gradients */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-gray-50 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-gray-50 to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-gray-50 to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-gray-50 to-transparent" />
                </div>
            </div>
        </section>
    );
}

interface ProductCardProps {
    name: string;
    image: string;
    slug: string;
}

function ProductCard({ name, image, slug }: ProductCardProps) {
    return (
        <Link
            href={`/catalog/${slug}`}
            className={cn(
                'group relative w-64 shrink-0 overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                'hover:border-blue-200',
            )}
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative h-24 w-24 shadow-inner">
                    <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                </div>
                <h3 className="line-clamp-2 text-base font-medium text-gray-900 transition-colors group-hover:text-primary">
                    {name}
                </h3>
            </div>
        </Link>
    );
}
