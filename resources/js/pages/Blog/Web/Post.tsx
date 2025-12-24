'use client';

import { Head, router, usePage } from '@inertiajs/react';
import WebMenu from '@/pages/web/web-menu';
import FooterSection from '@/pages/web/home/FooterSection';
import Timeline from '@/components/blog/timeline';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { ImageCarousel } from '@/components/blog/ImageCarousel';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
type BlogComment = {
    id: number;
    body: string;
    created_at: string;
    user: {
        name: string;
    };
};
type BlogImage = {
    id: number;
    image_path: string;
};
export type BlogPost = {
    id: number;
    title: string;
    body: string;
    featured_image?: string;
    created_at: string;
    comments?: BlogComment[];
    images?: BlogImage[];
    meta_keywords?: string[];
    likes_count?: number;
    liked?: boolean;

    category?: {
        name: string;
    };

    author?: {
        name: string;
    };

    tags?: {
        id: number;
        name: string;
    }[];
};

interface PageProps {
    post: BlogPost;
    recentPosts: BlogPost[];
}

export default function Post() {
    const { post, recentPosts, auth } = usePage<PageProps & {
        auth: {
            user: any | null;
        };
    }>().props;

    const handleBlog = (id: string) => {
        router.visit(`/blog/web/articles/${id}`);
    };

    const timelineComments = (post.comments ?? []).map((comment) => ({
        date: comment.created_at,
        title: 'Comment',
        description: comment.body,
        user: {
            name: comment.user.name,
            initial: comment.user.name.charAt(0).toUpperCase(),
        },
        icon: <span>💬</span>,
    }));

    const [newComment, setNewComment] = useState("");
    const handleSubmit = () => {
        if (!newComment.trim()) return;

        router.post(
            route('blog.comments.store'),
            {
                blog_post_id: post.id,
                body: newComment,
            },
            {
                preserveScroll: true,
                onSuccess: () => setNewComment(''),
            }
        );
    };

    return (
        <>
            <Head>
                {/* Title */}
                <title>{post.title}</title>

                {/* Meta Description */}
                <meta
                    name="description"
                    content={
                        post.body
                            .replace(/<[^>]+>/g, '') // remove HTML
                            .slice(0, 160)
                    }
                />

                {/* Keywords */}
                {post.meta_keywords && post.meta_keywords.length > 0 && (
                    <meta
                        name="keywords"
                        content={post.meta_keywords.join(', ')}
                    />
                )}


                {/* Author */}
                {post.author?.name && (
                    <meta name="author" content={post.author.name} />
                )}

                {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
                <meta property="og:title" content={post.title} />
                <meta
                    property="og:description"
                    content={post.body.replace(/<[^>]+>/g, '').slice(0, 160)}
                />
                <meta
                    property="og:image"
                    content={
                        post.featured_image
                            ? `${window.location.origin}/storage/${post.featured_image}`
                            : ''
                    }
                />
                <meta
                    property="og:url"
                    content={window.location.href}
                />
                <meta property="og:type" content="article" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.title} />
                <meta
                    name="twitter:description"
                    content={post.body.replace(/<[^>]+>/g, '').slice(0, 160)}
                />
                {post.featured_image && (
                    <meta
                        name="twitter:image"
                        content={`${window.location.origin}/storage/${post.featured_image}`}
                    />
                )}
            </Head>

            <WebMenu />
            <section className="relative overflow-hidden py-36">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f53003] via-red-600 to-orange-700" />

                {/* Soft noise / overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

                {/* Decorative glow */}
                <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

                <div className="relative mx-auto max-w-6xl px-6 text-center text-white lg:px-8">
                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl"
                    >
                        {post.title}
                    </motion.h1>

                    {/* Meta */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex flex-wrap items-center justify-center gap-4"
                    >
                        {/* Author */}
                        <div className="flex items-center gap-3 rounded-full bg-white/10 px-5 py-2 backdrop-blur-md">
                            {/*<div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg font-bold">*/}
                            {/*    {post.author?.name?.slice(0, 1)}*/}
                            {/*</div>*/}
                            <span className="text-sm font-semibold">
                    {post.author?.name}
                </span>
                        </div>

                        {/* Divider */}
                        <span className="hidden h-4 w-px bg-white/30 md:block" />

                        {/* Date */}
                        <div className="rounded-full bg-white/10 px-5 py-2 text-sm backdrop-blur-md">
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </div>

                        {/* Divider */}
                        <span className="hidden h-4 w-px bg-white/30 md:block" />

                        <div className="flex items-center gap-3 rounded-full bg-white/10 px-5 py-2 backdrop-blur-md">
                            {/*<div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg font-bold">*/}
                            {/*    {post.author?.name?.slice(0, 1)}*/}
                            {/*</div>*/}
                            <span className="text-sm font-semibold">
                    {post.category?.name}
                </span>
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8 px-5 md:px-[10%] mt-10">
                <div>
                    <ImageCarousel post={post} />


                    {/* Author */}
                    {/*<div className="flex items-center gap-3 text-sm text-muted-foreground mt-4">*/}

                    {/*    <div className={"rounded-full w-8 h-8 object-cover capitalize bg-gray-400 text-white text-xl font-extrabold flex justify-center items-center"}>{post.author?.name.slice(0,1)}</div>*/}
                    {/*    <p className="font-semibold text-foreground">{post.author?.name}</p>*/}
                    {/*    <div className="flex items-center gap-1">*/}
                    {/*        <span className="w-2 h-2 border rounded-full bg-primary"></span>*/}
                    {/*        <p className="text-foreground/80">  {new Date(post.created_at).toLocaleDateString()}</p>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    {/* Title */}
                    {/*<h1 className="text-2xl font-bold text-foreground/80 leading-tight my-5">*/}
                    {/*    {post.title}*/}
                    {/*</h1>*/}

                    {/* Tags & Category */}
                    <div className="flex flex-wrap py-5 items-center gap-3 text-sm text-muted-foreground mt-2">
            {/*            <p className="font-medium text-foreground">Category:</p>*/}
            {/*            <span className="px-3 py-1 bg-foreground/10 text-foreground rounded-full">*/}
            {/*  {post.category?.name}*/}
            {/*</span>*/}

                        <button
                            onClick={() =>
                                router.post(route('blog.posts.like'), {
                                    blog_post_id: post.id,
                                }, {
                                    preserveScroll: true,
                                })
                            }
                            className={`flex items-center gap-2 rounded-full border px-4 py-2 transition
        ${post.liked
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-700 hover:bg-red-50'
                            }`}
                        >
                            <Heart
                                className={`h-5 w-5 ${post.liked ? 'fill-white' : ''}`}
                            />
                            <span>{post.likes_count}</span>
                        </button>
                        <p className="font-medium text-foreground">Tags:</p>
                        {post.tags?.map((tag, idx) => (
                            <span
                                key={tag.id ?? idx}
                                className="px-3 py-1 bg-foreground/10 text-foreground rounded-full"
                            >
        #{tag.name}
    </span>
                        ))}

                    </div>

                    {/* Content HTML */}
                    <div
                        className=""
                        dangerouslySetInnerHTML={{ __html: post.body }}
                    ></div>
                    {/* Comments */}

                    {/* Comments */}
                    <div className="mt-10 border-t pt-6 space-y-6">
                        <h2 className="text-2xl font-semibold">Comments</h2>

                        {/* Existing comments always visible */}
                        <Timeline
                            items={timelineComments}
                            showCollapse
                            isHeading={false}
                        />

                        {/* Comment form only for logged-in users */}
                        {auth?.user ? (
                            <div className="mt-6 space-y-3">
            <textarea
                className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                rows={4}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />

                                <button
                                    onClick={handleSubmit}
                                    className="bg-primary text-primary-foreground px-5 py-2 rounded-md transition"
                                >
                                    Submit Comment
                                </button>
                            </div>
                        ) : (
                            <div className="mt-6 rounded-lg border bg-muted p-4 text-sm">
                                <p className="text-muted-foreground">
                                    Please{' '}
                                    <a
                                        href={route('login')}
                                        className="font-semibold text-primary underline"
                                    >
                                        login
                                    </a>{' '}
                                    to write a comment.
                                </p>
                            </div>
                        )}
                    </div>


                    <div className="mb-20"></div>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-6 h-full pr-1 pb-20 md:pb-0 lg:border-l lg:pl-5 border-ring/30">
                    <h2 className="text-xl font-semibold border-b pb-2">
                        Recent Posts
                    </h2>

                    {recentPosts.map((recent) => (
                        <div
                            key={recent.id}
                            className="grid grid-cols-[30%_70%] gap-4 items-start cursor-pointer"
                            onClick={() => handleBlog(recent.id)}
                        >
                            {recent.featured_image && (
                                <img
                                    src={`/storage/${recent.featured_image}`}
                                    alt={recent.title}
                                    className="rounded-md w-full h-full object-cover"
                                />
                            )}

                            <div className="flex flex-col">
                                <h3 className="text-lg font-bold line-clamp-2">
                                    {recent.title}
                                </h3>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    {recent.author && (
                                        <p className="font-medium">
                                            {recent.author.name}
                                        </p>
                                    )}
                                    <span>•</span>
                                    <p>
                                        {new Date(recent.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            <FooterSection />
        </>
    );
}
