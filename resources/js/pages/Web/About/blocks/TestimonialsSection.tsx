// resources/js/pages/web/home/blocks/TestimonialsSection.tsx

"use client"

import Autoplay from "embla-carousel-autoplay"
import { Star } from "lucide-react"
import * as React from "react"
import FadeUp from "@/components/blocks/animate/fade-up"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import type { TestimonialsData } from "@/lib/tenant/about.types"

interface TestimonialsSectionProps {
    testimonials?: TestimonialsData | null
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    )

    if (!testimonials || !testimonials.items?.length) return null

    const { heading, subheading, items } = testimonials

    return (
        <section className="bg-gray-50 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center mb-12">
                    <FadeUp>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {heading}
                        </h2>
                    </FadeUp>

                    {subheading && (
                        <FadeUp delay={0.1}>
                            <p className="mt-4 text-lg text-gray-600">
                                {subheading}
                            </p>
                        </FadeUp>
                    )}
                </div>

                <Carousel
                    plugins={[plugin.current]}
                    className="w-full"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {items.map((testimonial, index) => (
                            <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                                <div className="p-1 h-full">
                                    <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6 flex flex-col h-full">
                                            <div className="flex mb-5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                                                    />
                                                ))}
                                            </div>

                                            <blockquote className="flex-1 text-gray-700 leading-relaxed mb-6 italic">
                                                "{testimonial.quote}"
                                            </blockquote>

                                            <div className="flex items-center gap-4 mt-auto">
                                                {testimonial.avatar ? (
                                                    <img
                                                        src={testimonial.avatar}
                                                        alt={testimonial.name}
                                                        className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600 flex-shrink-0">
                                                        {testimonial.name.charAt(0)}
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {testimonial.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {testimonial.role} • {testimonial.company}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <CarouselPrevious className="-left-2 md:-left-12" />
                    <CarouselNext className="-right-2 md:-right-12" />
                </Carousel>
            </div>
        </section>
    )
}
