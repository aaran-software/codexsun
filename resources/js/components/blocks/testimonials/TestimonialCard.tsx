import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {Card, CardContent } from '@/components/ui/card';

interface testimonialsData{
    id:number
    name:string
    company:string
    text:string
    rating:number
}
interface TestimonialsProps{
    testimonials:testimonialsData[]
}

export default function TestimonialCard({ testimonials }:TestimonialsProps){
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const nextTestimonial = () => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };
    return(
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                        What Our Clients Say
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Don't just take our word for it. Hear from the
                        businesses we've helped succeed.
                    </p>
                </div>
                <div className="relative mx-auto max-w-4xl">
                    <Card className="border-border/50">
                        <CardContent className="p-8 md:p-12">
                            <div className="mb-6 flex justify-center">
                                {[
                                    ...Array(
                                        testimonials[currentTestimonial]
                                            .rating,
                                    ),
                                ].map((_, i) => (
                                    <svg
                                        key={i}
                                        className="h-6 w-6 fill-primary text-primary"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                ))}
                            </div>
                            <blockquote className="mb-6 text-center text-lg text-foreground italic md:text-xl">
                                "{testimonials[currentTestimonial].text}
                                "
                            </blockquote>
                            <div className="text-center">
                                <p className="font-semibold">
                                    {
                                        testimonials[currentTestimonial]
                                            .name
                                    }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {
                                        testimonials[currentTestimonial]
                                            .company
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="mt-6 flex justify-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prevTestimonial}
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={nextTestimonial}
                            aria-label="Next testimonial"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
