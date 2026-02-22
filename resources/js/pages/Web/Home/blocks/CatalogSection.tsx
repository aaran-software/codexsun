// resources/js/pages/web/home/blocks/CatalogSection.tsx

'use client';

import type { CatalogData } from '@/lib/tenant/types';
import CatalogCard from './CatalogCard';

interface CatalogSectionProps {
    catalog?: CatalogData | null;
}

export default function CatalogSection({ catalog }: CatalogSectionProps) {
    if (!catalog || catalog.categories.length === 0) return null;

    const { heading, subheading, categories } = catalog;

    return (
        <section className="bg-gray-50 py-20 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                        {heading}
                    </h2>
                    {subheading.trim() !== '' && (
                        <p className="mt-4 text-lg text-gray-600">
                            {subheading}
                        </p>
                    )}
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categories.map((category) => (
                        <CatalogCard
                            key={category.slug}
                            title={category.title}
                            slug={category.slug}
                            description={category.description}
                            image={category.image}
                            variants={category.variants}
                            badge={category.bulkBadge || ''}
                            badgeVariant={category.badgeVariant}
                            featuredBadge={category.featuredBadge || ''}
                            featuredBadgeVariant={category.featuredBadgeVariant}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
