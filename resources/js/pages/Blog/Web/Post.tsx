'use client';

import { router, usePage } from '@inertiajs/react';
import WebMenu from '@/pages/web/web-menu';
import FooterSection from '@/pages/web/home/FooterSection';
import Timeline from '@/components/blog/timeline';
import { useState } from 'react';

type BlogPost = {
    id: number;
    title: string;
    body: string;
    featured_image?: string;
    created_at: string;

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
    const { post, recentPosts } = usePage<PageProps>().props;
    const handleBlog = (slug: string) => {
        router.visit(`/blog/web/articles/${slug}`);
    };

    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState("");
    const handleSubmit = () => {
        if (!newComment.trim()) return;
        const newEntry = {
            date: new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            }),
            title: "New Comment",
            description: newComment,
            user: { name: "Muthu", initial: "M" },
            icon: <span>💬</span>,
        };
        setComments([newEntry, ...comments]);
        setNewComment("");
    };

    return (
        <>
            <WebMenu />

            <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8 px-5 md:px-[10%]">
                <div>
                    <img
                        src={`/storage/${ post.featured_image }`}
                        alt="Blog Cover"
                        className="rounded-xl w-full h-[70vh] object-cover"
                    />

                    {/* Author */}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-4">

                        <div className={"rounded-full w-8 h-8 object-cover capitalize bg-gray-400 text-white text-xl font-extrabold flex justify-center items-center"}>{post.author?.name.slice(0,1)}</div>
                        <p className="font-semibold text-foreground">{post.author?.name}</p>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 border rounded-full bg-primary"></span>
                            <p className="text-foreground/80">  {new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-foreground/80 leading-tight my-5">
                        {post.title}
                    </h1>

                    {/* Tags & Category */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                        <p className="font-medium text-foreground">Category:</p>
                        <span className="px-3 py-1 bg-foreground/10 text-foreground rounded-full">
              {post.category?.name}
            </span>
                        <p className="font-medium ml-4 text-foreground">Tags:</p>
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

                        <div className="mt-10 border-t pt-6 space-y-6">
                            <h2 className="text-2xl font-semibold">Comments</h2>
                            <Timeline items={comments} showCollapse isHeading={false} />
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
                                    className="bg-primary text-foreground px-5 py-2 rounded-md hover:bg-primary/90 transition"
                                >
                                    Submit Comment
                                </button>
                            </div>
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
                            onClick={() => handleBlog(recent.slug)}
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
