import { Link } from '@inertiajs/react';
import FadeUp from '@/components/animate/fade-up';
import MotionImage from '@/components/animate/motion-image';

type Props = {
    title: string;
    slug: string;
    description: string;
    image: string;
    variants: string[];
};

export default function CatalogCard({
    title,
    slug,
    description,
    image,
    variants,
}: Props) {
    return (
        <FadeUp>
            <Link
                // href={route('catalog.category', slug)}
                className="group block"
            >
                <div className="relative overflow-hidden rounded-xl border bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    {/* Bulk Badge */}
                    <span className="absolute top-4 left-4 z-10 rounded-full bg-black px-3 py-1 text-xs text-white">
                        Bulk Available
                    </span>

                    {/* Image */}
                    <MotionImage
                        src={image}
                        alt={title}
                        className="h-64 w-full object-cover"
                    />

                    {/* Content */}
                    <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                            {description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {variants.map((variant, index) => (
                                <span
                                    key={index}
                                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
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
