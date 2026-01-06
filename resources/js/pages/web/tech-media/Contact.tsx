'use client';

import Layout from '@/pages/web/tech-media/Layout/Layout';
import PageHero from '@/components/Common/Hero/PageHero';
import ContactForm from '@/components/contact/ContactForm';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

interface CompanyInfo{
    address:string;
    phone:string;
    email:string
}

interface Props{
    companyInfo:CompanyInfo
}

export default function Contact({companyInfo}:Props) {
    return (
        <Layout>
            <div>
                {/* Hero Section */}
                <PageHero
                    image="/assets/techmedia/repair.jpg"
                    title="Contact Us"
                    subtitle="Get in touch with our team. We're here to help with your technology needs."
                />

                {/* Contact Section */}
                <section className="py-20">
                    <div className="px-4 md:px-[10%]">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                            {/* Contact Form */}
                            <div>
                                <h2 className="mb-6 text-2xl font-bold">Send us a Message</h2>
                                <ContactForm />
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="mb-6 text-2xl font-bold">Contact Information</h2>

                                        <div className="space-y-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                                    <MapPin className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 font-semibold">Address</h3>
                                                    <p className="text-muted-foreground">{companyInfo?.address}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                                    <Phone className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 font-semibold">Phone</h3>
                                                    <p className="text-muted-foreground">{companyInfo?.phone}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                                    <Mail className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 font-semibold">Email</h3>
                                                    <p className="text-muted-foreground">{companyInfo?.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                                    <Clock className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 font-semibold">Business Hours</h3>
                                                    <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                                                    <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM</p>
                                                    <p className="text-muted-foreground">Sunday: Closed</p>
                                                </div>
                                            </div>
                                        </div>
                                </div>

                                {/* Map Placeholder */}
                                <div>
                                    <h2 className="mb-6 text-2xl font-bold">Location</h2>
                                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1841!2d-73.98823492346618!3d40.74844097138558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Company Location"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
