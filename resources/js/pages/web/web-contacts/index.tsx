import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';

import WebLayout from '@/layouts/web-layout';
import FooterCard from '@/components/blocks/footers/FooterCard';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import CtaSection from '@/pages/web/home/blocks/cta';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

export default function Contact() {
    return (
        <WebLayout>
            <Head title="Contact Us" />

            {/* reCAPTCHA */}
            <script
                src="https://www.google.com/recaptcha/api.js"
                async
                defer
            />

            <MenuBackdrop
                image="/assets/techmedia/contact-hero.jpg"
                title="Contact Tech Media"
                subtitle="Trusted computer repair & IT solutions since 2002"
            />

            {/* About */}
            <motion.section
                className="px-4 py-16 md:px-[10%]"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
            >
                <div className="container max-w-4xl space-y-6">
                    <h2 className="text-3xl font-bold">About Tech Media</h2>
                    <p className="text-lg text-muted-foreground">
                        Tech Media is a trusted technology solutions company
                        based in Tirupur, Tamil Nadu, delivering reliable IT
                        services, computer hardware solutions, and business
                        software support to growing businesses.
                    </p>
                    <p className="text-lg text-muted-foreground">
                        We help organizations streamline operations, improve
                        productivity, and scale confidently through the right
                        mix of hardware, software, and IT consulting.
                    </p>
                </div>
            </motion.section>

            {/* Trust Badges */}
            <section className="px-4 py-10 md:px-[10%]">
                <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        'Since 2002',
                        'AMC Support',
                        'Certified Technicians',
                        'Business-Focused IT',
                    ].map((item, index) => (
                        <motion.div
                            key={item}
                            className="rounded-xl border bg-background p-6 text-center shadow-sm"
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                        >
                            <p className="text-lg font-semibold">{item}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Contact + Form */}
            <section className="px-4 py-20 bg-muted/30 md:px-[10%]">
                <div className="container grid gap-12 lg:grid-cols-2">
                    {/* Contact Info */}
                    <motion.div
                        className="space-y-6"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold">Get in Touch</h2>

                        <div className="text-muted-foreground">
                            <p className="font-medium text-foreground">📍 Address</p>
                            <p>
                                436,<br />
                                Avinashi Road,<br />
                                Near CITU Office,<br />
                                Tiruppur,<br />
                                Tamil Nadu – 641602
                            </p>
                        </div>

                        <div>
                            <p className="font-medium">✉️ Email</p>
                            <a
                                href="mailto:support@techmedia.in"
                                className="underline underline-offset-4 text-muted-foreground hover:text-foreground"
                            >
                                support@techmedia.in
                            </a>
                        </div>

                        {/* Phone + WhatsApp */}
                        <div className="flex gap-4 pt-2">
                            <a
                                href="tel:+919999999999"
                                className="rounded-lg bg-primary px-6 py-3 text-primary-foreground shadow hover:opacity-90"
                            >
                                📞 Call Us
                            </a>
                            <a
                                href="https://wa.me/919999999999"
                                target="_blank"
                                className="rounded-lg border px-6 py-3 shadow hover:bg-muted"
                            >
                                💬 WhatsApp
                            </a>
                        </div>

                        {/* Working Hours */}
                        <div className="rounded-xl border bg-background p-6 shadow-sm">
                            <h3 className="text-xl font-semibold mb-2">
                                🕒 Working Hours
                            </h3>
                            <p className="text-muted-foreground">
                                <strong>Mon – Sat:</strong> 9:30 AM – 7:30 PM
                            </p>
                            <p className="text-muted-foreground">
                                <strong>Sunday:</strong> Closed
                            </p>

                            <div className="mt-4">
                                <h4 className="font-semibold">🎉 Holidays</h4>
                                <p className="text-sm text-muted-foreground">
                                    Closed on major public holidays and regional
                                    festivals.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.form
                        className="space-y-4 rounded-xl border bg-background p-6 shadow-sm"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h3 className="text-2xl font-semibold">
                            Send Us a Message
                        </h3>

                        <input
                            type="text"
                            placeholder="Your Name"
                            className="w-full rounded-md border px-4 py-3"
                            required
                        />

                        <input
                            type="email"
                            placeholder="Your Email"
                            className="w-full rounded-md border px-4 py-3"
                            required
                        />

                        <input
                            type="text"
                            placeholder="Subject"
                            className="w-full rounded-md border px-4 py-3"
                        />

                        <textarea
                            placeholder="Your Message"
                            rows={4}
                            className="w-full rounded-md border px-4 py-3"
                            required
                        />

                        {/*/!* reCAPTCHA *!/*/}
                        {/*<div*/}
                        {/*    className="g-recaptcha"*/}
                        {/*    data-sitekey="YOUR_RECAPTCHA_SITE_KEY"*/}
                        {/*/>*/}

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground shadow hover:opacity-90"
                        >
                            Send Message
                        </button>
                    </motion.form>
                </div>
            </section>

            {/* Google Maps */}
            <motion.section
                className="px-4 py-20 md:px-[10%]"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="container">
                    <h2 className="text-3xl font-bold mb-6">Find Us</h2>
                    <div className="overflow-hidden rounded-xl border shadow-sm">
                        <iframe
                            src="https://www.google.com/maps?q=Avinashi%20Road%20Tiruppur&output=embed"
                            className="h-[400px] w-full"
                            loading="lazy"
                        />
                    </div>
                </div>
            </motion.section>

            <CtaSection />
            <FooterCard />
        </WebLayout>
    );
}
