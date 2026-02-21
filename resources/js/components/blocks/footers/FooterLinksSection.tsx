'use client';

import { Link } from '@inertiajs/react';

interface LinkItem {
    label: string;
    href: string;
}

interface Props {
    title: string;
    links: LinkItem[];
}

export default function FooterLinksSection({ title, links }: Props) {
    return (
        <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                {title}
            </h4>

            <ul className="space-y-2">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="inline-block text-sm text-gray-400 transition-all duration-200 hover:translate-x-1 hover:scale-[1.03] hover:font-medium hover:text-white"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
