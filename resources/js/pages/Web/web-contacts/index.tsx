'use client';

import { motion } from 'framer-motion';
import FooterCard from '@/components/blocks/footers/FooterCard';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import { useCurrentTenant } from '@/lib/tenant';
import CallToAction from '@/pages/web/home/blocks/cta/CallToAction';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
};

export default function Contact() {
    const { company, location } = useCurrentTenant();

    // const tenant = useCurrentTenant();
    // console.log('Current Tenant Slug:', tenant?.slug || 'default (fallback)');
    // console.log('Display Name:', tenant?.displayName);

    if (!company || !location) return null;

    const fullAddress =
        company.address1 +
        ', ' +
        company.address2 +
        ', ' +
        company.city +
        ' ' +
        company.state +
        ' ' +
        company.pinCode;

    return (
        <>
            <WebLayout>
                <MenuBackdrop
                    image="/assets/techmedia/contact-hero.jpg"
                    title="Get In Touch"
                    subtitle="We're here to help you with all your IT needs"
                />

                <section className="bg-muted/30 px-4 py-20 md:px-[10%]">
                    <div className="container mx-auto grid gap-12 lg:grid-cols-2">
                        {/* Contact Info */}
                        <motion.div
                            className="space-y-8"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <div>
                                <h2 className="text-4xl font-bold tracking-tight text-foreground">
                                    Let's Connect
                                </h2>
                                <p className="mt-3 text-lg text-muted-foreground">
                                    Have questions? Need support? We're just a
                                    message away.
                                </p>
                            </div>

                            {/* Address */}
                            <div>
                                <p className="font-semibold text-foreground">
                                    📍 Visit Our Store
                                </p>
                                <p className="mt-2 leading-relaxed text-muted-foreground">
                                    {fullAddress}
                                </p>
                            </div>

                            {/* Contact Details */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <p className="font-semibold text-foreground">
                                        📧 Email
                                    </p>
                                    <a
                                        href={`mailto:${company.email}`}
                                        className="text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {company.email}
                                    </a>
                                </div>

                                <div>
                                    <p className="font-semibold text-foreground">
                                        📞 Call Us
                                    </p>
                                    <a
                                        href={`tel:${company.mobile1}`}
                                        className="text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {company.mobile1}
                                    </a>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <a
                                href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 rounded-xl bg-green-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-green-700"
                            >
                                💬 Chat on WhatsApp
                            </a>

                            {/* Working Hours */}
                            <div className="rounded-2xl border bg-card p-6">
                                <h3 className="mb-4 text-lg font-semibold">
                                    🕒 Working Hours
                                </h3>
                                {location.timings.map((time, i) => (
                                    <p
                                        key={i}
                                        className="text-muted-foreground"
                                    >
                                        <strong>{time.day}:</strong>{' '}
                                        {time.hours}
                                    </p>
                                ))}
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.form
                            className="rounded-2xl border bg-card p-8 shadow-sm"
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <h3 className="mb-6 text-2xl font-semibold">
                                Send Us a Message
                            </h3>

                            <div className="space-y-5">
                                <input
                                    type="text"
                                    placeholder="Your Full Name"
                                    className="focus:bg-primary/3 focus:outline-none w-full rounded-xl border px-5 py-4 focus:border-primary"
                                    required
                                />

                                <input
                                    type="email"
                                    placeholder="Your Email Address"
                                    className="focus:bg-primary/3 focus:outline-none w-full rounded-xl border px-5 py-4 focus:border-primary"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Subject"
                                    className="w-full rounded-xl border px-5 py-4 focus:border-primary focus:bg-primary/3 focus:outline-none"
                                />

                                <textarea
                                    placeholder="How can we help you today?"
                                    rows={6}
                                    className="focus:bg-primary/3 focus:outline-none w-full resize-y rounded-xl border px-5 py-4 focus:border-primary"
                                    required
                                />

                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-black py-4 text-lg font-semibold text-white transition-colors hover:bg-gray-900"
                                >
                                    Send Message
                                </button>
                            </div>
                        </motion.form>
                    </div>
                </section>

                {/* Map */}
                <section className="px-4 py-20 md:px-[10%]">
                    <div className="container mx-auto">
                        <h2 className="mb-6 text-3xl font-bold">
                            Find Us Here
                        </h2>
                        <div className="overflow-hidden rounded-2xl border shadow-lg">
                            <iframe
                                src={location.map.embedUrl}
                                className="h-105 w-full"
                                loading="lazy"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </section>

                <CallToAction />
                <FooterCard />
            </WebLayout>
        </>
    );
}
