'use client';

import { Link, usePage } from '@inertiajs/react';
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useSpring,
} from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getCTAColorClasses, getHighlightClasses } from './slider.colors';
import type { BackgroundMode, SlideDirection } from './slider.types';

// Constants outside component
const PROGRESS_RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

export default function FullScreenSlider() {
    const { slider = { slides: [], options: {} } } = usePage<{
        slider?: { slides: any[]; options?: any };
    }>().props;

    const slides = slider.slides ?? [];
    const sliderOptions = slider.options ?? {
        parallax: true,
        defaultVariant: 'saas',
        defaultIntensity: 'medium',
        defaultDirection: 'fade',
        defaultBackgroundMode: 'cinematic',
    };

    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const ytRef = useRef<HTMLIFrameElement>(null);

    const startTime = useRef<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const animationRef = useRef<number | null>(null);

    // Fallback to first slide or empty object
    const slide = slides[current] ??
        slides[0] ?? { media: { type: 'image', src: '' } };

    // ──────────────────────────────────────────────
    // Intensity & Background Mode
    // ──────────────────────────────────────────────

    const intensity = slide.intensity ?? sliderOptions.defaultIntensity;
    const intensityMultiplier =
        intensity === 'low' ? 0.6 : intensity === 'high' ? 1.4 : 1;

    const backgroundMode: BackgroundMode =
        slide.backgroundMode ?? sliderOptions.defaultBackgroundMode ?? 'normal';

    // ──────────────────────────────────────────────
    // Parallax mouse tracking
    // ──────────────────────────────────────────────

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 40, damping: 15 });
    const springY = useSpring(mouseY, { stiffness: 40, damping: 15 });

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!sliderOptions.parallax) return;
            const x =
                (e.clientX / window.innerWidth - 0.5) *
                40 *
                intensityMultiplier;
            const y =
                (e.clientY / window.innerHeight - 0.5) *
                40 *
                intensityMultiplier;
            mouseX.set(x);
            mouseY.set(y);
        },
        [intensityMultiplier, mouseX, mouseY, sliderOptions.parallax],
    );

    const getBackgroundMotion = useCallback(() => {
        switch (backgroundMode) {
            case 'parallax':
                return { x: springX, y: springY };
            case '3d':
                return { rotateY: springX, rotateX: springY };
            case 'cinematic':
                return { scale: 1.1 };
            default:
                return {};
        }
    }, [backgroundMode, springX, springY]);

    // ──────────────────────────────────────────────
    // Slide direction & animation variants
    // ──────────────────────────────────────────────

    const slideDirection: SlideDirection =
        slide.direction ?? sliderOptions.defaultDirection ?? 'left';

    const getVariants = useCallback(() => {
        if (slideDirection === 'fade') {
            return {
                enter: { opacity: 0 },
                center: { opacity: 1 },
                exit: { opacity: 0 },
            };
        }

        const offset = slideDirection === 'left' ? 1000 : -1000;

        return {
            enter: { x: direction > 0 ? offset : -offset, opacity: 0 },
            center: { x: 0, opacity: 1 },
            exit: { x: direction > 0 ? -offset : offset, opacity: 0 },
        };
    }, [slideDirection, direction]);

    const variants = getVariants();

    // ──────────────────────────────────────────────
    // Navigation
    // ──────────────────────────────────────────────

    const next = useCallback(() => {
        if (slides.length === 0) return;
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slides.length);
        setProgress(0);
        startTime.current = performance.now();
    }, [slides.length]);

    const prev = useCallback(() => {
        if (slides.length === 0) return;
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
        setProgress(0);
        startTime.current = performance.now();
    }, [slides.length]);

    const goTo = useCallback(
        (index: number) => {
            if (slides.length === 0) return;
            setDirection(index > current ? 1 : -1);
            setCurrent(index);
            setProgress(0);
            startTime.current = performance.now();
        },
        [current, slides.length],
    );

    // ──────────────────────────────────────────────
    // Duration logic
    // ──────────────────────────────────────────────

    const getDuration = useCallback(() => {
        if (slide.media.type === 'video' && videoRef.current?.duration) {
            return videoRef.current.duration * 1000;
        }
        return slide.duration ?? 6000;
    }, [slide]);

    // ──────────────────────────────────────────────
    // Auto-advance timer (images / YouTube)
    // ──────────────────────────────────────────────

    useEffect(() => {
        if (!isPlaying || slide.media.type === 'video' || slides.length === 0)
            return;

        const duration = getDuration();
        intervalRef.current = setInterval(next, duration);

        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const elapsed = timestamp - startTime.current;
            const percent = Math.min(elapsed / duration, 1);
            setProgress(percent);

            if (percent < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (animationRef.current)
                cancelAnimationFrame(animationRef.current);
        };
    }, [
        current,
        isPlaying,
        next,
        slide.media.type,
        getDuration,
        slides.length,
    ]);

    // ──────────────────────────────────────────────
    // Video progress & events
    // ──────────────────────────────────────────────

    useEffect(() => {
        if (slide.media.type !== 'video' || !videoRef.current) return;

        const video = videoRef.current;

        const onTimeUpdate = () => {
            if (video.duration) {
                setProgress(video.currentTime / video.duration);
            }
        };

        const onEnded = () => next();

        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('ended', onEnded);

        return () => {
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('ended', onEnded);
        };
    }, [current, next, slide.media.type]);

    // ──────────────────────────────────────────────
    // Play/Pause control for video & YouTube
    // ──────────────────────────────────────────────

    useEffect(() => {
        if (slide.media.type === 'video' && videoRef.current) {
            if (isPlaying) {
                videoRef.current.play().catch(() => {});
            } else {
                videoRef.current.pause();
            }
        }

        if (slide.media.type === 'youtube' && ytRef.current?.contentWindow) {
            // YouTube IFrame API command
            ytRef.current.contentWindow.postMessage(
                JSON.stringify({
                    event: 'command',
                    func: isPlaying ? 'playVideo' : 'pauseVideo',
                }),
                '*',
            );
        }
    }, [isPlaying, current, slide.media.type]);

    // ──────────────────────────────────────────────
    // Overlay class logic
    // ──────────────────────────────────────────────

    const overlayClass =
        slide.showOverlay === false
            ? ''
            : slide.overlayColor
              ? slide.overlayColor.includes('/') ||
                slide.overlayColor.startsWith('bg-')
                  ? slide.overlayColor
                  : `bg-[${slide.overlayColor}]`
              : 'bg-gradient-to-r from-black/80 via-black/50 to-transparent';

    // ──────────────────────────────────────────────
    // Render
    // ──────────────────────────────────────────────

    const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

    if (slides.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
                No slides available
            </div>
        );
    }

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
                        x: { type: 'spring', stiffness: 250, damping: 30 },
                        opacity: { duration: 0.3 },
                    }}
                    className="absolute inset-0"
                >
                    {/* Background / Media Layer */}
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
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="absolute inset-0 h-full w-full object-cover"
                            >
                                <source
                                    src={slide.media.mp4}
                                    type="video/mp4"
                                />
                            </video>
                        )}

                        {slide.media.type === 'youtube' && (
                            <iframe
                                ref={ytRef}
                                className="absolute inset-0 h-full w-full"
                                src={`https://www.youtube-nocookie.com/embed/${slide.media.videoId}?enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=${slide.media.videoId}&controls=0&rel=0&modestbranding=1&origin=${window.location.origin}`}
                                allow="autoplay; encrypted-media; fullscreen"
                                title="Background YouTube video"
                            />
                        )}

                        {slide.showOverlay !== false && (
                            <div
                                className={`absolute inset-0 ${overlayClass}`}
                            />
                        )}
                    </motion.div>

                    {/* Content */}
                    <div className="relative z-10 flex h-full items-center">
                        <div className="mx-auto w-full max-w-7xl px-6">
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="mb-6 text-5xl font-bold text-white md:text-6xl lg:text-7xl"
                            >
                                {slide.title}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-8 max-w-3xl text-xl text-gray-200 md:text-2xl"
                            >
                                {slide.tagline}
                            </motion.p>

                            {slide.highlights &&
                                slide.highlights.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="mb-10 flex flex-wrap gap-3"
                                    >
                                        {slide.highlights.map((h, i) => (
                                            <span
                                                key={i}
                                                className={`rounded-full px-4 py-2 text-sm font-semibold ${getHighlightClasses(h.variant)}`}
                                            >
                                                {h.text}
                                            </span>
                                        ))}
                                    </motion.div>
                                )}

                            {slide.action?.href && slide.action?.text && (
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
                                        href={slide.action.href}
                                        className={`group inline-flex items-center gap-3 rounded-lg px-8 py-4 text-lg font-semibold shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 ${
                                            slide.btn_cta
                                                ? slide.btn_cta
                                                : getCTAColorClasses(
                                                      slide.ctaColor ??
                                                          'primary',
                                                  )
                                        }`}
                                    >
                                        <span className="relative z-10">
                                            {slide.action.text}
                                        </span>
                                        <motion.span
                                            initial={{ x: 0 }}
                                            whileHover={{ x: 6 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 500,
                                            }}
                                            className="flex items-center"
                                        >
                                            <Play className="h-5 w-5" />
                                        </motion.span>
                                        <span className="absolute inset-0 rounded-lg bg-white opacity-0 transition group-hover:opacity-15" />
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <button
                onClick={prev}
                className="absolute top-1/2 left-4 z-30 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition hover:bg-black/60 md:left-8"
                aria-label="Previous slide"
            >
                <ChevronLeft size={32} />
            </button>

            <button
                onClick={next}
                className="absolute top-1/2 right-4 z-30 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition hover:bg-black/60 md:right-8"
                aria-label="Next slide"
            >
                <ChevronRight size={32} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-12 left-1/2 z-30 flex -translate-x-1/2 gap-3">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`h-3 rounded-full transition-all duration-300 ${
                            i === current
                                ? 'w-10 bg-white shadow-lg'
                                : 'w-3 bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>

            {/* Play/Pause + Progress Ring */}
            <div className="absolute bottom-20 left-1/2 z-30 -translate-x-1/2">
                <div className="relative h-14 w-14">
                    <svg width="56" height="56" className="-rotate-90">
                        <circle
                            cx="28"
                            cy="28"
                            r="26"
                            stroke="rgba(255,255,255,0.25)"
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
                            strokeDasharray={CIRCUMFERENCE}
                            animate={{ strokeDashoffset }}
                            strokeLinecap="round"
                            transition={{ duration: 0.2, ease: 'linear' }}
                        />
                    </svg>

                    <button
                        onClick={() => setIsPlaying((prev) => !prev)}
                        className="absolute inset-0 flex items-center justify-center text-white"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
