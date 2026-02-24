// resources/js/components/navigation/SubMenuHero.tsx
'use client';

import type { MenuItem } from './types';

interface SubMenuHeroProps {
    item: MenuItem;
}

export default function SubMenuHero({ item }: SubMenuHeroProps) {
    // You can make this dynamic later (e.g. from item.hero_image)
    const placeholderImage =
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800';

    return (
        <div className="relative col-span-1 overflow-hidden rounded-l-lg">
            <img
                src={placeholderImage}
                alt={item.label}
                className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute right-6 bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold">{item.label}</h3>
                {item.description && (
                    <p className="mt-2 text-sm text-white/80">
                        {item.description}
                    </p>
                )}
            </div>
        </div>
    );
}
