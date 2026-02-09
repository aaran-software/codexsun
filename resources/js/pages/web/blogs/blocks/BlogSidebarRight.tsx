import { Link } from '@inertiajs/react';

const categories = [
    'Manufacturing',
    'Wholesale',
    'Corporate',
    'Industry News',
    'Events',
];

const tags = ['Tirupur', 'Hosiery', 'Bulk Orders', 'Corporate Wear', 'B2B'];

const recentPosts = [
    {
        title: 'Understanding Tirupur Hosiery Manufacturing',
        slug: 'tirupur-hosiery',
    },
    { title: 'How Wholesalers Can Improve Margins', slug: 'wholesale-margins' },
    { title: 'Corporate T-Shirts Buying Guide', slug: 'corporate-tshirts' },
];

export default function BlogSidebarRight() {
    return (
        <aside className="space-y-10">
            {/* SEARCH */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <h4 className="sidebar-title">Search Blog</h4>
                <input
                    type="text"
                    placeholder="Search articles..."
                    className="mt-4 w-full rounded border border-gray-200 px-4 py-2 text-sm focus:ring-1 focus:ring-black focus:outline-none"
                />
            </div>

            {/* CATEGORIES */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <h4 className="sidebar-title">Categories</h4>
                <ul className="mt-4 space-y-3 text-sm">
                    {categories.map((cat) => (
                        <li key={cat}>
                            <Link
                                href={`/blog?category=${cat}`}
                                className="text-gray-600 hover:text-black"
                            >
                                {cat}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* TAGS */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <h4 className="sidebar-title">Tags</h4>
                <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Link
                            key={tag}
                            href={`/blog/tag/${tag.toLowerCase().replace(' ', '-')}`}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
                        >
                            #{tag}
                        </Link>
                    ))}
                </div>
            </div>

            {/* RECENT POSTS */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <h4 className="sidebar-title">Recent Posts</h4>
                <ul className="mt-4 space-y-4 text-sm">
                    {recentPosts.map((post) => (
                        <li key={post.slug}>
                            <Link
                                href={`/blog/${post.slug}`}
                                className="leading-snug text-gray-700 hover:text-black"
                            >
                                {post.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
