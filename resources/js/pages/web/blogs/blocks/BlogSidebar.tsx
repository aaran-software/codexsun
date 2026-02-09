import { Link, usePage } from '@inertiajs/react';

const categories = [
    'All',
    'Manufacturing',
    'Wholesale',
    'Corporate',
    'Industry News',
    'Events',
];

export default function BlogSidebar() {
    const { url } = usePage();

    return (
        <aside className="rounded-xl bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                Categories
            </h4>

            <ul className="space-y-3 text-sm">
                {categories.map((category) => {
                    const href =
                        category === 'All'
                            ? '/blog'
                            : `/blog?category=${category}`;

                    const active = url.includes(category);

                    return (
                        <li key={category}>
                            <Link
                                href={href}
                                className={`block hover:text-black ${
                                    active
                                        ? 'font-semibold text-black'
                                        : 'text-gray-600'
                                }`}
                            >
                                {category}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}
