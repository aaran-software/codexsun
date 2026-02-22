// resources/js/pages/web/home/blocks/AboutSection.tsx

'use client';

import FadeUp from '@/components/blocks/animate/fade-up';
import type { AboutData } from '@/lib/tenant/types';

interface AboutSectionProps {
    abouts?: AboutData | null;
}

export default function AboutSection({ abouts }: AboutSectionProps) {
    if (!abouts || !abouts.title) return null;

    const {
        backgroundColor = '#f9fafb',
        title,
        subtitle,
        content,
        image,
    } = abouts;

    return (
        <section
            className="py-16 md:py-20 lg:py-24"
            style={{ backgroundColor }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Left - Text */}
                    <FadeUp>
                        <div className="max-w-3xl space-y-6">
                            <span className="inline-block text-sm font-semibold tracking-wide text-primary uppercase">
                                About Us
                            </span>

                            <h2 className="text-3xl leading-tight font-bold text-gray-900 md:text-4xl lg:text-5xl">
                                {title}
                            </h2>

                            {subtitle && (
                                <p className="text-xl font-medium text-gray-700">
                                    {subtitle}
                                </p>
                            )}

                            <div className="space-y-4 text-base leading-relaxed text-gray-600 md:text-lg">
                                {content.map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    </FadeUp>

                    {/* Right - Image */}
                    {image && (
                        <FadeUp delay={0.2}>
                            <div className="relative mt-5 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-gray-200">
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="h-72 w-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                            </div>
                        </FadeUp>
                    )}
                </div>
            </div>
        </section>
    );
}
