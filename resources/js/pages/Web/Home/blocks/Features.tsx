// resources/js/pages/web/home/blocks/Features.tsx

'use client';

import { CheckCircle2 } from 'lucide-react';
import FadeUpStagger, {
    FadeUpItem,
} from '@/components/blocks/animate/fade-up-stagger';
import type { FeaturesData } from '@/lib/tenant/types';

interface FeaturesProps {
    features?: FeaturesData;
}

export default function FeaturesSection({ features }: FeaturesProps) {
    if (!features) return null;

    if (!features) return null;

    const {
        title,
        description,
        image,
        bullets = [],
    } = features;

    return (
        <section
            className="py-16 md:py-20 lg:py-24 bg-primary/25"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Left - Text + Bullets */}
                    <FadeUpStagger staggerChildren={0.14} delay={0.1}>
                        <FadeUpItem>
                            <h2 className="text-4xl font-bold tracking-tighter drop-shadow-lg md:text-5xl lg:text-6xl">
                                {title}
                            </h2>
                        </FadeUpItem>

                        <FadeUpItem>
                            <p className="py-3 text-lg leading-relaxed text-gray-700">
                                {description}
                            </p>
                        </FadeUpItem>

                        {bullets.length > 0 && (
                            <ul className="mt-6 space-y-4">
                                {bullets.map((item, index) => (
                                    <FadeUpItem key={index}>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                                            <span className="text-lg text-gray-700">
                                                {item}
                                            </span>
                                        </li>
                                    </FadeUpItem>
                                ))}
                            </ul>
                        )}
                    </FadeUpStagger>

                    {/* Right - Image */}
                    <FadeUpStagger delay={0.8}>
                        <FadeUpItem>
                            <div className="relative mx-auto max-w-md bg-transparent lg:max-w-xl">
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="h-auto w-full bg-transparent object-contain transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                        </FadeUpItem>
                    </FadeUpStagger>
                </div>
            </div>
        </section>
    );
}
