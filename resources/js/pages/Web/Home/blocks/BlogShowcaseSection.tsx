// resources/js/pages/web/home/blocks/BlogShowcaseSection.tsx - FIXED + SAFE
'use client';

import { Link } from '@inertiajs/react';
import { CircleUserRound } from 'lucide-react';
import FadeUp from '@/components/blocks/animate/fade-up';
import type { BlogData } from '@/lib/tenant/types';

interface BlogShowcaseProps {
    blog?: BlogData | null;
}

export default function BlogShowcaseSection({ blog }: BlogShowcaseProps) {
    if (!blog || !blog.featuredPosts?.length) return null;

    const { heading, description, buttonText, buttonHref, featuredPosts } = blog;

    return (
        <section className="bg-white py-20 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <FadeUp>
                    <div className="mb-20 grid grid-cols-1 gap-6 md:mb-24 md:grid-cols-3">
                        {featuredPosts.map((post) => (
                            <Link
                                href={`/blog/${post.slug}`}
                                key={post.id}
                                className="group relative block h-80 overflow-hidden rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-md md:h-96"
                            >
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-linear-to-t from-black/65 via-black/45 to-transparent" />
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/6 bg-black/60" />

                                <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white hover:-translate-y-0.5">
                                    <div className="mb-3 flex items-center gap-2 text-xs opacity-90">
                                        <span className="flex items-center gap-1">
                                            <CircleUserRound className="h-4 w-4" />
                                            {post.author}
                                        </span>
                                        <span>•</span>
                                        <span>🕒 {post.date}</span>
                                    </div>

                                    <h3 className="mb-2 line-clamp-3 font-serif text-lg leading-tight font-semibold md:text-xl">
                                        {post.title}
                                    </h3>

                                    {post.excerpt && (
                                        <p className="line-clamp-2 text-sm opacity-95">
                                            {post.excerpt}
                                        </p>
                                    )}

                                    <span className="mt-3 block h-0.5 w-0 bg-red-500 transition-all duration-500 group-hover:w-56" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </FadeUp>

                <FadeUp>
                    <div className="grid w-full grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-16">
                        <div>
                            <h2 className="font-serif text-3xl leading-tight text-gray-900 md:text-4xl">
                                {heading}
                            </h2>
                        </div>

                        <div className="flex flex-col items-start md:items-end">
                            <p className="mb-6 max-w-xl text-sm whitespace-pre-line text-gray-600 md:text-right md:text-base">
                                {description}
                            </p>

                            <Link
                                href={buttonHref}
                                className="inline-block rounded-lg bg-red-500 px-6 py-3 text-sm font-medium tracking-wide text-white transition duration-300 hover:bg-red-600 md:text-base"
                            >
                                {buttonText}
                            </Link>
                        </div>
                    </div>
                </FadeUp>
            </div>
        </section>
    );
}
