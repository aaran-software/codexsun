'use client';
import "../../../../css/textiles.css"
import { Card, CardContent } from '@/components/ui/card';
import FooterSection from '@/pages/web/home/FooterSection';
import Header from '@/components/header/header';
import {
    ArrowRight,
    Award,
    CheckCircle2,
    Shield,
    Target,
    TrendingUp,
    Users, Zap
} from 'lucide-react';
import Testimonials from '@/components/about/testimonials/Testimonials';
import ProcessStep from '@/components/about/history/ProcessStep';
import Team from '@/components/about/team/team';
// import FullScreenSlider from '@/pages/web/slider';


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

const whyChooseUs = [
    {
        icon: Award,
        title: 'Industry Excellence',
        description: 'Award-winning quality and innovation recognized globally in the textile industry.',
    },
    {
        icon: Users,
        title: 'Expert Team',
        description: 'Dedicated professionals with decades of combined experience in textile solutions.',
    },
    {
        icon: TrendingUp,
        title: 'Proven Results',
        description: 'Track record of delivering exceptional outcomes for clients across industries.',
    },
    {
        icon: Shield,
        title: 'Quality Assurance',
        description: 'Rigorous quality control processes ensuring the highest standards in every project.',
    },
    {
        icon: Zap,
        title: 'Fast Delivery',
        description: 'Efficient processes and logistics ensuring timely delivery without compromising quality.',
    },
    {
        icon: Target,
        title: 'Custom Solutions',
        description: 'Tailored approaches designed to meet your specific business needs and objectives.',
    },
];

const processSteps = [
    {
        number: '01',
        title: 'Consultation',
        description: 'We begin by understanding your unique requirements and business objectives.',
    },
    {
        number: '02',
        title: 'Planning',
        description: 'Our team develops a comprehensive strategy tailored to your specific needs.',
    },
    {
        number: '03',
        title: 'Execution',
        description: 'We implement the solution with precision, maintaining quality at every step.',
    },
    {
        number: '04',
        title: 'Delivery',
        description: 'Your project is delivered on time, meeting all specifications and standards.',
    },
];


export default function Home() {

    const navItems = [
        { name: 'Home', href: '/tirupur-textiles' },
        { name: 'About', href: '/tirupur-textiles/about' },
        { name: 'Services', href: '/tirupur-textiles/services' },
        { name: 'Blogs', href: '/blog/web/articles' },
        { name: 'Contact', href: '/tirupur-textiles/contact' },
    ];
    return (
        <>
            <Header navItems={navItems} companyName={"Tirupur Textiles"}/>

            <div className="flex flex-col">
                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/assets/hero.jpg"
                            alt="Hero Background"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/80 to-foreground/60" />
                    </div>
                    <div className="relative z-10 container mx-auto px-4 py-24 md:px-6 md:py-32 lg:py-40">
                        <div className="max-w-3xl space-y-6">
                            <h1 className="text-4xl font-bold tracking-tight text-background sm:text-5xl md:text-6xl lg:text-7xl">
                                Transforming Textiles,{' '}
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Elevating Excellence
                                </span>
                            </h1>
                            <p className="text-lg text-background/70 md:text-xl">
                                Leading the industry with innovative textile
                                solutions, unmatched quality, and a commitment
                                to your success. Partner with us to experience
                                the difference.
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <a
                                    className="gradient-primary text-base"
                                    href={'/tirupur-texties/contact'}
                                >
                                    Get Started Today
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </a>
                                <a
                                    href={'/tirupur-texties/services'}
                                    className="text-base"
                                >
                                    Explore Services
                                </a>
                            </div>
                        </div>
                    </div>
                </section>


                {/*<FullScreenSlider />*/}

                {/* Why Choose Us Section */}
                <section className="bg-muted/30 py-16 md:py-24 px-4 md:px-[10%]">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                                Why Choose Texties
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Discover what sets us apart and makes us the
                                preferred choice for textile solutions
                                worldwide.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {whyChooseUs.map((item, index) => (
                                <Card
                                    key={index}
                                    className="border-border/50 transition-shadow hover:shadow-lg"
                                >
                                    <CardContent className="p-6">
                                        <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                                            <item.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold">
                                            {item.title}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <Testimonials testimonials={testimonials} />

                {/* Our Process Section */}
                <section className="bg-muted/30 py-16 md:py-24 px-4 md:px-[10%]">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                                Our Process
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                A streamlined approach designed to deliver
                                exceptional results every time.
                            </p>
                        </div>
                       <ProcessStep processSteps={processSteps} />
                    </div>
                </section>

                {/* Experts Section */}
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

                {/* Mission & Vision Section */}
                <section className="py-16 md:py-24 px-4 md:px-[10%]">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                            <div>
                                <div className="mb-6 inline-flex rounded-lg bg-primary/10 p-3">
                                    <Target className="h-8 w-8 text-primary" />
                                </div>
                                <h2 className="mb-4 text-3xl font-bold tracking-tight">
                                    Our Mission
                                </h2>
                                <p className="mb-4 text-lg text-muted-foreground">
                                    To deliver innovative textile solutions that
                                    exceed expectations, combining cutting-edge
                                    technology with traditional craftsmanship to
                                    create products of exceptional quality.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <CheckCircle2 className="mt-1 mr-2 h-5 w-5 flex-shrink-0 text-primary" />
                                        <span className="text-muted-foreground">
                                            Maintain the highest standards of
                                            quality in every product
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle2 className="mt-1 mr-2 h-5 w-5 flex-shrink-0 text-primary" />
                                        <span className="text-muted-foreground">
                                            Foster long-term partnerships built
                                            on trust and reliability
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle2 className="mt-1 mr-2 h-5 w-5 flex-shrink-0 text-primary" />
                                        <span className="text-muted-foreground">
                                            Drive innovation through continuous
                                            research and development
                                        </span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <div className="mb-6 inline-flex rounded-lg bg-secondary/10 p-3">
                                    <TrendingUp className="h-8 w-8 text-secondary" />
                                </div>
                                <h2 className="mb-4 text-3xl font-bold tracking-tight">
                                    Our Vision
                                </h2>
                                <p className="mb-4 text-lg text-muted-foreground">
                                    To be the global leader in textile
                                    innovation, recognized for our commitment to
                                    sustainability, excellence, and transforming
                                    the industry through groundbreaking
                                    solutions.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <CheckCircle2 className="mt-1 mr-2 h-5 w-5 flex-shrink-0 text-secondary" />
                                        <span className="text-muted-foreground">
                                            Lead the industry in sustainable and
                                            eco-friendly practices
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle2 className="mt-1 mr-2 h-5 w-5 flex-shrink-0 text-secondary" />
                                        <span className="text-muted-foreground">
                                            Expand our global reach while
                                            maintaining personalized service
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle2 className="mt-1 mr-2 h-5 w-5 flex-shrink-0 text-secondary" />
                                        <span className="text-muted-foreground">
                                            Set new benchmarks for quality and
                                            innovation in textiles
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-primary to-secondary py-16 md:py-24">
                    <div className="container mx-auto px-4 text-center md:px-6 flex justify-center flex-col items-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                            Ready to Transform Your Business?
                        </h2>
                        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
                            Join hundreds of satisfied clients who have elevated
                            their textile operations with Texties Company.
                        </p>
                        <a
                            href={"/tirupur-texties/contact"}
                            className="text-base bg-primary text-primary-foreground py-3 px-6 flex gap-3 w-max rounded-3xl"

                        >
                            Contact Us Today
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </a>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <FooterSection />
        </>
    );
}
