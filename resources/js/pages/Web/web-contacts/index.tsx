'use client';

import { motion } from 'framer-motion';
import FooterCard from '@/components/blocks/footers/FooterSection';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import type {
    CallToActionData,
    CompanyData,
    FooterData,
    HeroData,
    LocationData,
} from '@/lib/tenant/types';
import HeroSection from '@/pages/Web/Home/blocks/HeroSection';
import CallToAction from '../Home/blocks/CallToAction';

interface ContactPageProps {
    company?: CompanyData;
    location?: LocationData;
    callToAction?: CallToActionData;
    footer?: FooterData;
    hero?: HeroData;
}

export default function Contact({
    company = {} as CompanyData,
    location = {} as LocationData,
    callToAction,
    footer,
    hero
}: ContactPageProps) {
    // Company safe destructuring
    const {
        address1 = '',
        address2 = '',
        city = '',
        state = '',
        pinCode = '',
        email = 'contact@example.com',
        mobile1 = '',
        whatsapp = '',
    } = company;

    // Location safe destructuring with realistic defaults
    const {
        timings = [
            { day: 'Monday – Saturday', hours: '9:00 AM – 8:00 PM' },
            { day: 'Sunday', hours: '10:00 AM – 4:00 PM' },
        ],
        map = { embedUrl: '' },
        address: locationAddress = '',
    } = location;

    // Use location.address if available, otherwise compose from company
    const displayAddress = locationAddress.trim()
        ? locationAddress
        : [address1, address2, city, state, pinCode].filter(Boolean).join(', ');

    const cleanWhatsApp = whatsapp.replace(/\D/g, '') || '';
    const cleanPhone = mobile1.replace(/\D/g, '') || '';

    const hasMap = !!map.embedUrl;

    return (
        <WebLayout>
            <MenuBackdrop
                image="/assets/techmedia/images/services-hero.jpg"
                title="Get In Touch"
                subtitle="We're here to help you with all your IT needs"
            />

            <HeroSection hero={hero}/>

            <section className="bg-muted/30 px-4 py-20 md:px-[10%]">
                <div className="container mx-auto grid gap-12 lg:grid-cols-2">
                    {/* Contact Info */}
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
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

                        <div>
                            <p className="font-semibold text-foreground">
                                📍 Visit Our Store
                            </p>
                            <p className="mt-2 leading-relaxed whitespace-pre-line text-muted-foreground">
                                {displayAddress || 'Address not available'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <p className="font-semibold text-foreground">
                                    📧 Email
                                </p>
                                <a
                                    href={`mailto:${email}`}
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {email}
                                </a>
                            </div>

                            <div>
                                <p className="font-semibold text-foreground">
                                    📞 Call Us
                                </p>
                                <a
                                    href={
                                        cleanPhone ? `tel:${cleanPhone}` : '#'
                                    }
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {mobile1 || 'Not available'}
                                </a>
                            </div>
                        </div>

                        {cleanWhatsApp && (
                            <a
                                href={`https://wa.me/${cleanWhatsApp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 rounded-xl bg-green-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-green-700"
                            >
                                💬 Chat on WhatsApp
                            </a>
                        )}

                        <div className="rounded-2xl border bg-card p-6">
                            <h3 className="mb-4 text-lg font-semibold">
                                🕒 Working Hours
                            </h3>
                            <div className="space-y-1.5">
                                {timings.map((time, i) => (
                                    <p
                                        key={i}
                                        className="text-muted-foreground"
                                    >
                                        <strong>{time.day}:</strong>{' '}
                                        {time.hours}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.form
                        className="rounded-2xl border bg-card p-8 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h3 className="mb-6 text-2xl font-semibold">
                            Send Us a Message
                        </h3>

                        <div className="space-y-5">
                            <input
                                type="text"
                                placeholder="Your Full Name"
                                className="w-full rounded-xl border px-5 py-4 transition-all focus:border-primary focus:bg-primary/5 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                required
                            />

                            <input
                                type="email"
                                placeholder="Your Email Address"
                                className="w-full rounded-xl border px-5 py-4 transition-all focus:border-primary focus:bg-primary/5 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                required
                            />

                            <input
                                type="text"
                                placeholder="Subject"
                                className="w-full rounded-xl border px-5 py-4 transition-all focus:border-primary focus:bg-primary/5 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            />

                            <textarea
                                placeholder="How can we help you today?"
                                rows={6}
                                className="w-full resize-y rounded-xl border px-5 py-4 transition-all focus:border-primary focus:bg-primary/5 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                required
                            />

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-black py-4 text-lg font-semibold text-white transition-all hover:bg-gray-900 active:scale-[0.98]"
                            >
                                Send Message
                            </button>
                        </div>
                    </motion.form>
                </div>
            </section>

            {/* Map Section */}
            {hasMap && (
                <section className="px-4 py-20 md:px-[10%]">
                    <div className="container mx-auto">
                        <h2 className="mb-6 text-3xl font-bold">
                            Find Us Here
                        </h2>
                        <div className="overflow-hidden rounded-2xl border shadow-lg">
                            <iframe
                                src={map.embedUrl}
                                className="h-100 w-full md:h-125"
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </section>
            )}

            <CallToAction CallToAction={callToAction} />
            <FooterCard footer={footer} company={company} />
        </WebLayout>
    );
}
