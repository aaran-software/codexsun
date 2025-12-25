import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { BlogPost } from '@/pages/Blog/Web/Post';

export interface Blog {
    id: number;
    title: string;
    fea: string;
    body: string;
    slug?: string;
}

export default function BlogCardsList({ posts }: { posts: BlogPost[] }) {
    const [chunk, setChunk] = useState<number>(3);
    const [visibleCount, setVisibleCount] = useState<number>(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setChunk(2);
                setVisibleCount(2);
            } else {
                setChunk(3);
                setVisibleCount(3);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const visiblePosts = posts.slice(
        Math.max(0, posts.length - visibleCount)
    );

    const allShown = visibleCount >= posts.length;

    const handleViewMore = () => {
        setVisibleCount((prev) =>
            Math.min(posts.length, prev + chunk)
        );
    };

    return (
        <section className="mx-auto px-4 lg:px-[10%] py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePosts.map((p) => (
                    <Link
                        key={p.id}
                        href={`/blog/web/articles/${p.slug ?? p.id}`}
                        className="group relative overflow-hidden rounded-lg shadow-md bg-white"
                    >
                        <div className="relative h-48 md:h-64 w-full overflow-hidden">
                            <img
                                src={`/storage/${p.featured_image}`}
                                alt={p.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <div className="mt-2 px-2 text-xs text-muted-foreground flex flex-wrap gap-2">
                            {p.author && (
                                <span className="font-semibold">
                                            {p.author.name}
                                        </span>
                            )}

                            <span>
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </span>

                            {p.category && (
                                <span className="bg-primary/10 px-2 rounded text-primary">
                                            {p.category.name}
                                        </span>
                            )}
                        </div>
                        <div className="p-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {p.title}
                            </h3>

                            <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                                {p.body}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-8 text-center">
                {!allShown ? (
                    <button
                        onClick={handleViewMore}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                    >
                        View More
                    </button>
                ) : (
                    <p className="text-sm text-gray-500">All posts loaded</p>
                )}
            </div>
        </section>
    );
}
