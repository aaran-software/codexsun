import { Head } from '@inertiajs/react';
import { Award, Target, TrendingUp, Users } from 'lucide-react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import CtaSection from '@/pages/web/home/blocks/cta';

export default function index() {
    return (
        <WebLayout>
            <Head title="About us" />

            <MenuBackdrop
                image="/assets/techmedia/repair.jpg"
                title="About Tech Media"
                subtitle="Trusted technology solutions company based in Tirupur"
            />

            {/* Mission Section */}
            <section className="px-4 py-20 md:px-[10%]">
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
                            <h2 className="text-3xl font-bold md:text-4xl">
                                IT Services & Solutions We Do
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Tech Media is a trusted technology solutions
                                company based in Tirupur, Tamil Nadu, delivering
                                reliable IT services, computer hardware
                                solutions, and business software support to
                                growing businesses. Since our inception, we have
                                focused on one simple goal — making technology
                                work smoothly for businesses, <br/>
                                We help organizations streamline operations, improve
                                productivity, and scale confidently through the
                                right mix of hardware, software, and IT
                                consulting.
                            </p>
                            <p className="text-lg text-muted-foreground">
                                We combine technical expertise with a
                                customer-first approach to deliver reliable
                                hardware solutions and expert repair services.
                                Whether you need a new laptop, a custom PC
                                build, or professional repairs, we're your
                                trusted local technology partner.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-muted/30 px-4 py-20 md:px-[10%]">
                <div className="container">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                            Our Values
                        </h2>
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
                                We use quality components and provide expert
                                service that exceeds expectations
                            </p>
                        </div>

                        <div className="space-y-4 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold">
                                Customer Focus
                            </h3>
                            <p className="text-muted-foreground">
                                Working closely with customers to understand and
                                meet their unique needs
                            </p>
                        </div>

                        <div className="space-y-4 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Award className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold">
                                Reliability
                            </h3>
                            <p className="text-muted-foreground">
                                Dependable service and honest advice you can
                                trust
                            </p>
                        </div>

                        <div className="space-y-4 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <TrendingUp className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold">Expertise</h3>
                            <p className="text-muted-foreground">
                                Staying current with the latest hardware and
                                technologies
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="px-4 py-20 md:px-[10%]">
                <div className="container">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <div className="flex flex-col justify-center space-y-6">
                            <h2 className="text-3xl font-bold md:text-4xl">
                                Our Expert Team
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                We’re a dedicated team of hardware specialists, repair
                                technicians, and IT professionals who genuinely love
                                technology and take pride in delivering reliable solutions.
                            </p>
                            <p className="text-lg text-muted-foreground">
                                With years of hands-on experience in computer sales,
                                diagnostics, repairs, and custom builds, we combine deep
                                technical expertise with a customer-first approach—so you
                                always get solutions you can trust.
                            </p>
                        </div>
                        <div>
                            <img
                                src="/assets/techmedia/pc.jpg"
                                alt="Our technical team working on custom PC builds"
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>


            <CtaSection />

            <FooterCard />
        </WebLayout>
    );
}
