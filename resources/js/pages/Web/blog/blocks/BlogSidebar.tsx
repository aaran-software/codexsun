import { Link, usePage } from '@inertiajs/react';

type Category = {
    name: string;
    slug: string;
    count?: number;
};

type SidebarData = {
    categories: Category[];
};

export default function BlogSidebar() {
    const { sidebar } = usePage<{ sidebar: SidebarData }>().props;
    const { url } = usePage();

    const categories = sidebar?.categories ?? [];

    return (
        <aside className="rounded-xl bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                Categories
            </h4>

            <ul className="space-y-3 text-sm">
                <li>
                    <Link
                        href="/blog"
                        className={`block hover:text-black ${
                            !url.includes('category=')
                                ? 'font-semibold text-black'
                                : 'text-gray-600'
                        }`}
                    >
                        All
                    </Link>
                </li>

                {categories.map((cat) => {
                    const active = url.includes(`category=${cat.slug}`);

                    return (
                        <li key={cat.slug}>
                            <Link
                                href={`/blog?category=${cat.slug}`}
                                className={`block hover:text-black ${
                                    active
                                        ? 'font-semibold text-black'
                                        : 'text-gray-600'
                                }`}
                            >
                                {cat.name}
                            </Link>
                        </li>
                    );
                })}

                {categories.length === 0 && (
                    <li className="text-gray-500">No categories available</li>
                )}
            </ul>
        </aside>
    );
}
