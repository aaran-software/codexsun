import { Head, Link, usePage } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import WebLayout from '@/layouts/web-layout';
import BlogSidebarRight from './BlogSidebarRight'; // adjust path if needed

type Blog = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    // you can add image, date, etc. later if needed in list
};

type SidebarData = {
    categories: { name: string; slug: string; count: number }[];
    popular_tags: { name: string; slug: string }[];
    recent_posts: { title: string; slug: string; image: string }[];
};

type PageProps = {
    tag: string;
    blogs: Blog[];
    sidebar: SidebarData;
};

export default function BlogTag() {
    const { tag, blogs = [], sidebar } = usePage<PageProps>().props;

    return (
        <WebLayout>
            <Head title={`#${tag} Articles | The Tirupur Textiles`} />

            <section className="bg-[#f7f7f7] py-24">
                <div className="container mx-auto px-4">
                    <h1 className="mb-12 text-3xl font-bold md:text-4xl">
                        Articles tagged with “{tag}”
                    </h1>

                    {blogs.length === 0 ? (
                        <div className="rounded-xl bg-white p-10 text-center text-gray-600">
                            No articles found with tag "{tag}".
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {blogs.map((blog) => (
                                <Link
                                    key={blog.id}
                                    href={`/blog/${blog.slug}`}
                                    className="group overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="p-6">
                                        <h3 className="mb-3 text-xl leading-tight font-semibold group-hover:underline">
                                            {blog.title}
                                        </h3>
                                        <p className="line-clamp-3 text-sm text-gray-600">
                                            {blog.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Optional: add sidebar here too for consistency */}
            <div className="container mx-auto px-4 py-16">
                <BlogSidebarRight sidebar={sidebar} />
            </div>

            <FooterCard />
        </WebLayout>
    );
}
