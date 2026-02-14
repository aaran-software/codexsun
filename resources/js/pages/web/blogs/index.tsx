import { Head, Link } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import CallToAction from '@/pages/web/home/blocks/cta/CallToAction';
import BlogSidebarRight from './blocks/BlogSidebarRight';

const blogs = [
    {
        id: 1,
        title: 'Understanding Tirupur Hosiery Manufacturing',
        excerpt: 'How Tirupur became India’s knitwear powerhouse.',
        image: '/assets/ttt/blog/blog.jpg',
        author: 'Editorial Team',
        date: 'Jan 08, 2024',
        category: 'Manufacturing',
    },
    {
        id: 2,
        title: 'Wholesale Buying Guide for Hosiery Garments',
        excerpt: 'What wholesalers must know before placing bulk orders.',
        image: '/assets/ttt/blog/blog2.png',
        author: 'Business Desk',
        date: 'Feb 14, 2024',
        category: 'Wholesale',
    },
    {
        id: 3,
        title: 'Wholesale Buying Guide for Hosiery Garments',
        excerpt: 'What wholesalers must know before placing bulk orders.',
        image: '/assets/ttt/blog/blog2.png',
        author: 'Business Desk',
        date: 'Feb 14, 2024',
        category: 'Wholesale',
    },
    {
        id: 4,
        title: 'Wholesale Buying Guide for Hosiery Garments',
        excerpt: 'What wholesalers must know before placing bulk orders.',
        image: '/assets/ttt/blog/blog2.png',
        author: 'Business Desk',
        date: 'Feb 14, 2024',
        category: 'Wholesale',
    },
    {
        id: 5,
        title: 'Wholesale Buying Guide for Hosiery Garments',
        excerpt: 'What wholesalers must know before placing bulk orders.',
        image: '/assets/ttt/blog/blog2.png',
        author: 'Business Desk',
        date: 'Feb 14, 2024',
        category: 'Wholesale',
    },
];

export default function BlogIndex() {
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
                            {blogs.map((blog) => (
                                <Link
                                    key={blog.id}
                                    href={`/blog/${blog.id}`}
                                    className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl md:flex-row"
                                >
                                    <img
                                        src={blog.image}
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

                                        <p className="mb-4 text-sm text-gray-600">
                                            {blog.excerpt}
                                        </p>

                                        <div className="text-xs text-gray-500">
                                            By {blog.author} · {blog.date}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* SIDEBAR */}
                        <div className="lg:col-span-4">
                            <BlogSidebarRight />
                        </div>
                    </div>
                </div>
            </section>

            <CallToAction />
            <FooterCard />
        </WebLayout>
    );
}
