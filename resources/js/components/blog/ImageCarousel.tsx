import { useEffect, useState } from 'react';
import { BlogPost } from '@/pages/Blog/Web/Post';

export function ImageCarousel({ post }: { post: BlogPost }) {
    const images = [
        post.featured_image,
        ...(post.images?.map(img => img.image_path) || []),
    ].filter(Boolean) as string[];

    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused || images.length <= 1) return;

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 3000); // ⏱ 4 seconds

        return () => clearInterval(interval);
    }, [paused, images.length]);

    if (!images.length) return null;

    const prev = () =>
        setIndex((index - 1 + images.length) % images.length);

    const next = () =>
        setIndex((index + 1) % images.length);

    return (
        <div
            className="relative w-full h-[70vh] overflow-hidden rounded-xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <img
                src={`/storage/${images[index]}`}
                alt="Blog Cover"
                className="w-full h-full object-scale-down transition-opacity duration-700"
            />

            {/* Left */}
            <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded-full"
            >
                ‹
            </button>

            {/* Right */}
            <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded-full"
            >
                ›
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                    <span
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-2 w-2 rounded-full cursor-pointer transition ${
                            i === index ? 'bg-white scale-110' : 'bg-white/50'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
