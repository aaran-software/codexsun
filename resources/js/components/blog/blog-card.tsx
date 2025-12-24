import { useState, useEffect, useRef } from "react";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import ImageButton from '../ImageBtn';
import { BlogPost } from '@/pages/Blog/Web/Articles';

type BlogCarouselCardProps = {
    blogs: BlogPost[];
    title: string;
};

export default function BlogCard({
                                             blogs,
                                             title,
                                         }: BlogCarouselCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [numVisible, setNumVisible] = useState(2);

    // Swipe state
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.changedTouches[0].clientX;
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.changedTouches[0].clientX;
    };
    const handleTouchEnd = () => {
        if (touchStartX.current - touchEndX.current > 50) nextSlide();
        if (touchEndX.current - touchStartX.current > 50) prevSlide();
    };


    // Responsive layout
    useEffect(() => {
        let timer: NodeJS.Timeout;
        const updateVisible = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (window.innerWidth < 640) setNumVisible(1);
                else if (window.innerWidth < 900) setNumVisible(2);
                else setNumVisible(3);
            }, 100);
        };
        window.addEventListener("resize", updateVisible);
        updateVisible(); // initial
        return () => window.removeEventListener("resize", updateVisible);
    }, []);


    // const nextSlide = () => {
    //   if (currentIndex < blogs.length - numVisible) {
    //     setCurrentIndex((prev) => prev + 1);
    //   }
    // };

    // const prevSlide = () => {
    //   if (currentIndex > 0) {
    //     setCurrentIndex((prev) => prev - 1);
    //   }
    // };
    const nextSlide = () => {
        if (currentIndex >= blogs.length - numVisible) {
            setCurrentIndex(0);
        } else {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        } else {
            setCurrentIndex(0);
        }
    };
    //
    // const handleBlog = (id: string) => {
    //     navigate(`/blog/${id}`);
    // };

    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (trackRef.current) {
            trackRef.current.style.transform = `translateX(-${currentIndex * (100 / numVisible)}%)`;
        }
    }, [currentIndex, numVisible]);

    return (
        <div className="w-full mx-auto relative">
            <div className="overflow-hidden flex flex-col gap-10">
                <div className="flex flex-row justify-between">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold">{title}</h1>
                    </div>
                    <div className="flex gap-5">
                        {/* Controls (hidden on mobile) */}
                        <ImageButton
                            icon="left"
                            onClick={prevSlide}
                            disabled={currentIndex === 0}
                            className="bg-primary/30 text-foreground p-2 disabled:opacity-30"
                        >
                            <span className="sr-only">previous slide</span>
                        </ImageButton>
                        <ImageButton
                            icon="right"
                            onClick={nextSlide}
                            disabled={currentIndex >= blogs.length - numVisible}
                            className="bg-primary/30 text-foreground p-2 disabled:opacity-30"
                        >
                            <span className="sr-only">next slide</span>
                        </ImageButton>
                    </div>
                </div>

                <div
                    ref={trackRef}
                    className="flex transition-transform duration-500"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {blogs.map((b) => (
                        <div
                            key={b.id}
                            className="flex-shrink-0 p-2"
                            style={{ width: `${100 / numVisible}%` }}
                            onClick={()=>[console.log("hi")]}
                        >
                            <div className="cursor-pointer border border-ring/30 rounded-2xl pb-3 h-full flex flex-col hover:-translate-y-2 duration-400">
                                {/* Image */}
                                <div className="relative overflow-hidden aspect-[4/3]">
                                    <img
                                        src={b.featured_image}
                                        alt={b.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover rounded-tl-2xl rounded-tr-2xl"
                                    />
                                    {/*<p className="absolute top-2 left-2 text-sm font-semibold bg-highlight1 text-highlight1-foreground py-1 px-2 rounded-full">*/}
                                    {/*    {b.category}*/}
                                    {/*</p>*/}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col justify-between flex-grow px-3">
                                    <div>
                                        {/* Meta */}
                                        <div className="flex my-3 text-foreground/50 text-sm">
                                            <FaCalendarAlt className="block my-auto mr-2" />
                                            <span className="mr-5">{b.created_at}</span>
                                            <FaUser className="block my-auto mr-2" />
                                            <span>{b.author?.name}</span>
                                        </div>

                                        {/* Title */}
                                        <h1 className="text-lg md:text-2xl text-foreground font-bold line-clamp-2">
                                            {b.title}
                                        </h1>
                                    </div>

                                    {/* Description always at bottom */}
                                    <p
                                        className="text-sm mt-2 text-foreground/50 line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: b.body }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
