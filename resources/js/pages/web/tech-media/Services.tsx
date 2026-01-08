'use client';

import Layout from '@/pages/web/tech-media/Layout/Layout';
import PageHero from '@/components/Common/Hero/PageHero';
import ServiceCard from '@/components/service/ServiceCard';
import { Users } from 'lucide-react';

export default function Services() {
    const services=[
        {
            title:"Laptop Sales",
            description:"New and refurbished laptops from leading brands. We help you find the perfect laptop for work, study, or entertainment at competitive prices.",
            icon: Users
        },
        {
            title:"Desktop PC Assembly",
            description:"Custom desktop PC builds tailored to your needs. From gaming rigs to workstations, we assemble high-performance systems with quality components.",
            icon: Users
        },
        {
            title:"Computer Repairs",
            description:"Professional diagnostics and repairs for all computer issues. Fast turnaround, quality parts, and expert service you can trust",
            icon: Users
        },
        {
            title:"Hardware Consultation",
            description:"Expert advice on hardware selection and upgrades. We help you make informed decisions based on your requirements and budget.",
            icon: Users
        },
    ]

    const secondaryServices=[
        {
            title:"Software Development",
            description:"Custom software solutions tailored to your business needs. We build scalable, secure applications using modern technologies.",
            icon: Users
        },
        {
            title:"IT Support",
            description:"Technical support and maintenance services. Our team ensures your systems run smoothly with proactive monitoring and rapid response.",
            icon: Users
        },
        {
            title:"CCTV Installation",
            description:"Professional security camera systems installation and configuration. Protect your premises with high-quality surveillance solutions.",
            icon: Users
        },
    ]
    return (
        <Layout>
            <div>
                {/* Hero Section */}
                <PageHero
                    image="/assets/techmedia/repair.jpg"
                    title="Our Services"
                    subtitle="Professional computer sales, repairs, and hardware solutions with expert technical support"
                />

                <ServiceCard
                    title={'Hardware Services'}
                    description={'Our core expertise in computer sales, repairs, and hardware solutions'}
                    services={services}
                    className={"grid grid-cols-1 sm:grid-col-2 lg:grid-cols-4"}

                />

                {/* Hardware Showcase */}
                <section className="bg-muted/30 py-20">
                    <div className="container">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                Quality Hardware Components
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                We work with trusted brands and use quality
                                components
                            </p>
                        </div>
                        <div className="mx-auto max-w-4xl">
                            <img
                                src="/assets/techmedia/hardware.jpg"
                                alt="Hardware Components"
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                </section>


                <ServiceCard
                    title={'Additional Services'}
                    description={'Supporting services to meet all your technology needs'}
                    services={secondaryServices}
                />

            </div>
        </Layout>
    );
}
