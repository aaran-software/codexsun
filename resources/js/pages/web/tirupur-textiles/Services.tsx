'use client';
import Layout from '@/pages/web/tirupur-textiles/Layout/Layout';

import "../../../../css/textiles.css"
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
import ServiceCard from '@/components/service/ServiceCard';
import { Card, CardContent } from '@/components/ui/card';
import ProcessIcon from '@/components/service/Processicon';

const services = [
    {
        icon: Scissors,
        title: 'Custom Manufacturing',
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
export default function About() {
    return (
        <Layout>

            <div className="flex flex-col">
                {/* Hero Section */}
                <section className="py-16 md:py-24 relative">
                    <img src={"/assets/hero.jpg"} alt={"about page hero image"} className={"absolute inset-0 w-full h-full object-cover"} />
                    <div className={"absolute inset-0 bg-gradient-to-br from-primary/70 to-secondary/70 "} />
                    <div className="relative container mx-auto px-4 text-center md:px-6 z-10">
                        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                            Our Services
                        </h1>
                        <p className="mx-auto max-w-3xl text-lg text-white/90 md:text-xl">
                            Comprehensive textile solutions designed to meet your unique business needs and exceed your expectations.
                        </p>
                    </div>
                </section>
                <div className={"px-4 md:px-[10%]"}>
                    <ServiceCard services={services} title={"What We Offer"} description={"A complete range of services to support your textile needs from concept to delivery."}/>

                </div>

                {/* Process Section */}
                <ProcessIcon processSteps={processSteps} title={'Our Service Process'} description={"A proven methodology that ensures successful outcomes for every project."} />

                {/* Benefits Section */}
                <section className="py-16 md:py-24 px-4 md:px-[10%]">
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

        </Layout>
    );
}
