'use client';

import {
    AnimatePresence,
    motion,
    useMotionValue,
    useSpring,
} from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { sliderOptions } from './slider.config';
import { slides } from './slider.data';
import type { BackgroundMode, SlideDirection } from './slider.types';
import { Link } from '@inertiajs/react';

export default function FullScreenSlider() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const ytRef = useRef<HTMLIFrameElement | null>(null);

    const startTime = useRef<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const animationRef = useRef<number | null>(null);

    const slide = slides[current];

    /* =========================
       INTENSITY
    ========================= */

    const intensity = slide.intensity ?? sliderOptions.defaultIntensity;

    const intensityMultiplier =
        intensity === 'low' ? 0.6 : intensity === 'high' ? 1.4 : 1;

    /* =========================
       BACKGROUND MODE
    ========================= */

    const backgroundMode: BackgroundMode =
        slide.backgroundMode ?? sliderOptions.defaultBackgroundMode ?? 'normal';


    const getHighlightClasses = (variant?: string) => {
        switch (variant) {
            case 'primary':
                return 'bg-blue-600/90 text-white';
            case 'secondary':
                return 'bg-gray-600/90 text-white';
            case 'success':
                return 'bg-green-600/90 text-white';
            case 'warning':
                return 'bg-yellow-500/90 text-black';
            case 'danger':
                return 'bg-red-600/90 text-white';
            case 'glass':
                return 'bg-white/20 backdrop-blur text-white';
            default:
                return 'bg-white/20 text-white';
        }
    };

    const getCTAColorClasses = (color?: string) => {
        switch (color) {
            case 'primary':
                return 'bg-blue-600 hover:bg-blue-700 text-white';
            case 'secondary':
                return 'bg-gray-600 hover:bg-gray-700 text-white';
            case 'success':
                return 'bg-green-600 hover:bg-green-700 text-white';
            case 'warning':
                return 'bg-yellow-500 hover:bg-yellow-600 text-black';
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white';
            case 'dark':
                return 'bg-black hover:bg-neutral-800 text-white';
            case 'light':
                return 'bg-white hover:bg-gray-200 text-black';
            default:
                return 'bg-white text-black hover:bg-gray-200';
        }
    };


    /* =========================
       PARALLAX ENGINE
    ========================= */

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, {
        stiffness: 40,
        damping: 15,
    });

    const springY = useSpring(mouseY, {
        stiffness: 40,
        damping: 15,
    });

    const handleMouseMove = (e: React.MouseEvent) => {
        const x =
            (e.clientX / window.innerWidth - 0.5) * 40 * intensityMultiplier;

        const y =
            (e.clientY / window.innerHeight - 0.5) * 40 * intensityMultiplier;

        mouseX.set(x);
        mouseY.set(y);
    };

    const getBackgroundMotion = () => {
        switch (backgroundMode) {
            case 'parallax':
                return { x: springX, y: springY };

            case '3d':
                return {
                    rotateY: springX,
                    rotateX: springY,
                };

            case 'cinematic':
                return {
                    scale: 1.1,
                };

            default:
                return {};
        }
    };

    /* =========================
       DIRECTION
    ========================= */

    const slideDirection: SlideDirection =
        slide.direction ?? sliderOptions.defaultDirection ?? 'left';

    const getVariants = () => {
        if (slideDirection === 'fade') {
            return {
                enter: { opacity: 0 },
                center: { opacity: 1 },
                exit: { opacity: 0 },
            };
        }

        const offset = slideDirection === 'left' ? 1000 : -1000;

        return {
            enter: {
                x: direction > 0 ? offset : -offset,
                opacity: 0,
            },
            center: { x: 0, opacity: 1 },
            exit: {
                x: direction > 0 ? -offset : offset,
                opacity: 0,
            },
        };
    };

    const variants = getVariants();

    /* =========================
       NAVIGATION
    ========================= */

    const next = () => {
        setDirection(1);
        setCurrent((i) => (i + 1) % slides.length);
        setProgress(0);
        startTime.current = performance.now();
    };

    const prev = () => {
        setDirection(-1);
        setCurrent((i) => (i - 1 + slides.length) % slides.length);
        setProgress(0);
        startTime.current = performance.now();
    };

    const goTo = (index: number) => {
        setDirection(index > current ? 1 : -1);
        setCurrent(index);
        setProgress(0);
        startTime.current = performance.now();
    };

    /* =========================
       DURATION
    ========================= */

    const getDuration = () => {
        if (slide.media.type === 'video' && videoRef.current) {
            return videoRef.current.duration * 1000;
        }
        return slide.duration ?? 6000;
    };

    /* =========================
       IMAGE + YT TIMER
    ========================= */

    useEffect(() => {
        if (!isPlaying) return;
        if (slide.media.type === 'video') return;

        const duration = getDuration();

        intervalRef.current = setInterval(next, duration);

        const animate = (t: number) => {
            if (!startTime.current) startTime.current = t;

            const percent = Math.min((t - startTime.current) / duration, 1);

            setProgress(percent);

            if (percent < 1)
                animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            clearInterval(intervalRef.current!);
            if (animationRef.current)
                cancelAnimationFrame(animationRef.current);
        };
    }, [current, isPlaying]);

    /* =========================
       VIDEO SYNC
    ========================= */

    useEffect(() => {
        if (slide.media.type !== 'video' || !videoRef.current) return;

        const video = videoRef.current;

        const update = () => setProgress(video.currentTime / video.duration);

        const ended = () => next();

        video.addEventListener('timeupdate', update);
        video.addEventListener('ended', ended);

        return () => {
            video.removeEventListener('timeupdate', update);
            video.removeEventListener('ended', ended);
        };
    }, [current]);

    /* =========================
       PAUSE (VIDEO + YT)
    ========================= */

    useEffect(() => {
        if (slide.media.type === 'video' && videoRef.current) {
            if (isPlaying) videoRef.current.play();
            else videoRef.current.pause();
        }

        if (slide.media.type === 'youtube' && ytRef.current) {
            ytRef.current.contentWindow?.postMessage(
                JSON.stringify({
                    event: 'command',
                    func: isPlaying ? 'playVideo' : 'pauseVideo',
                }),
                '*',
            );
        }
    }, [isPlaying, current]);

    const circumference = 2 * Math.PI * 26;
    const strokeDashoffset = circumference * (1 - progress);

    /* =========================
       RENDER
    ========================= */

    return (
        <div
            className="relative h-screen overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={current}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: {
                            type: 'spring',
                            stiffness: 250,
                            damping: 30,
                        },
                        opacity: { duration: 0.3 },
                    }}
                    className="absolute inset-0"
                >
                    {/* BACKGROUND */}

                    <motion.div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage:
                                slide.media.type === 'image'
                                    ? `url(${slide.media.src})`
                                    : undefined,
                            ...getBackgroundMotion(),
                        }}
                        initial={
                            backgroundMode === 'cinematic'
                                ? { scale: 1.3 }
                                : undefined
                        }
                        animate={
                            backgroundMode === 'cinematic'
                                ? { scale: 1.1 }
                                : undefined
                        }
                        transition={{
                            duration: backgroundMode === 'cinematic' ? 12 : 0,
                        }}
                    >
                        {slide.media.type === 'video' && (
                            <motion.video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="absolute inset-0 h-full w-full object-cover"
                                style={getBackgroundMotion()}
                            >
                                <source src={slide.media.mp4} />
                            </motion.video>
                        )}

                        {slide.media.type === 'youtube' && (
                            <motion.div style={getBackgroundMotion()}>
                                <iframe
                                    ref={ytRef}
                                    className="absolute inset-0 h-full w-full"
                                    src={`https://www.youtube.com/embed/${slide.media.videoId}?enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=${slide.media.videoId}&controls=0`}
                                    allow="autoplay"
                                />
                            </motion.div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                    </motion.div>

                    {/* CONTENT */}
                    <div className="relative z-10 flex h-full items-center">
                        <div className="mx-auto max-w-7xl px-6">
                            {/* TITLE */}
                            <motion.h1
                                key={slide.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="mb-6 text-5xl font-bold text-white md:text-7xl"
                            >
                                {slide.title}
                            </motion.h1>

                            {/* TAGLINE */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-6 text-xl text-gray-200"
                            >
                                {slide.tagline}
                            </motion.p>

                            {/* HIGHLIGHTS WITH COLOR */}
                            {slide.highlights && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="mb-8 flex flex-wrap gap-3"
                                >
                                    {slide.highlights.map((h, i) => (
                                        <span
                                            key={i}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold ${getHighlightClasses(
                                                h.variant,
                                            )}`}
                                        >
                                            {h.text}
                                        </span>
                                    ))}
                                </motion.div>
                            )}

                            {/* CTA BUTTON */}
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    delay: 0.8,
                                    duration: 0.6,
                                    type: 'spring',
                                    stiffness: 120,
                                    damping: 12,
                                }}
                            >
                                <Link
                                    href={slides[current].action.href}
                                    className={`group inline-flex items-center gap-3 rounded-lg px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95 ${
                                        slides[current].btn_cta
                                            ? slides[current].btn_cta
                                            : getCTAColorClasses(
                                                  slides[current].ctaColor,
                                              )
                                    } `}
                                >
                                    <span className="relative z-10">
                                        {slides[current].action.text}
                                    </span>

                                    <motion.span
                                        initial={{ x: 0 }}
                                        whileHover={{ x: 4 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 500,
                                        }}
                                        className="flex items-center"
                                    >
                                        <Play className="h-5 w-5" />
                                    </motion.span>

                                    {/* subtle glow overlay */}
                                    <span className="absolute inset-0 rounded-lg bg-white opacity-0 transition duration-300 group-hover:opacity-20" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* ARROWS */}

            <button
                onClick={prev}
                className="absolute top-1/2 left-6 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-black/20 p-3 text-white hover:bg-black/70"
            >
                <ChevronLeft
                    size={28}
                    className="text-white/20 hover:text-white"
                />
            </button>

            <button
                onClick={next}
                className="absolute top-1/2 right-6 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-black/20 p-3 text-white hover:bg-black/70"
            >
                <ChevronRight
                    size={28}
                    className="text-white/20 hover:text-white"
                />
            </button>

            {/* BULLETS */}

            <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3">
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

            {/* PROGRESS + PAUSE */}

            <div className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2">
                <div className="relative">
                    <svg width="56" height="56" className="-rotate-90">
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
                            animate={{
                                strokeDashoffset,
                            }}
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
            </div>
        </div>
    );
}
