// resources/js/pages/web/home/blocks/BrandSlider.tsx
'use client';

import { Marquee } from '@/components/ui/marquee';
import type { BrandSliderData } from '@/lib/tenant/types';
import { cn } from '@/lib/utils';

interface BrandSliderProps {
    brandSlider?: BrandSliderData
}

export default function BrandSlider({ brandSlider }: BrandSliderProps) {
    if (!brandSlider || !brandSlider.logos?.length) return null;

    const { heading, pauseOnHover, logos } = brandSlider;

    // Duplicate for smooth infinite loop
    const duplicated = [...logos, ...logos];

    // Optional: split into two rows (currently using single row)
    const firstRow = duplicated.slice(0, Math.ceil(duplicated.length / 2));
    // const secondRow = duplicated.slice(Math.ceil(duplicated.length / 2));

    return (
        <section className="border-t border-gray-200 bg-white py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="mb-8 text-center text-xl font-semibold text-gray-900 md:mb-10 md:text-2xl">
                    {heading}
                </h2>

                <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
                    <Marquee
                        pauseOnHover={pauseOnHover}
                        className="[--duration:40s]"
                        reverse={false}
                    >
                        {firstRow.map((brand, idx) => (
                            <BrandLogoCard
                                key={`${brand.name}-${idx}`}
                                name={brand.name}
                                logo={brand.logo}
                            />
                        ))}
                    </Marquee>

                    {/* Uncomment for second row (reverse direction) */}
                    {/* <Marquee
                        pauseOnHover={pauseOnHover}
                        className="[--duration:45s]"
                        reverse={true}
                    >
                        {secondRow.map((brand, idx) => (
                            <BrandLogoCard
                                key={`${brand.name}-${idx}`}
                                name={brand.name}
                                logo={brand.logo}
                            />
                        ))}
                    </Marquee> */}

                    {/* Fade edges */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-white to-transparent dark:from-gray-950" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-white to-transparent dark:from-gray-950" />
                </div>
            </div>
        </section>
    );
}

interface BrandLogoCardProps {
    name: string;
    logo: string;
}

function BrandLogoCard({ name, logo }: BrandLogoCardProps) {
    return (
        <figure
            className={cn(
                'relative h-28 w-44 cursor-pointer overflow-hidden p-4 transition-all duration-300',
                // 'hover:shadow-md hover:scale-[1.04]',
                'dark:border-gray-800 dark:bg-gray-950'
            )}
        >
            <div className="flex h-full w-full items-center justify-center">
                <img
                    src={logo}
                    alt={name}
                    loading="lazy"
                    className={cn(
                        'h-20 max-w-35 object-contain transition-all duration-500',
                        'brightness-100',
                        'hover:brightness-110 hover:scale-110'
                    )}
                />
            </div>
        </figure>
    );
}
