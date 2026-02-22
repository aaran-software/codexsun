import { Head, Link, usePage } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterSection';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import BlogSidebarRight from './blocks/BlogSidebarRight';

type Blog = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    image: string | null;
    author: string;
    date: string;
    category: string;
};

type SidebarData = {
    categories: { name: string; slug: string; count: number }[];
    popular_tags: { name: string; slug: string }[];
    recent_posts: { title: string; slug: string; image: string; excerpt?: string }[];
};

type PageProps = {
    blogs: Blog[];
    sidebar: SidebarData;
};

export default function BlogIndex() {
    const { blogs = [], sidebar } = usePage<PageProps>().props;

    return (
        <WebLayout>
            <Head title="Blogs | The Tirupur Textiles" />

            <MenuBackdrop
                image="/assets/techmedia/repair.jpg"
                title="Blogs"
                subtitle="Ideas that inform. Stories that inspire."
            />

            {/* CONTENT */}
            <section className="bg-[#f7f7f7] py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                        {/* BLOG LIST */}
                        <div className="space-y-10 lg:col-span-8">
                            {blogs.length === 0 ? (
                                <div className="rounded-xl bg-white p-10 text-center text-gray-600">
                                    No blog posts found. Check back soon!
                                </div>
                            ) : (
                                blogs.map((blog) => (
                                    <Link
                                        key={blog.id}
                                        href={`/blog/${blog.slug}`}
                                        className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl md:flex-row"
                                    >
                                        <img
                                            src={blog.image ?? '/assets/placeholder-blog.jpg'}
                                            alt={blog.title}
                                            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:w-72"
                                        />

                                        <div className="flex-1 p-6">
                                            <span className="text-xs tracking-wide text-gray-500 uppercase">
                                                {blog.category}
                                            </span>

                                            <h3 className="mt-2 mb-3 text-xl font-semibold group-hover:underline">
                                                {blog.title}
                                            </h3>

                                            <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                                                {blog.excerpt}
                                            </p>

                                            <div className="text-xs text-gray-500">
                                                By {blog.author} · {blog.date}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* SIDEBAR – now dynamic */}
                        <div className="lg:col-span-4">
                            <BlogSidebarRight sidebar={sidebar} />
                        </div>
                    </div>
                </div>
            </section>

            <FooterCard />
        </WebLayout>
    );
}
