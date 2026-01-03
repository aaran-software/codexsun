'use client';

import FooterSection from '@/pages/web/home/FooterSection';
import Header from '@/components/header/header';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Globe, TrendingUp, Heart, Lightbulb } from 'lucide-react';
import "../../../../css/textiles.css"

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
    { icon: Users, value: '500+', label: 'Happy Clients' },
    { icon: Globe, value: '50+', label: 'Countries Served' },
    { icon: Award, value: '25+', label: 'Industry Awards' },
    { icon: TrendingUp, value: '20+', label: 'Years Experience' },
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
                            About Texties Company
                        </h1>
                        <p className="mx-auto max-w-3xl text-lg text-white/90 md:text-xl">
                            For over two decades, we've been at the forefront of textile innovation, delivering exceptional quality and
                            service to clients worldwide.
                        </p>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="border-b border-border/40 bg-background py-12">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="mb-3 flex justify-center">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <stat.icon className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>
                                    <div className="mb-1 text-3xl font-bold text-primary md:text-4xl">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground md:text-base">{stat.label}</div>
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
                                <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">Our Story</h2>
                                <div className="space-y-4 text-lg text-muted-foreground">
                                    <p>
                                        Founded in 2005, Texties Company began with a simple yet powerful vision: to transform the textile
                                        industry through innovation, quality, and unwavering commitment to customer success.
                                    </p>
                                    <p>
                                        What started as a small operation has grown into a global leader, serving clients across 50 countries
                                        and employing over 200 dedicated professionals. Our journey has been marked by continuous innovation,
                                        strategic partnerships, and an unrelenting focus on excellence.
                                    </p>
                                    <p>
                                        Today, we stand proud as an industry pioneer, combining traditional craftsmanship with cutting-edge
                                        technology to deliver textile solutions that exceed expectations. Our commitment to sustainability,
                                        quality, and customer satisfaction remains at the heart of everything we do.
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
                            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Our Core Values</h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                The principles that guide our decisions, shape our culture, and define who we are as a company.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {values.map((value, index) => (
                                <Card key={index} className="border-border/50 text-center transition-shadow hover:shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4">
                                            <value.icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold">{value.title}</h3>
                                        <p className="text-muted-foreground">{value.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline Section */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Our Journey</h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Key milestones that have shaped our growth and success over the years.
                            </p>
                        </div>
                        <div className="relative mx-auto max-w-4xl">
                            <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-primary via-secondary to-primary md:left-1/2" />
                            <div className="space-y-12">
                                {milestones.map((milestone, index) => (
                                    <div
                                        key={index}
                                        className={`relative flex items-center ${
                                            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}
                                    >
                                        <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                                            <Card className="border-border/50">
                                                <CardContent className="p-6">
                                                    <div className="mb-2 text-2xl font-bold text-primary">{milestone.year}</div>
                                                    <h3 className="mb-2 text-xl font-semibold">{milestone.title}</h3>
                                                    <p className="text-muted-foreground">{milestone.description}</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <div className="
  absolute
  top-0 left-4
  flex h-8 w-8 items-center justify-center
  rounded-full bg-gradient-to-br from-primary to-secondary
  md:left-1/2 md:-translate-x-1/2
">
                                            <div className="h-3 w-3 rounded-full bg-white" />
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="bg-muted/30 py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Leadership Team</h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Meet the experienced professionals leading Texties Company into the future.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    name: 'David Thompson',
                                    role: 'Chief Executive Officer',
                                    image: '/assets/team.jpg',
                                },
                                {
                                    name: 'Jennifer Martinez',
                                    role: 'Head of Operations',
                                    image: '/assets/team.jpg',
                                },
                                {
                                    name: 'Robert Anderson',
                                    role: 'Technical Director',
                                    image: '/assets/team.jpg',
                                },
                                {
                                    name: 'Lisa Wang',
                                    role: 'Customer Success Manager',
                                    image: '/assets/team.jpg',
                                },
                            ].map((member, index) => (
                                <Card key={index} className="overflow-hidden border-border/50 transition-shadow hover:shadow-lg py-0">
                                    <div className="aspect-square overflow-hidden">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="h-full w-full object-cover transition-transform hover:scale-105"
                                        />
                                    </div>
                                    <CardContent className="p-6 text-center">
                                        <h3 className="mb-1 text-xl font-semibold">{member.name}</h3>
                                        <p className="text-sm font-medium text-primary">{member.role}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
            {/* Footer */}
            <FooterSection/>
        </>
    );
}
