'use client';

import FooterSection from '@/pages/web/home/FooterSection';
import Header from '@/components/header/header';
import "../../../../css/textiles.css"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Scissors,
    Palette,
    Truck,
    Shield,
    Zap,
    CheckCircle2,
    ArrowRight,
    Package,
    Settings,
    Sparkles,
    Target, Users
} from 'lucide-react';

const services = [
    {
        icon: Scissors,
        title: 'Custom Textile Manufacturing',
        description:
            'Tailored textile production solutions designed to meet your specific requirements, from concept to final product.',
        features: [
            'Custom fabric design and development',
            'Flexible production volumes',
            'Quality control at every stage',
            'Fast turnaround times',
        ],
    },
    {
        icon: Palette,
        title: 'Design & Consultation',
        description:
            'Expert design services and strategic consultation to bring your textile vision to life with precision and creativity.',
        features: [
            'Professional design team',
            'Trend analysis and forecasting',
            'Material selection guidance',
            'Prototype development',
        ],
    },
    {
        icon: Package,
        title: 'Quality Assurance',
        description:
            'Comprehensive quality control processes ensuring every product meets the highest industry standards and specifications.',
        features: [
            'Rigorous testing protocols',
            'ISO certified processes',
            'Detailed quality reports',
            'Continuous improvement programs',
        ],
    },
    {
        icon: Truck,
        title: 'Logistics & Distribution',
        description:
            'Efficient supply chain management and distribution services ensuring timely delivery to any location worldwide.',
        features: [
            'Global shipping network',
            'Real-time tracking',
            'Warehousing solutions',
            'Customs clearance support',
        ],
    },
    {
        icon: Settings,
        title: 'Technical Support',
        description:
            'Ongoing technical assistance and support to ensure optimal performance and satisfaction with our textile solutions.',
        features: [
            '24/7 customer support',
            'Technical documentation',
            'Training and workshops',
            'Maintenance guidance',
        ],
    },
    {
        icon: Sparkles,
        title: 'Sustainable Solutions',
        description:
            'Eco-friendly textile options and sustainable practices that reduce environmental impact without compromising quality.',
        features: [
            'Organic and recycled materials',
            'Carbon-neutral production',
            'Waste reduction programs',
            'Sustainability certifications',
        ],
    },
];

const processSteps = [
    {
        icon: Users,
        title: 'Initial Consultation',
        description: 'We meet with you to understand your needs, goals, and project requirements in detail.',
    },
    {
        icon: Target,
        title: 'Strategy Development',
        description: 'Our team creates a customized plan tailored to your specific objectives and timeline.',
    },
    {
        icon: Settings,
        title: 'Implementation',
        description: 'We execute the plan with precision, maintaining quality standards throughout the process.',
    },
    {
        icon: CheckCircle2,
        title: 'Quality Assurance',
        description: 'Rigorous testing and inspection ensure every deliverable meets our high standards.',
    },
    {
        icon: Truck,
        title: 'Delivery & Support',
        description: 'Timely delivery followed by ongoing support to ensure your complete satisfaction.',
    },
];

const benefits = [
    'Industry-leading expertise and experience',
    'State-of-the-art manufacturing facilities',
    'Competitive pricing without compromising quality',
    'Flexible solutions for businesses of all sizes',
    'Commitment to sustainability and ethical practices',
    'Proven track record of successful projects',
];
const navItems = [
    { name: 'Home', href: '/tirupur-textiles' },
    { name: 'About', href: '/tirupur-textiles/about' },
    { name: 'Services', href: '/tirupur-textiles/services' },
    { name: 'Blogs', href: '/blog/web/articles' },
    { name: 'Contact', href: '/tirupur-textiles/contact' },
];
export default function About() {
    return (
        <>
            <Header navItems={navItems}/>

            <div className="flex flex-col">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary to-secondary py-16 md:py-24">
                    <div className="container mx-auto px-4 text-center md:px-6">
                        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                            Our Services
                        </h1>
                        <p className="mx-auto max-w-3xl text-lg text-white/90 md:text-xl">
                            Comprehensive textile solutions designed to meet your unique business needs and exceed your expectations.
                        </p>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">What We Offer</h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                A complete range of services to support your textile needs from concept to delivery.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {services.map((service, index) => (
                                <Card key={index} className="border-border/50 transition-shadow hover:shadow-lg">
                                    <CardHeader>
                                        <div className="mb-4 inline-flex rounded-lg bg-primary/10 w-max p-3">
                                            <service.icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <CardTitle className="text-2xl">{service.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 text-muted-foreground">{service.description}</p>
                                        <ul className="space-y-2">
                                            {service.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start text-sm">
                                                    <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Process Section */}
                <section className="bg-muted/30 py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Our Service Process</h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                A proven methodology that ensures successful outcomes for every project.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
                            {processSteps.map((step, index) => (
                                <div key={index} className="relative text-center">
                                    <div className="mb-4 flex justify-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                                            <step.icon className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                    {index < processSteps.length - 1 && (
                                        <div className="absolute right-0 top-8 hidden h-0.5 w-full bg-gradient-to-r from-primary to-secondary lg:block" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
                            <div>
                                <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">Why Choose Our Services</h2>
                                <p className="mb-6 text-lg text-muted-foreground">
                                    When you partner with Texties Company, you gain access to industry-leading expertise, cutting-edge
                                    technology, and a commitment to excellence that sets us apart.
                                </p>
                                <ul className="space-y-3">
                                    {benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircle2 className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                                            <span className="text-muted-foreground">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8">
                                    <a className="bg-primary text-primary-foreground py-2 px-4 w-max flex items-center"  href={"/tirupur-textiles/contact"}>
                                        Request a Quote
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <Card className="border-border/50">
                                    <CardContent className="p-6 text-center">
                                        <Zap className="mx-auto mb-3 h-10 w-10 text-primary" />
                                        <div className="mb-1 text-3xl font-bold text-primary">99.8%</div>
                                        <div className="text-sm text-muted-foreground">On-Time Delivery</div>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/50">
                                    <CardContent className="p-6 text-center">
                                        <Shield className="mx-auto mb-3 h-10 w-10 text-primary" />
                                        <div className="mb-1 text-3xl font-bold text-primary">100%</div>
                                        <div className="text-sm text-muted-foreground">Quality Guaranteed</div>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/50">
                                    <CardContent className="p-6 text-center">
                                        <Users className="mx-auto mb-3 h-10 w-10 text-primary" />
                                        <div className="mb-1 text-3xl font-bold text-primary">500+</div>
                                        <div className="text-sm text-muted-foreground">Satisfied Clients</div>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/50">
                                    <CardContent className="p-6 text-center">
                                        <Target className="mx-auto mb-3 h-10 w-10 text-primary" />
                                        <div className="mb-1 text-3xl font-bold text-primary">20+</div>
                                        <div className="text-sm text-muted-foreground">Years Experience</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-gradient-to-r from-primary to-secondary py-16 md:py-24">
                    <div className="container mx-auto px-4 text-center md:px-6 flex justify-center flex-col items-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                            Ready to Get Started?
                        </h2>
                        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
                            Let's discuss how our services can help you achieve your textile goals and drive your business forward.
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

            <FooterSection/>
        </>
    );
}
