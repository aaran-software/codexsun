import { Head } from '@inertiajs/react';
import WebLayout from '@/layouts/web-layout';
import FooterCard from '@/components/blocks/footers/FooterCard';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import CtaSection from '@/pages/web/home/blocks/cta';

export default function Contact() {
    return (
        <WebLayout>
            <Head title="Contact Us" />

            <MenuBackdrop
                image="/assets/techmedia/contact-hero.jpg"
                title="Contact Tech Media"
                subtitle="Trusted computer repair & IT solutions since 2002"
            />

            {/* About */}
            <section className="px-4 py-20 md:px-[10%]">
                <div className="container max-w-4xl space-y-6">
                    <h2 className="text-3xl font-bold">About Tech Media</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Tech Media is a trusted technology solutions company
                        based in Tirupur, Tamil Nadu, delivering reliable IT
                        services, computer hardware solutions, and business
                        software support to growing businesses. Since our
                        inception, we have focused on one simple goal — making
                        technology work smoothly for businesses.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        We help organizations streamline operations, improve
                        productivity, and scale confidently through the right
                        mix of hardware, software, and IT consulting.
                    </p>
                </div>
            </section>

            {/* Contact Details */}
            <section className="px-4 py-20 bg-muted/30 md:px-[10%]">
                <div className="container grid gap-12 lg:grid-cols-2 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">
                            Get in Touch
                        </h2>

                        <div className="space-y-2 text-lg text-muted-foreground">
                            <p className="font-medium text-foreground">
                                📍 Address
                            </p>
                            <p>
                                436,<br />
                                Avinashi Road,<br />
                                Near CITU Office,<br />
                                Tiruppur,<br />
                                Tamil Nadu – 641602
                            </p>
                        </div>

                        <div className="space-y-2 text-lg text-muted-foreground">
                            <p className="font-medium text-foreground">
                                ✉️ Email
                            </p>
                            <p>
                                <a
                                    href="mailto:support@techmedia.in"
                                    className="underline underline-offset-4 hover:text-foreground"
                                >
                                    support@techmedia.in
                                </a>
                            </p>
                        </div>

                        <p className="text-sm text-muted-foreground pt-4">
                            Trusted computer repair center since <strong>2002</strong>.
                        </p>
                    </div>

                    <div>
                        <img
                            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
                            alt="Tech Media office and support team"
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                </div>
            </section>

            <CtaSection />
            <FooterCard />
        </WebLayout>
    );
}
