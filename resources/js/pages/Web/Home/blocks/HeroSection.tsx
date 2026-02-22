// resources/js/pages/web/home/blocks/HeroSection.tsx

'use client';

import FadeUp from '@/components/blocks/animate/fade-up';
import type { HeroData } from '@/lib/tenant/types';

interface HeroSectionProps {
    hero?: HeroData | null;
}

export default function HeroSection({ hero }: HeroSectionProps) {
    if (!hero) return null;

    const { title, subtitle } = hero;

    return (
        <section className="relative flex items-center justify-center overflow-hidden bg-white py-8 lg:py-16">
            <div className="relative z-10 container mx-auto px-4 text-center sm:px-6 lg:px-8">
                <FadeUp>
                    <h1 className="text-xl font-bold tracking-wide text-black drop-shadow-xl lg:text-4xl">
                        {title}
                    </h1>

                    <p className="text-md mx-auto mt-6 max-w-4xl font-medium text-gray-800 drop-shadow-md lg:text-2xl">
                        {subtitle}
                    </p>
                </FadeUp>
            </div>
        </section>
    );
}
