import { Head,  usePage } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterSection';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import BlogSidebarRight from './blocks/BlogSidebarRight'; // adjust path if needed

type Blog = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content?: string; // full article body (HTML or markdown-rendered)
    image: string;
    author: string;
    date: string;
    category: string;
    // Optional: for future features
    meta_description?: string;
    reading_time?: string;
    tags?: string[];
};

type PageProps = {
    blog: Blog;
    // You can later add: recentPosts, relatedPosts, nextPost, prevPost, etc.
};

export default function BlogShow() {
    const { blog } = usePage<PageProps>().props;

    return (
        <WebLayout>
            <Head title="Blogs | The Tirupur Textiles" />

            <MenuBackdrop
                image={blog.image}
                title={blog.title}
                subtitle={blog.category}
            />

            {/* MAIN CONTENT */}
            <section className="bg-white py-16 md:py-24">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                        {/* ARTICLE */}
                        <article className="prose prose-lg max-w-none lg:col-span-8">
                            {/* Featured Image (hero style) */}
                            <div className="mb-10 overflow-hidden rounded-2xl shadow-xl">
                                <img
                                    src={blog.image}
                                    alt={blog.title}
                                    className="h-auto w-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </div>

                            {/* Meta info */}
                            <div className="mb-8 flex flex-wrap items-center gap-6 text-sm text-gray-500">
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium tracking-wide text-gray-700 uppercase">
                                    {blog.category}
                                </span>
                                <div>
                                    By{' '}
                                    <span className="font-medium text-gray-800">
                                        {blog.author}
                                    </span>
                                </div>
                                <div>{blog.date}</div>
                                {blog.reading_time && (
                                    <div>{blog.reading_time} read</div>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="mb-6 text-4xl leading-tight font-bold tracking-tight md:text-5xl">
                                {blog.title}
                            </h1>

                            {/* Lead / Excerpt */}
                            <p className="mb-10 text-xl leading-relaxed text-gray-700">
                                {blog.excerpt}
                            </p>

                            {/* Actual content – assuming it's safe HTML coming from backend */}
                            <div
                                className="prose-headings:font-bold prose-a:text-blue-600 prose-a:underline prose-a:hover:text-blue-800"
                                dangerouslySetInnerHTML={{
                                    __html: blog.content || '',
                                }}
                            />

                            {/* Tags (optional) */}
                            {blog.tags && blog.tags.length > 0 && (
                                <div className="mt-12 flex flex-wrap gap-2">
                                    {blog.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </article>

                        {/* SIDEBAR */}
                        <aside className="lg:col-span-4">
                            <div className="sticky top-24 space-y-10">
                                <BlogSidebarRight />
                                {/* You can later add: Recent Posts, Categories, Newsletter signup, etc. */}
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <FooterCard />
        </WebLayout>
    );
}
