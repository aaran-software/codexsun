'use client';

import { Link } from '@inertiajs/react';
import type { PanInfo } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Slide {
    id: number;
    title: string;
    tagline: string;
    action: { text: string; href: string };
    image: string;
    moq: string;
    bulk: string;
    btn_cta: string;

}

const slides: Slide[] = [
    {
        id: 1,
        title: 'The Tirupur Textiles',
        tagline:
            'Manufacturer & wholesale supplier of premium knitted garments from Tirupur to Pondicherry',
        action: { text: 'View Our Collections', href: '/shop' },
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200',
        moq: 'Since 2026',
        bulk: 'Factory Direct Supply',
        btn_cta: 'bg-green-500 hover:bg-green-600',
    },
    {
        id: 2,
        title: 'Trusted by Major Brands & Buyers',
        tagline:
            'Supplying knitted garments to leading brands, retailers & bulk buyers across India',
        action: { text: 'Our Clients', href: '/clients' },
        image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=1200&h=600&fit=crop',

        moq: 'Large-Scale Production Capability',
        bulk: 'Bulk Orders Accepted',
        btn_cta: 'bg-green-500 hover:bg-green-600',
    },
    {
        id: 3,
        title: 'Fast Production & Reliable Delivery',
        tagline:
            'Efficient manufacturing timelines with consistent quality output',
        action: { text: 'Enquire Production', href: '/contact' },
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=600&fit=crop',
        moq: 'On-Time Manufacturing',
        bulk: 'Bulk Orders Accepted',
        btn_cta: 'bg-lime-500 hover:bg-lime-600',
    },
    {
        id: 4,
        title: 'Quality Knitted Cotton Fabrics',
        tagline: 'Premium cotton fabrics with strict quality control standards',
        action: { text: 'View Fabric Options', href: '/shop' },
        image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&h=600&fit=crop',
        moq: 'Quality-Assured Production',
        bulk: 'Factory Direct Supply',
        btn_cta: 'bg-red-500 hover:bg-red-600',
    },
    {
        id: 5,
        title: 'Wholesale & Custom Manufacturing',
        tagline: 'Supplying bulk orders for brands, retailers & distributors',
        action: { text: 'Talk to Sales Team', href: '/contact' },
        image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=1200&h=600&fit=crop',
        moq: 'Custom Orders Available',
        bulk: 'Large Quantity Supply',
        btn_cta: 'bg-blue-500 hover:bg-blue-600',
    },
];

export default function FullScreenSlider() {
    const [current, setCurrent] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [direction, setDirection] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const animationRef = useRef<number | null>(null);
    const startTime = useRef<number>(0); // Fixed: initialize with 0

    const duration = 5000;

    const next = () => {
        setDirection(1);
        setCurrent((i) => (i + 1) % slides.length);
        setProgress(0);
        startTime.current = performance.now(); // Fixed: set in effect
    };

    const prev = () => {
        setDirection(-1);
        setCurrent((i) => (i - 1 + slides.length) % slides.length);
        setProgress(0);
        startTime.current = performance.now();
    };

    const paginate = (dir: number) => {
        setDirection(dir);
        setCurrent((i) => (i + dir + slides.length) % slides.length);
        setProgress(0);
        startTime.current = performance.now();
    };

    const handleDragEnd = (_: never, info: PanInfo) => {
        const shouldNext = info.offset.x < -50 || info.velocity.x < -500;
        const shouldPrev = info.offset.x > 50 || info.velocity.x > 500;
        if (shouldNext) next();
        else if (shouldPrev) prev();
        // Fixed: no unused expression
    };

    useEffect(() => {
        if (!isPlaying) return;
        intervalRef.current = setInterval(next, duration);
        return () => clearInterval(intervalRef.current!);
    }, [isPlaying, current]);

    useEffect(() => {
        if (!isPlaying) return;

        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const elapsed = timestamp - startTime.current;
            const newProgress = Math.min(elapsed / duration, 1);
            setProgress(newProgress);
            if (newProgress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current)
                cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, current]);

    const circumference = 2 * Math.PI * 26;
    const strokeDashoffset = circumference * (1 - progress);

    const variants = {
        enter: (d: number) => ({ x: d > 0 ? 1000 : -1000, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 1000 : -1000, opacity: 0 }),
    };

    return (
        <div className="relative h-screen overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={current}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${slides[current].image})`,
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                    </div>

                    <div className="relative flex h-full items-center">
                        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
                            <div className="max-w-3xl">
                                <motion.h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
                                    {slides[current].title
                                        .split(' ')
                                        .map((w, i) => (
                                            <motion.span
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: 0.3 + i * 0.1,
                                                }}
                                                className="mr-3 inline-block"
                                            >
                                                {w}
                                            </motion.span>
                                        ))}
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="mb-8 text-xl text-gray-200 md:text-2xl"
                                >
                                    {slides[current].tagline}
                                </motion.p>

                                <motion.p
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="mb-8 text-xl text-gray-200 md:text-2xl"
                                >
                                    <div className="mb-4 flex flex-wrap gap-3">
                                        <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                                            {slides[current].moq}
                                        </span>
                                        <span className="rounded-full bg-orange-500/90 px-4 py-2 text-sm font-semibold text-white">
                                            {slides[current].bulk}
                                        </span>
                                    </div>
                                </motion.p>

                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.9 }}
                                >
                                    <Link
                                        href={slides[current].action.href}
                                        className={`inline-flex items-center gap-3 rounded-lg ${
                                            slides[current].btn_cta
                                        } px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl`}
                                    >
                                        {slides[current].action.text}{' '}
                                        <Play className="h-5 w-5" />
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Timer Circle */}
            <div className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2">
                <svg
                    width="56"
                    height="56"
                    viewBox="0 0 56 56"
                    className="rotate-[-90deg]"
                >
                    <circle
                        cx="28"
                        cy="28"
                        r="26"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="3"
                        fill="none"
                    />
                    <motion.circle
                        cx="28"
                        cy="28"
                        r="26"
                        stroke="white"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0, ease: 'linear' }}
                        strokeLinecap="round"
                    />
                </svg>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute inset-0 flex items-center justify-center text-white transition hover:scale-110"
                >
                    {isPlaying ? (
                        <Pause className="h-5 w-5" />
                    ) : (
                        <Play className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Arrows & Bullets */}
            <button
                onClick={prev}
                className="absolute top-1/2 left-6 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/40"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button
                onClick={next}
                className="absolute top-1/2 right-6 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/40"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 gap-3">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => paginate(i > current ? 1 : -1)}
                        className={`h-3 w-3 rounded-full transition-all ${i === current ? 'w-10 bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                    />
                ))}
            </div>
        </div>
    );
}
