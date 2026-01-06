'use client';

import PageHero from '@/components/Common/Hero/PageHero';
import Layout from '@/pages/web/tech-media/Layout/Layout';
import { Award, Target, TrendingUp, Users } from 'lucide-react';

export default function About() {
    return (
        <Layout>
            <div>
                {/* Hero Section */}
                <PageHero
                    image="/assets/techmedia/repair.jpg"
                    title="About Techmedia"
                    subtitle="Your trusted partner for computer sales, repairs, and hardware solutions"
                />

                {/* Mission Section */}
                <section className="py-20 px-4 md:px-[10%]">
                    <div className="container">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                            <div>
                                <img
                                    src="/assets/techmedia/repair.jpg"
                                    alt="Laptop Repair Service"
                                    className="rounded-lg shadow-lg"
                                />
                            </div>
                            <div className="flex flex-col justify-center space-y-6">
                                <h2 className="text-3xl font-bold md:text-4xl">Our Mission</h2>
                                <p className="text-lg text-muted-foreground">
                                    To provide reliable computer hardware solutions and expert repair services.

                                    We combine technical expertise with a customer-first approach to deliver reliable hardware solutions and expert repair services. Whether you need a new laptop, a custom PC build, or professional repairs, we're your trusted local technology partner.
                                </p>
                                <p className="text-lg text-muted-foreground">
                                    We combine technical expertise with a customer-first approach to deliver reliable hardware solutions and expert repair services. Whether you need a new laptop, a custom PC build, or professional repairs, we're your trusted local technology partner.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="bg-muted/30 py-20 px-4 md:px-[10%]">
                    <div className="container">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Our Values</h2>
                            <p className="text-lg text-muted-foreground">
                                The principles that guide everything we do
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-4 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Target className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Quality</h3>
                                <p className="text-muted-foreground">
                                    We use quality components and provide expert service that exceeds expectations
                                </p>
                            </div>

                            <div className="space-y-4 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Customer Focus</h3>
                                <p className="text-muted-foreground">
                                    Working closely with customers to understand and meet their unique needs
                                </p>
                            </div>

                            <div className="space-y-4 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Award className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Reliability</h3>
                                <p className="text-muted-foreground">
                                    Dependable service and honest advice you can trust
                                </p>
                            </div>

                            <div className="space-y-4 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <TrendingUp className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Expertise</h3>
                                <p className="text-muted-foreground">
                                    Staying current with the latest hardware and technologies
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-20 px-4 md:px-[10%]">
                    <div className="container">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                            <div className="flex flex-col justify-center space-y-6">
                                <h2 className="text-3xl font-bold md:text-4xl">Expert Team</h2>
                                <p className="text-lg text-muted-foreground">
                                    Our team consists of experienced hardware specialists, repair technicians, and IT professionals who are passionate about technology and committed to your satisfaction.
                                </p>
                                <p className="text-lg text-muted-foreground">
                                    With years of combined experience in computer sales, repairs, and custom builds, we bring deep technical knowledge and practical expertise to every customer interaction.
                                </p>
                            </div>
                            <div>
                                <img
                                    src="/assets/techmedia/pc.jpg"
                                    alt="Custom PC Build"
                                    className="rounded-lg shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
