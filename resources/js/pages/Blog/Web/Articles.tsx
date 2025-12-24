'use client';

import { usePage, router } from '@inertiajs/react';
import WebMenu from '@/pages/web/web-menu';
import FooterSection from '@/pages/web/home/FooterSection';
import { motion } from 'framer-motion';
import { BlogPost } from './Post';

interface PageProps {
    posts: {
        data: BlogPost[];
    };
}

export default function Articles() {
    const { posts } = usePage<PageProps>().props;

    const handleBlog = (slug: string) => {
        router.visit(`/blog/web/articles/${slug}`);
    };

    return (
        <>
            <WebMenu />

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#f53003] via-red-600 to-orange-700 py-32">
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative mx-auto max-w-7xl px-6 text-center text-white lg:px-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 text-5xl font-bold md:text-7xl"
                    >
                        All-in-One Tech Repair
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mx-auto max-w-3xl text-xl md:text-2xl"
                    >
                        Desktop • Laptop • Camera • Server • Printer — We fix everything
                    </motion.p>
                </div>
            </section>

            {/* Content */}
            <div className="grid lg:grid-cols-[70%_30%] gap-5 px-5 md:px-[10%]">
                {/* Blog List */}
                <div className="space-y-5 pt-20 md:pb-10">
                    {posts.data.map((blog) => (
                        <div
                            key={blog.id}
                            onClick={() => handleBlog(blog.slug)}
                            className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-5 p-3 border border-ring/30 rounded-md hover:shadow cursor-pointer transition"
                        >
                            {/* Image */}
                            <img
                                src={`/storage/${blog.featured_image}`}
                                alt={blog.title}
                                loading="lazy"
                                className="object-scale-down w-[50%] md:w-[60%] h-full rounded"
                            />


                            {/* Content */}
                            <div className="flex flex-col justify-between pr-4">
                                <div>
                                    <h2 className="text-xl font-bold line-clamp-2">
                                        {blog.title}
                                    </h2>

                                    <p className="text-sm line-clamp-3 mt-1 text-muted-foreground">
                                        {blog.excerpt}
                                    </p>
                                </div>

                                <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-2">
                                    {blog.author && (
                                        <span className="font-semibold">
                                            {blog.author.name}
                                        </span>
                                    )}

                                    <span>
                                        {new Date(blog.created_at).toLocaleDateString()}
                                    </span>

                                    {blog.category && (
                                        <span className="bg-primary/10 px-2 rounded text-primary">
                                            {blog.category.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar (optional static for now) */}
                <div className="flex flex-col gap-6 lg:border-l py-20 lg:pl-5 border-ring/30">
                    <h3 className="text-lg font-semibold">Sidebar</h3>
                    <p className="text-sm text-muted-foreground">
                        Categories & Tags can be loaded later via Inertia props.
                    </p>
                </div>
            </div>

            <FooterSection />
        </>
    );
}
