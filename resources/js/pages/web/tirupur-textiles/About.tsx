'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Globe, TrendingUp, Heart, Lightbulb } from 'lucide-react';
import "../../../../css/textiles.css"
import Team from '@/components/about/team/team';
import ChainProcess from '@/components/about/history/ChainProcess';
import Layout from '@/pages/web/tirupur-textiles/Layout/Layout';
import Counter from '@/components/Common/counter';

const values = [
    {
        icon: Award,
        title: 'Excellence',
        description: 'We strive for excellence in every aspect of our work, from product quality to customer service.',
    },
    {
        icon: Heart,
        title: 'Integrity',
        description: 'We conduct business with honesty, transparency, and ethical practices at all times.',
    },
    {
        icon: Lightbulb,
        title: 'Innovation',
        description: 'We embrace innovation and continuously seek new ways to improve and evolve our offerings.',
    },
    {
        icon: Users,
        title: 'Collaboration',
        description: 'We believe in the power of teamwork and building strong partnerships with our clients.',
    },
];

const milestones = [
    {
        year: '2005',
        title: 'Company Founded',
        description: 'Texties Company was established with a vision to revolutionize the textile industry.',
    },
    {
        year: '2010',
        title: 'Global Expansion',
        description: 'Expanded operations internationally, serving clients across three continents.',
    },
    {
        year: '2015',
        title: 'Innovation Award',
        description: 'Received the Industry Innovation Award for groundbreaking textile technology.',
    },
    {
        year: '2020',
        title: 'Sustainability Initiative',
        description: 'Launched comprehensive sustainability program, reducing environmental impact by 40%.',
    },
    {
        year: '2025',
        title: 'Industry Leader',
        description: 'Recognized as a global leader in textile solutions with 500+ satisfied clients worldwide.',
    },
];

const stats = [
    { icon: Users, value: 500, suffix: "+", label: "Happy Clients" },
    { icon: Globe, value: 50, suffix: "+", label: "Countries Served" },
    { icon: Award, value: 25, suffix: "+", label: "Industry Awards" },
    { icon: TrendingUp, value: 20, suffix: "+", label: "Years Experience" },
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
                            About Texties Company
                        </h1>
                        <p className="mx-auto max-w-3xl text-lg text-white/90 md:text-xl">
                            For over two decades, we've been at the forefront of
                            textile innovation, delivering exceptional quality
                            and service to clients worldwide.
                        </p>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="border-b border-border/40 bg-background py-12">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">

                                    {/* Icon */}
                                    <div className="mb-3 flex justify-center">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <stat.icon className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>

                                    {/* Counter */}
                                    <Counter value={stat.value} suffix={stat.suffix} />

                                    {/* Label */}
                                    <div className="text-sm text-muted-foreground md:text-base">
                                        {stat.label}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* Our Story Section */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
                            <div>
                                <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
                                    Our Story
                                </h2>
                                <div className="space-y-4 text-lg text-muted-foreground">
                                    <p>
                                        Founded in 2005, Texties Company began
                                        with a simple yet powerful vision: to
                                        transform the textile industry through
                                        innovation, quality, and unwavering
                                        commitment to customer success.
                                    </p>
                                    <p>
                                        What started as a small operation has
                                        grown into a global leader, serving
                                        clients across 50 countries and
                                        employing over 200 dedicated
                                        professionals. Our journey has been
                                        marked by continuous innovation,
                                        strategic partnerships, and an
                                        unrelenting focus on excellence.
                                    </p>
                                    <p>
                                        Today, we stand proud as an industry
                                        pioneer, combining traditional
                                        craftsmanship with cutting-edge
                                        technology to deliver textile solutions
                                        that exceed expectations. Our commitment
                                        to sustainability, quality, and customer
                                        satisfaction remains at the heart of
                                        everything we do.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="relative h-full w-full overflow-hidden rounded-lg">
                                    <img
                                        src="/assets/about.jpg"
                                        alt="Our Story"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="bg-muted/30 py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                                Our Core Values
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                The principles that guide our decisions, shape
                                our culture, and define who we are as a company.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {values.map((value, index) => (
                                <Card
                                    key={index}
                                    className="border-border/50 text-center transition-shadow hover:shadow-lg"
                                >
                                    <CardContent className="p-6">
                                        <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4">
                                            <value.icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold">
                                            {value.title}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {value.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <ChainProcess milestones={milestones} title={ "Our Journey"} description={" Key milestones that have shaped our growth and success over the years."} />

                {/* Team Section */}
                <Team TeamMember={experts} title={"Meet Our Experts"} description={" The talented professionals driving innovation and excellence at Texties Company."} />

            </div>

        </Layout>
    );
}
