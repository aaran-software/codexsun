import { Link } from '@inertiajs/react';

type SidebarData = {
    categories: { name: string; slug: string; count: number }[];
    popular_tags: { name: string; slug: string }[];
    recent_posts: { title: string; slug: string; image: string }[];
};

type BlogSidebarRightProps = {
    sidebar?: SidebarData;
};

export default function BlogSidebarRight({ sidebar }: BlogSidebarRightProps) {
    const {
        categories = [],
        popular_tags = [],
        recent_posts = [],
    } = sidebar || {};

    return (
        <aside className="space-y-12">
            {/* 🔍 SEARCH – can be made dynamic later */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
                <h4 className="sidebar-title mb-4">Search Blog</h4>
                <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
            </section>

            {/* 📂 CATEGORIES */}
            <section className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h4 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
                        Categories
                    </h4>
                </div>
                <ul className="space-y-1.5 p-5">
                    {categories.map((cat) => (
                        <li key={cat.slug}>
                            <Link
                                href={`/blog?category=${cat.slug}`}
                                className="group flex items-center justify-between rounded-md px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-black"
                            >
                                <span className="font-medium">{cat.name}</span>
                                <span className="text-xs text-gray-500">
                                    {cat.count}
                                </span>
                            </Link>
                        </li>
                    ))}
                    {categories.length === 0 && (
                        <li className="px-4 py-2.5 text-sm text-gray-500">
                            No categories yet
                        </li>
                    )}
                </ul>
            </section>

            {/* 🏷️ TAGS */}
            <section className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h4 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
                        Tags
                    </h4>
                </div>
                <div className="p-6">
                    <div className="flex flex-wrap gap-2.5">
                        {popular_tags.map((tag) => (
                            <Link
                                key={tag.slug}
                                href={`/blog/tag/${tag.slug}`}
                                className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-800 hover:text-white"
                            >
                                #{tag.name}
                            </Link>
                        ))}
                        {popular_tags.length === 0 && (
                            <p className="text-sm text-gray-500">
                                No popular tags yet
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* 🕒 RECENT POSTS */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
                <h4 className="mb-5 text-lg font-semibold">Recent Posts</h4>
                <ul className="space-y-5">
                    {recent_posts.map((post) => (
                        <li key={post.slug}>
                            <Link
                                href={`/blog/${post.slug}`}
                                className="group flex items-start gap-4 transition hover:-translate-y-0.5"
                            >
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="h-16 w-16 rounded-md object-cover shadow-sm transition group-hover:scale-105"
                                />
                                <span className="text-sm leading-tight font-medium text-gray-800 group-hover:text-black">
                                    {post.title}
                                </span>
                            </Link>
                        </li>
                    ))}
                    {recent_posts.length === 0 && (
                        <li className="text-sm text-gray-500">
                            No recent posts
                        </li>
                    )}
                </ul>
            </section>
        </aside>
    );
}
