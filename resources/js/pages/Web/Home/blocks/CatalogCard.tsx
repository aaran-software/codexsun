// resources/js/pages/web/home/blocks/CatalogCard.tsx

import { Link } from '@inertiajs/react';
import FadeUp from '@/components/blocks/animate/fade-up';
import MotionImage from '@/components/blocks/animate/motion-image';

type Props = {
    title: string;
    slug: string;
    description: string;
    image: string;
    variants: string[];
    badge?: string;
    badgeVariant?:
        | 'emerald'
        | 'amber'
        | 'blue'
        | 'purple'
        | 'rose'
        | 'cyan'
        | 'indigo'
        | 'teal';
    featuredBadge?: string;
    featuredBadgeVariant?:
        | 'emerald'
        | 'amber'
        | 'black'
        | 'blue'
        | 'purple'
        | 'rose'
        | 'cyan'
        | 'indigo'
        | 'teal';
};

const variantStyles = {
    emerald: 'from-emerald-600 to-teal-600',
    amber: 'from-amber-500 to-orange-500',
    blue: 'from-blue-600 to-indigo-600',
    purple: 'from-purple-600 to-violet-600',
    rose: 'from-rose-500 to-pink-600',
    cyan: 'from-cyan-500 to-teal-500',
    indigo: 'from-indigo-600 to-blue-600',
    teal: 'from-teal-600 to-emerald-600',
    black: 'bg-black',
};

export default function CatalogCard({
    title,
    slug,
    description,
    image,
    variants,
    badge = '',
    badgeVariant = 'emerald',
    featuredBadge = '',
    featuredBadgeVariant = 'amber',
}: Props) {
    const bulkStyle =
        variantStyles[badgeVariant] || 'from-emerald-600 to-teal-600';
    const featuredStyle =
        variantStyles[featuredBadgeVariant] || 'from-amber-500 to-orange-500';

    const showBulkBadge = typeof badge === 'string' && badge.trim() !== '';
    const showFeaturedBadge =
        typeof featuredBadge === 'string' && featuredBadge.trim() !== '';

    return (
        <FadeUp>
            <Link href={`/catalog/${slug}`} className="group block">
                <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-white transition-all duration-300 hover:-translate-y-2 hover:border-2 hover:shadow-xl">
                    {/* Bulk Badge */}
                    {showBulkBadge && (
                        <span
                            className={`absolute top-4 left-4 z-10 rounded-full bg-linear-to-r ${bulkStyle} px-4 py-1.5 text-xs font-semibold text-white shadow-md`}
                        >
                            {badge.trim()}
                        </span>
                    )}

                    {/* Featured Badge */}
                    {showFeaturedBadge && (
                        <span
                            className={`absolute top-4 right-4 z-10 rounded-full bg-linear-to-r ${featuredStyle} px-3 py-1 text-xs font-medium text-white shadow`}
                        >
                            {featuredBadge.trim()}
                        </span>
                    )}

                    {/* Image */}
                    <MotionImage
                        src={image}
                        alt={title}
                        className="h-64 w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Content */}
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-primary">
                            {title}
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-gray-500 group-hover:text-primary/70">
                            {description}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {variants.map((variant, index) => (
                                <span
                                    key={index}
                                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-primary/80"
                                >
                                    {variant}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </Link>
        </FadeUp>
    );
}
