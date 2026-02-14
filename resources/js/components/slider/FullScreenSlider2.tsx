'use client';

import { Link } from '@inertiajs/react';
import {
    AnimatePresence,
    motion,
} from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { sliderOptions } from './slider.config';
import type { Slide, VariantType } from './slider.types';

/* ======================================================
   SAMPLE SLIDES (UP TO 5)
====================================================== */

const slides: Slide[] = [
    {
        id: 1,
        title: 'Luxury Textile Manufacturing',
        tagline: 'Premium knitted garment production.',
        action: { text: 'View Collections', href: '/shop' },
        media: {
            type: 'image',
            src: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600',
        },
        btn_cta: 'bg-green-600 hover:bg-green-700',
    },
    {
        id: 2,
        title: 'Local Video Background',
        tagline: 'WebM + MP4 fallback demo.',
        action: { text: 'Contact Us', href: '/contact' },
        media: {
            type: 'video',
            webm: '/videos/hero.webm',
            mp4: '/assets/ttt/videos/ttt_opening.mp4',
            poster: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600',
        },
        btn_cta: 'bg-blue-600 hover:bg-blue-700',
    },
    {
        id: 3,
        title: 'YouTube Background Video',
        tagline: 'Embedded autoplay YouTube.',
        action: { text: 'Learn More', href: '/about' },
        media: {
            type: 'youtube',
            videoId: '16zrEPOsIcI',
        },
        btn_cta: 'bg-red-600 hover:bg-red-700',
    },
];

/* ======================================================
   VARIANT ENGINE
====================================================== */

const getVariants = (variant: VariantType) => {
    switch (variant) {
        case 'classic':
            return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.6 } };
        case 'luxury':
            return { initial: { opacity: 0, scale: 1.05 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 }, transition: { duration: 1.2 } };
        case 'industrial':
            return { initial: { x: 300, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -300, opacity: 0 }, transition: { type: 'spring', stiffness: 200 } };
        case 'saas':
            return { initial: { opacity: 0, filter: 'blur(20px)' }, animate: { opacity: 1, filter: 'blur(0px)' }, exit: { opacity: 0, filter: 'blur(20px)' }, transition: { duration: 0.8 } };
        case 'cinematic':
            return { initial: { opacity: 0, scale: 1.2 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.2 }, transition: { duration: 1.5 } };
    }
};

/* ======================================================
   MAIN COMPONENT
====================================================== */

export default function FullScreenSlider() {
    const [current, setCurrent] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);

    const duration = 6000;
    const startTime = useRef<number>(0);
    const animationRef = useRef<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const slide = slides[current];
    const animation = getVariants(sliderOptions.variant);

    /* ============================
       AUTOPLAY + PROGRESS
    ============================ */

    const next = () => {
        setCurrent((i) => (i + 1) % slides.length);
        setProgress(0);
        startTime.current = performance.now();
    };

    const goTo = (index: number) => {
        setCurrent(index);
        setProgress(0);
        startTime.current = performance.now();
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
            if (newProgress < 1)
                animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => animationRef.current && cancelAnimationFrame(animationRef.current);
    }, [current, isPlaying]);

    const circumference = 2 * Math.PI * 26;
    const strokeDashoffset = circumference * (1 - progress);

    /* ======================================================
       RENDER
    ====================================================== */

    return (
        <div className="relative h-screen overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={animation.initial}
                    animate={animation.animate}
                    exit={animation.exit}
                    transition={animation.transition}
                    className="absolute inset-0"
                >
                    {/* BACKGROUND */}
                    <div className="absolute inset-0 overflow-hidden">
                        {slide.media.type === 'image' && (
                            <motion.div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${slide.media.src})` }}
                                initial={{ scale: sliderOptions.variant === 'cinematic' ? 1.3 : 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 8 }}
                            />
                        )}

                        {slide.media.type === 'video' && (
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                poster={slide.media.poster}
                                className="absolute inset-0 w-full h-full object-cover"
                            >
                                {slide.media.webm && <source src={slide.media.webm} type="video/webm" />}
                                <source src={slide.media.mp4} type="video/mp4" />
                            </video>
                        )}

                        {slide.media.type === 'youtube' && (
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${slide.media.videoId}?autoplay=1&mute=1&loop=1&playlist=${slide.media.videoId}&controls=0&modestbranding=1&showinfo=0&rel=0`}
                                allow="autoplay; fullscreen"
                            />
                        )}

                        <div className="absolute inset-0 bg-black/60" />
                    </div>

                    {/* CONTENT */}
                    <div className="relative flex h-full items-center">
                        <div className="mx-auto max-w-7xl px-6">
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                                {slide.title}
                            </h1>
                            <p className="text-xl text-gray-200 mb-8">
                                {slide.tagline}
                            </p>
                            <Link
                                href={slide.action.href}
                                className={`inline-flex items-center gap-3 rounded-lg ${
                                    slide.btn_cta || 'bg-white text-black'
                                } px-8 py-4 text-lg font-semibold text-white`}
                            >
                                {slide.action.text}
                                <Play className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* PROGRESS CIRCLE */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
                <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                    <circle cx="28" cy="28" r="26" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                    <motion.circle
                        cx="28"
                        cy="28"
                        r="26"
                        stroke="white"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset }}
                        strokeLinecap="round"
                    />
                </svg>

                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute inset-0 flex items-center justify-center text-white"
                >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
            </div>

            {/* SLIDE SELECT BUTTONS */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`h-3 rounded-full transition-all ${
                            i === current
                                ? 'w-10 bg-white'
                                : 'w-3 bg-white/50 hover:bg-white/80'
                        }`}
                    />
                ))}
            </div>

            {/* ARROWS */}
            <button
                onClick={() => goTo((current - 1 + slides.length) % slides.length)}
                className="absolute top-1/2 left-6 -translate-y-1/2 text-white"
            >
                <ChevronLeft size={32} />
            </button>
            <button
                onClick={() => goTo((current + 1) % slides.length)}
                className="absolute top-1/2 right-6 -translate-y-1/2 text-white"
            >
                <ChevronRight size={32} />
            </button>
        </div>
    );
}
