// resources/js/pages/web/home/blocks/StatsSection.tsx

'use client';

import Counter from '@/components/blocks/animate/counter';
import type { StatsData } from '@/lib/tenant/types';

interface StatsSectionProps {
    stats?: StatsData | null;
}
export default function StatsSection({ stats }: StatsSectionProps) {
    if (!stats || stats.stats.length === 0) return null;

    const {
        backgroundColor = '#ffffff',
        borderColor = '#e5e7eb',
        stats: items,
    } = stats;

    return (
        <section
            className="border-t border-b py-16 md:py-20"
            style={{ backgroundColor, borderColor }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
                    {items.map((stat, index) => (
                        <div key={index} className="text-center">
                            <Counter
                                value={stat.value}
                                suffix={stat.suffix || ''}
                                className="text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl"
                            />
                            <p className="mt-3 text-base font-medium text-gray-600 md:text-lg">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
