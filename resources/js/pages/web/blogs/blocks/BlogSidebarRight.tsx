import { Link } from '@inertiajs/react';

const categories = [
    { name: 'Political', count: 10 },
    { name: 'Gadgets', count: 10 },
    { name: 'Sports', count: 10 },
    { name: 'Business', count: 10 },
    { name: 'Fashion', count: 10 },
];

const tags = ['Tirupur', 'Hosiery', 'Bulk Orders', 'Corporate Wear', 'B2B'];

const recentPosts = [
    {
        title: 'Understanding Tirupur Hosiery Manufacturing',
        slug: 'tirupur-hosiery',
        image: '/assets/ttt/blog/blog.jpg',
    },
    {
        title: 'How Wholesalers Can Improve Margins',
        slug: 'wholesale-margins',
        image: '/assets/ttt/blog/blog.jpg',
    },
    {
        title: 'Corporate T-Shirts Buying Guide',
        slug: 'corporate-tshirts',
        image: '/assets/ttt/blog/blog.jpg',
    },
];

export default function BlogSidebarRight() {
    return (
        <aside className="space-y-12">
            {/* 🔍 SEARCH */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
                <h4 className="sidebar-title">Search Blog</h4>
                <input
                    type="text"
                    placeholder="Search articles..."
                    className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:ring-1 focus:ring-black focus:outline-none"
                />
            </section>

            {/* 📂 CATEGORIES */}
            <section className="overflow-hidden rounded-xl bg-white shadow-sm">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4">
                    <h4 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
                        Categories
                    </h4>
                </div>

                {/* List */}
                <ul className="space-y-2 p-5">
                    {categories.map((cat) => (
                        <li key={cat.name}>
                            <Link
                                href={`/blog?category=${cat.name}`}
                                className="group flex items-center justify-between rounded-md px-4 py-3 text-sm text-gray-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-sm"
                            >
                                {/* Category Name */}
                                <span className="font-medium group-hover:text-black">
                                    {cat.name}
                                </span>

                                {/* Count */}
                                <span className="text-xs text-gray-500 group-hover:text-gray-700">
                                    {cat.count}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            {/* 🏷️ TAGS */}
            <section className="overflow-hidden rounded-xl bg-white shadow-sm">
                {/* Header (same as Categories) */}
                <div className="border-b border-gray-200 px-6 py-4">
                    <h4 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
                        Tags
                    </h4>
                </div>

                {/* Tags (unchanged) */}
                <div className="p-6">
                    <div className="flex flex-wrap gap-3">
                        {tags.map((tag) => (
                            <Link
                                key={tag}
                                href={`/blog/tag/${tag.toLowerCase().replace(' ', '-')}`}
                                className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-700 transition-all duration-200 ease-out hover:scale-[1.08] hover:bg-gray-900 hover:text-white"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 🕒 RECENT POSTS */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
                <h4 className="sidebar-title mb-5">Recent Posts</h4>

                <ul className="space-y-5">
                    {recentPosts.map((post) => (
                        <li key={post.slug}>
                            <Link
                                href={`/blog/${post.slug}`}
                                className="group flex items-center gap-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02]"
                            >
                                {/* Thumbnail */}
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="h-14 w-14 shrink-0 rounded-md object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                {/* Text */}
                                <span className="text-sm leading-snug text-gray-700 group-hover:text-black">
                                    {post.title}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </aside>
    );
}
