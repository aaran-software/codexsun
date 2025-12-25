'use client';

import { usePage, router } from '@inertiajs/react';
import WebMenu from '@/pages/web/web-menu';
import FooterSection from '@/pages/web/home/FooterSection';
import { motion } from 'framer-motion';
import { BlogPost } from './Post';
import BlogCardsList from '@/components/blog/blog-list';

interface PageProps {
    posts: {
        data: BlogPost[];
    };
}

export default function Articles() {
    const { posts } = usePage<PageProps>().props;

    // const handleBlog = (slug: string) => {
    //     router.visit(`/blog/web/articles/${slug}`);
    // };

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

            <BlogCardsList posts={posts.data} />
            <FooterSection />
        </>
    );
}
