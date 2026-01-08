'use client';

import HeroSlider, { HeroSlide } from '@/components/Common/Hero/HeroSlider';
import Layout from '@/pages/web/tech-media/Layout/Layout';
import { ArrowRight, HelpCircle, Laptop, Monitor, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Team from '@/components/about/team/team';
import Testimonials from '@/components/about/testimonials/Testimonials';

const heroSlides: HeroSlide[] = [
    {
        image: '/assets/techmedia/repair.jpg',
        title: 'Custom Gaming PC Builds',
        description: 'High-performance gaming rigs built to your exact specifications. Experience ultimate gaming with quality components and expert assembly.',
        ctaPrimary: {
            text: 'Build Your PC',
            link: '/services',
        },
        ctaSecondary: {
            text: 'Our Services',
            link: '/services',
        },
    },
    {
        image: '/assets/techmedia/pc.jpg',
        title: 'Professional Computer Repairs',
        description: 'Fast and reliable repair services for all computer issues. Expert diagnostics, quality parts, and same-day service available.',
        ctaPrimary: {
            text: 'Get a Repair Quote',
            link: '/contact',
        },
        ctaSecondary: {
            text: 'Our Services',
            link: '/services',
        },
    },
    {
        image: '/assets/techmedia/repair.jpg',
        title: 'Quality Laptop Sales',
        description: 'New and refurbished laptops from top brands at competitive prices. Find the perfect laptop for work, study, or entertainment.',
        ctaPrimary: {
            text: 'Browse Laptops',
            link: '/services',
        },
        ctaSecondary: {
            text: 'Contact Us',
            link: '/contact',
        },
    },
];

const experts = [
    {
        id: 1,
        name: 'David Thompson',
        role: 'Chief Executive Officer',
        image: '/assets/team.jpg',
        bio: 'With 20+ years in the textile industry, David leads our vision for innovation and excellence.',
    },
    {
        id: 2,
        name: 'Jennifer Martinez',
        role: 'Head of Operations',
        image: '/assets/team.jpg',
        bio: 'Jennifer ensures seamless operations and maintains our commitment to quality standards.',
    },
    {
        id: 3,
        name: 'Robert Anderson',
        role: 'Technical Director',
        image: '/assets/team.jpg',
        bio: 'Robert drives our technical innovation and oversees product development initiatives.',
    },
    {
        id: 4,
        name: 'Lisa Wang',
        role: 'Customer Success Manager',
        image: '/assets/team.jpg',
        bio: 'Lisa ensures every client receives exceptional service and support throughout their journey.',
    },
];


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
const partners = [
    { id: 1, src: '/assets/partner.jpg', alt: 'Partner 1' },
    { id: 2, src: '/assets/partner.jpg', alt: 'Partner 2' },
    { id: 3, src: '/assets/partner.jpg', alt: 'Partner 3' },
    { id: 4, src: '/assets/partner.jpg', alt: 'Partner 4' },
    { id: 5, src: '/assets/partner.jpg', alt: 'Partner 5' },
    { id: 6, src: '/assets/partner.jpg', alt: 'Partner 6' },
];

export default function Home() {
    return (
        <Layout>
            <div>
                {/* Hero Slider */}
                <HeroSlider slides={heroSlides} autoPlayInterval={5000} />

                {/* Features Section */}
                <section className="py-20 px-4 md:px-[10%]">
                    <div className="container">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">What We Offer</h2>
                            <p className="text-lg text-muted-foreground">
                                Professional hardware solutions and expert technical services
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Laptop className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Laptop Sales</h3>
                                <p className="text-muted-foreground">
                                    New and refurbished laptops from top brands at competitive prices
                                </p>
                            </div>

                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Monitor className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Custom PC Builds</h3>
                                <p className="text-muted-foreground">
                                    Desktop PC assembly and customization tailored to your needs
                                </p>
                            </div>

                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Wrench className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Computer Repairs</h3>
                                <p className="text-muted-foreground">
                                    Fast and reliable repair services for all computer issues
                                </p>
                            </div>

                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <HelpCircle className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Hardware Consultation</h3>
                                <p className="text-muted-foreground">
                                    Expert advice to help you choose the right hardware
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Hardware Showcase */}
                <section className="bg-muted/30 py-20 px-4 md:px-[10%]">
                    <div className="container">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                            <div className="flex flex-col justify-center space-y-6">
                                <h2 className="text-3xl font-bold md:text-4xl">Quality Hardware, Expert Service</h2>
                                <p className="text-lg text-muted-foreground">
                                    Whether you need a new laptop for work, a custom gaming PC, or repairs for your existing computer, Techmedia has you covered. We work with leading brands and use quality components to ensure reliability and performance.
                                </p>
                                <p className="text-lg text-muted-foreground">
                                    Our experienced technicians provide professional diagnostics, repairs, and upgrades. We also offer software development and IT support services to meet all your technology needs.
                                </p>
                                <div>
                                    <Button asChild>
                                        <a href="/portfolio">
                                            View Our Work <ArrowRight className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-4">
                                <img
                                    src="/assets/techmedia/repair.jpg"
                                    alt="Custom PC Build"
                                    className="rounded-lg shadow-lg"
                                />
                                <img
                                    src="/assets/techmedia/pc.jpg"
                                    alt="Laptop Repair Service"
                                    className="rounded-lg shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <Team TeamMember={experts} title={"Meet Our Experts"} description={" The talented professionals driving innovation and excellence at Texties Company."} />

                {/* Partners Section */}
                <section className="bg-muted/30 py-16 md:py-24 px-4 md:px-[10%]">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                                Our Trusted Partners
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Proud to collaborate with industry leaders who
                                share our commitment to excellence.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
                            {partners.map((partner) => (
                                <div
                                    key={partner.id}
                                    className="flex items-center justify-center rounded-lg bg-background p-6 transition-shadow hover:shadow-md"
                                >
                                    <img
                                        src={partner.src}
                                        alt={partner.alt}
                                        className="h-auto w-full max-w-[120px] object-contain opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* Testimonials Section */}
                <Testimonials testimonials={testimonials} />

                {/* CTA Section */}
                <section className="bg-primary/5 py-20">
                    <div className="container">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                Need Computer Sales or Repair Services?
                            </h2>
                            <p className="mb-8 text-lg text-muted-foreground">
                                Contact us today for expert advice, competitive pricing, and reliable service
                            </p>
                            <Button asChild size="lg">
                                <a href="/contact">
                                    Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
