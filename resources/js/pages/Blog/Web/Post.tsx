'use client';

import { usePage } from '@inertiajs/react';
import WebMenu from '@/pages/web/web-menu';
import FooterSection from '@/pages/web/home/FooterSection';

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
}

export default function Post() {
    const { post } = usePage<PageProps>().props;

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
                        className="
              mt-5 prose prose-neutral dark:prose-invert max-w-none
              [&>h2]:text-4xl [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:py-2 [&>h2]:text-gradient
              [&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:mt-5 [&>h3]:mb-3 [&>h3]:py-2 [&>h3]:text-foreground/90
              [&>h4]:text-lg [&>h4]:font-medium [&>h4]:mt-4 [&>h4]:mb-2 [&>h4]:py-2 [&>h4]:text-foreground/85
              [&>p]:text-base [&>p]:leading-relaxed [&>p]:mb-4 [&>p]:py-2 [&>p]:text-foreground/80
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul]:py-2
              [&>li]:text-base [&>li]:leading-relaxed [&>li]:mb-1 [&>li]:py-1 [&>li]:text-foreground/80
              [&>a]:text-primary [&>a]:underline hover:[&>a]:text-primary/80
              [&>strong]:text-foreground [&>strong]:font-semibold
              [&>img]:rounded-xl [&>img]:my-4 [&>img]:shadow-md
              [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
              [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-foreground/70 [&_blockquote]:my-4
            "
                        dangerouslySetInnerHTML={{ __html: post.body }}
                    />

                    {/* Comments */}

                {/*    {post.isComment && (*/}
                {/*        <div className="mt-10 border-t pt-6 space-y-6">*/}
                {/*            <h2 className="text-2xl font-semibold">Comments</h2>*/}
                {/*            <Timeline items={comments} showCollapse isHeading={false} />*/}
                {/*            <div className="mt-6 space-y-3">*/}
                {/*<textarea*/}
                {/*    className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"*/}
                {/*    rows={4}*/}
                {/*    placeholder="Write a comment..."*/}
                {/*    value={newComment}*/}
                {/*    onChange={(e) => setNewComment(e.target.value)}*/}
                {/*/>*/}
                {/*                <button*/}
                {/*                    onClick={handleSubmit}*/}
                {/*                    className="bg-primary text-foreground px-5 py-2 rounded-md hover:bg-primary/90 transition"*/}
                {/*                >*/}
                {/*                    Submit Comment*/}
                {/*                </button>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    )}*/}

                    <div className="mb-20"></div>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-6 h-full pr-1 pb-20 md:pb-0 lg:border-l lg:pl-5 border-ring/30">
                    {/*<GlobalSearch onSearchApi={""} onNavigate={() => {}} />*/}
                    <h2 className="text-xl font-semibold border-b pb-2">Recent Posts</h2>
                    {/*{recentBlogs.map((recent, idx) => (*/}
                    {/*    <div*/}
                    {/*        key={idx}*/}
                    {/*        className="grid grid-cols-[30%_70%] gap-4 items-start cursor-pointer"*/}
                    {/*        onClick={() => {*/}
                    {/*            handleBlog(recent.id);*/}
                    {/*        }}*/}
                    {/*    >*/}
                    {/*        <img*/}
                    {/*            src={recent.PostImage}*/}
                    {/*            alt="Thumbnail"*/}
                    {/*            className="rounded-md w-full h-full object-scale-down "*/}
                    {/*        />*/}
                    {/*        <div className="flex flex-col">*/}
                    {/*            <h3 className="text-lg font-bold text-foreground line-clamp-2">*/}
                    {/*                {recent.title}*/}
                    {/*            </h3>*/}
                    {/*            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">*/}
                    {/*                <p className="font-medium">{recent.author.name}</p>*/}
                    {/*                <span>•</span>*/}
                    {/*                <p>{recent.date}</p>*/}
                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*))}*/}
                </div>
            </div>
            <FooterSection />
        </>
    );
}
