import { Link } from "@inertiajs/react";
import FadeUp from "@/components/animate/fade-up";

const blogs = [
    {
        title: 'Lorem ipsum primis risus',
        author: 'Muffin',
        date: 'January 8, 2020',
        image: '/assets/ttt/blog/blog.jpg',
        accent: 'from-black/60 to-black/10',
    },
    {
        title: 'Integer ultrices posuere cubilia',
        author: 'Muffin',
        date: 'January 8, 2020',
        image: '/assets/ttt/blog/blog2.png',
        accent: 'from-red-900/70 to-black/10',
    },
    {
        title: 'Quisque lorem tortor fringilla sed',
        author: 'Muffin',
        date: 'January 8, 2020',
        image: '/assets/ttt/blog/blog.jpg',
        accent: 'from-black/70 to-black/20',
    },
];

export default function BlogShowcaseSection() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">

                {/* BLOG CARDS */}
                <FadeUp>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-20">
                        {blogs.map((blog, index) => (
                            <Link
                                href="/blog"
                                key={index}
                                className="group relative h-90 overflow-hidden"
                            >
                                {/* Image */}
                                <img
                                    src={blog.image}
                                    alt={blog.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Overlay */}
                                <div
                                    className={`absolute inset-0 bg-linear-to-t ${blog.accent}`}
                                />

                                {/* Content */}
                                <div className="absolute bottom-8 left-8 right-8 text-white">
                                    <div className="flex items-center text-xs opacity-80 mb-3 gap-2">
                                        <span>👤 {blog.author}</span>
                                        <span>•</span>
                                        <span>🕒 {blog.date}</span>
                                    </div>

                                    <h3 className="text-xl font-serif leading-snug mb-4">
                                        {blog.title}
                                    </h3>

                                    {/* Hover underline */}
                                    <span className="block h-0.5 w-0 bg-red-500 transition-all duration-500 group-hover:w-12" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </FadeUp>

                {/* BOTTOM CONTENT */}
                <FadeUp>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <h2 className="text-4xl font-serif text-gray-900 leading-tight">
                            Check the list of our <br />
                            upcoming blogs & events
                        </h2>

                        <div>
                            <p className="text-sm text-gray-600 mb-6 max-w-md">
                                Insights from Tirupur manufacturing, wholesale
                                trends, trade events, and industry updates for
                                retailers and bulk buyers.
                            </p>

                            <Link
                                href="/blog"
                                className="inline-block bg-red-500 text-white px-6 py-3 text-sm font-medium tracking-wide hover:bg-red-600 transition"
                            >
                                SHOW ALL BLOGS
                            </Link>
                        </div>
                    </div>
                </FadeUp>

            </div>
        </section>
    );
}
