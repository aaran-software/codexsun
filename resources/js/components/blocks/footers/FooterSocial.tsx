'use client';

import type { LucideIcon } from 'lucide-react';

interface SocialItem {
    label: string;
    href: string;
    Icon: LucideIcon;
}

interface Props {
    items: SocialItem[];
}

export default function FooterSocial({ items }: Props) {
    if (items.length === 0) return null;
    return (
        <div className="hidden lg:flex lg:flex-col lg:items-end lg:justify-center">
            <p className="mb-3 text-sm font-semibold tracking-wider text-white uppercase">
                Follow Us
            </p>

            <div className="flex gap-2">
                {items.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-gray-800 p-2 text-muted/70 transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-white"
                        aria-label={item.label}
                    >
                        <item.Icon className="h-5 w-5" />
                    </a>
                ))}
            </div>
        </div>
    );
}
