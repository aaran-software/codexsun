'use client';

import TestimonialCard from '@/components/blocks/testimonials/TestimonialCard';


const testimonials = [
    {
        id: 1,
        name: 'Sarah Johnson',
        company: 'Fashion Forward Inc.',
        text: 'Texties Company has been our trusted partner for over 5 years. Their quality and reliability are unmatched in the industry.',
        rating: 5,
    },
    {
        id: 2,
        name: 'Michael Chen',
        company: 'Global Textiles Ltd.',
        text: 'The innovation and attention to detail that Texties brings to every project is exceptional. Highly recommended!',
        rating: 5,
    },
    {
        id: 3,
        name: 'Emily Rodriguez',
        company: 'Sustainable Fabrics Co.',
        text: 'Working with Texties has transformed our business. Their expertise and customer service are second to none.',
        rating: 5,
    },
];

export default function Testimonial() {
    return (
        <TestimonialCard testimonials={testimonials} />
    );
}
