import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HeroSlide {
    image: string;
    title: string;
    description: string;
    ctaPrimary?: {
        text: string;
        link: string;
    };
    ctaSecondary?: {
        text: string;
        link: string;
    };
}

interface HeroSliderProps {
    slides: HeroSlide[];
    autoPlayInterval?: number;
}

export default function HeroSlider({ slides, autoPlayInterval = 5000 }: HeroSliderProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);


    const handleNext = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const handlePrev = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const goToSlide = (index: number) => {
        if (isTransitioning || index === currentSlide) return;
        setIsTransitioning(true);
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 500);
    };
    useEffect(() => {
        const timer = setInterval(() => {
            handleNext();
        }, autoPlayInterval);

        return () => clearInterval(timer);
    }, [currentSlide, autoPlayInterval]);

    return (
        <section className="relative h-[600px] overflow-hidden">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 px-4 md:px-[10%] ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="container relative z-10 flex h-full items-center">
                        <div className="max-w-2xl space-y-6 text-white">
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                                {slide.title}
                            </h1>
                            <p className="text-lg md:text-xl opacity-90">
                                {slide.description}
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                {slide.ctaPrimary && (
                                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                                        <a href={slide.ctaPrimary.link}>
                                            {slide.ctaPrimary.text}
                                        </a>
                                    </Button>
                                )}
                                {slide.ctaSecondary && (
                                    <Button asChild variant="outline" size="lg" className="border-white text-foreground hover:bg-white/10">
                                        <a href={slide.ctaSecondary.link}>
                                            {slide.ctaSecondary.text}
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
                aria-label="Next slide"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transition-all ${
                            index === currentSlide
                                ? 'w-8 bg-white'
                                : 'w-2 bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
